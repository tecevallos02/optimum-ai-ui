import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const prisma = new PrismaClient();

// GET /api/orgs - List user's organizations
export async function GET() {
  try {
    const user = await requireUser();

    const memberships = await prisma.membership.findMany({
      where: { userId: user.id },
      include: { org: true },
      orderBy: { org: { createdAt: "asc" } },
    });

    const orgs = memberships.map((m) => ({
      id: m.org.id,
      name: m.org.name,
      role: m.role,
      createdAt: m.org.createdAt,
    }));

    return NextResponse.json({ orgs });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/orgs - Create new organization
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 },
      );
    }

    // Create organization and owner membership in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: body.name.trim(),
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          orgId: org.id,
          role: "OWNER",
        },
      });

      return org;
    });

    // Log audit event
    await logAudit("org:created", user.id, result.id, result.id);

    return NextResponse.json({
      id: result.id,
      name: result.name,
      role: "OWNER",
      createdAt: result.createdAt,
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 },
    );
  }
}
