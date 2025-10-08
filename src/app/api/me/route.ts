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
    
    // Get user data with organization name from User table
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        organization: true,
      }
    });
    
    if (!userData) {
      return NextResponse.json(null, { status: 200 });
    }

    // Create a simple organization object from the user's organization field
    const orgs = userData.organization ? [{
      id: 'user-org',
      name: userData.organization,
      role: 'OWNER',
      logo: null,
      createdAt: new Date(),
    }] : [];

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
      orgs,
      currentOrgId: orgs.length > 0 ? orgs[0].id : null,
      role: orgs.length > 0 ? orgs[0].role : null,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(null, { status: 200 });
  }
}
