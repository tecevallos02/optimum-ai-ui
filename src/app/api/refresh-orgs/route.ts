import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data with organization name from User table
    const userData = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        organization: true,
      }
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create a simple organization object from the user's organization field
    const orgs = userData.organization ? [{
      id: 'user-org',
      name: userData.organization,
      role: 'OWNER',
      logo: null,
      createdAt: new Date(),
    }] : [];

    const currentOrgId = orgs.length > 0 ? orgs[0].id : null;
    const role = orgs.length > 0 ? orgs[0].role : null;

    return NextResponse.json({
      success: true,
      orgs,
      currentOrgId,
      role,
    });
  } catch (error) {
    console.error('Error refreshing organizations:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
