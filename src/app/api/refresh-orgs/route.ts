import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data with organization name from User table
    const userData = (await prisma.user.findFirst({
      where: { id: session.user.id },
    })) as any;

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the actual organization data from the Organization table
    let orgs: any[] = [];
    if (userData.organization) {
      const org = (await prisma.organization.findFirst({
        where: { name: userData.organization },
      })) as any;

      if (org) {
        orgs = [
          {
            id: org.id,
            name: org.name,
            role: "OWNER",
            logo: org.logo,
            createdAt: org.createdAt,
          },
        ];
      } else {
        // Fallback if organization doesn't exist in Organization table
        orgs = [
          {
            id: "user-org",
            name: userData.organization,
            role: "OWNER",
            logo: null,
            createdAt: new Date(),
          },
        ];
      }
    }

    const currentOrgId = orgs.length > 0 ? orgs[0].id : null;
    const role = orgs.length > 0 ? orgs[0].role : null;

    return NextResponse.json({
      success: true,
      orgs,
      currentOrgId,
      role,
    });
  } catch (error) {
    console.error("Error refreshing organizations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
