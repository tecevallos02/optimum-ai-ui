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
    const userData = await prisma.user.findFirst({
      where: { id: user.id }
    }) as any;
    
    if (!userData) {
      return NextResponse.json(null, { status: 200 });
    }

    // Get the actual organization data from the Organization table
    let orgs: any[] = [];
    if (userData.organization) {
      const org = await prisma.organization.findFirst({
        where: { name: userData.organization }
      }) as any;
      
      if (org) {
        orgs = [{
          id: org.id,
          name: org.name,
          role: 'OWNER',
          logo: org.logo,
          createdAt: org.createdAt,
        }];
      } else {
        // Fallback if organization doesn't exist in Organization table
        orgs = [{
          id: 'user-org',
          name: userData.organization,
          role: 'OWNER',
          logo: null,
          createdAt: new Date(),
        }];
      }
    }

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
