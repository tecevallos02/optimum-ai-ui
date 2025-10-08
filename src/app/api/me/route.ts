import { NextResponse } from "next/server";
import { getCurrentUser, getCurrentOrgId } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(null, { status: 200 });
    }
    
    const currentOrgId = await getCurrentOrgId();
    
    // Get fresh membership data
    const memberships = await prisma.membership.findMany({
      where: { userId: user.id },
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
    
    // Find current role
    const currentMembership = memberships.find(m => m.orgId === currentOrgId);
    const role = currentMembership?.role || null;
    
    // If user has organizations but no current org is set, use the first one
    const effectiveCurrentOrgId = currentOrgId || (orgs.length > 0 ? orgs[0].id : null);
    const effectiveRole = role || (orgs.length > 0 ? orgs[0].role : null);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      orgs,
      currentOrgId: effectiveCurrentOrgId,
      role: effectiveRole,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(null, { status: 200 });
  }
}
