import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { logo } = await request.json();
    const orgId = params.id;

    // Check if user has permission to update this organization
    const membership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        orgId: orgId,
        role: { in: ["OWNER", "MANAGER"] }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update organization logo
    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: { logo },
      select: {
        id: true,
        name: true,
        logo: true
      }
    });

    return NextResponse.json(updatedOrg);
  } catch (error) {
    console.error("Error updating organization logo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
