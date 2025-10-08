import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 401 }
      );
    }

    const { email, firstName, lastName, organizationName, name, image } = await request.json();

    if (!email || !firstName || !lastName || !organizationName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // User exists, update their organization if it's not set
      if (!user.organization) {
        user = await prisma.user.update({
          where: { email },
          data: {
            organization: organizationName,
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            name: name || user.name,
            image: image || user.image,
          },
        });
      }
    } else {
      // Create new user with OAuth info
      user = await prisma.user.create({
        data: {
          email,
          name: name || `${firstName} ${lastName}`,
          firstName,
          lastName,
          organization: organizationName,
          image,
          emailVerified: new Date(), // OAuth users are considered verified
        },
      });
    }

    // Ensure organization exists in the database
    let org = await prisma.organization.findFirst({
      where: { name: organizationName }
    });

    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: organizationName,
        }
      });
    }

    console.log(`✅ OAuth signup completed for ${email} with organization: ${organizationName}`);

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organization: user.organization
      }
    });

  } catch (error) {
    console.error('OAuth signup error:', error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
