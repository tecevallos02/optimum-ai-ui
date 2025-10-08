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

    // Get fresh membership data
    const memberships = await prisma.membership.findMany({
      where: { userId: session.user.id },
      include: { org: true },
      orderBy: { org: { createdAt: 'asc' } },
    });

    const orgs = memberships.map(m => ({
      id: m.org.id,
      name: m.org.name,
      role: m.role,
      logo: m.org.logo,
      createdAt: m.org.createdAt,
    }));

    // If user has organizations but no current org is set, use the first one
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
