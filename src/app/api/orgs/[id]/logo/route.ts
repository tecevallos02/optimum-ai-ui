import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { logo } = await request.json();
    const { id: orgId } = await params;

    // Get user's organization name
    const userData = await prisma.user.findFirst({
      where: { id: session.user.id },
    });

    if (!userData?.organization) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 },
      );
    }

    // Find the organization by name (since we're using the new system)
    let org = await prisma.organization.findFirst({
      where: { name: userData.organization },
    });

    if (!org) {
      // Create organization if it doesn't exist
      org = await prisma.organization.create({
        data: {
          name: userData.organization,
        },
      });
    }

    // Update organization logo
    const updatedOrg = await prisma.organization.update({
      where: { id: org.id },
      data: { logo },
      select: {
        id: true,
        name: true,
        logo: true,
      },
    });

    return NextResponse.json(updatedOrg);
  } catch (error) {
    console.error("Error updating organization logo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
