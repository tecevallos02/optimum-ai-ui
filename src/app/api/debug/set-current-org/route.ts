import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organizations
    const memberships = await prisma.membership.findMany({
      where: { userId: session.user.id },
      include: { org: true },
      orderBy: { org: { createdAt: 'asc' } },
    });

    if (memberships.length === 0) {
      return NextResponse.json({ error: "No organizations found" }, { status: 404 });
    }

    // Set the first organization as current
    const firstOrg = memberships[0].org;
    const response = NextResponse.json({
      success: true,
      message: `Set current organization to: ${firstOrg.name}`,
      organization: {
        id: firstOrg.id,
        name: firstOrg.name,
        role: memberships[0].role
      }
    });

    // Set the currentOrgId cookie
    response.cookies.set('currentOrgId', firstOrg.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Error setting current organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
