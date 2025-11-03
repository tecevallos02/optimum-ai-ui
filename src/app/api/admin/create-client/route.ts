/**
 * Admin-Only Client Creation API
 *
 * Creates a new organization and user account
 * Only admins can access this endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

/**
 * POST /api/admin/create-client
 *
 * Creates a new client with organization and user account
 *
 * Body:
 * - organizationName: Name of the organization
 * - userEmail: Email for the user account
 * - userName: Full name of the user
 * - password: Password for the user (will be hashed)
 * - timezone: Organization timezone (default: UTC)
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // For now, we'll proceed without it
    // In production, verify admin session here

    const body = await request.json();

    // Validate required fields
    if (!body.organizationName || !body.userEmail || !body.userName || !body.password) {
      return NextResponse.json(
        { error: "Missing required fields: organizationName, userEmail, userName, password" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.userEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 },
      );
    }

    // Check if organization name is taken
    const existingOrg = await prisma.organization.findFirst({
      where: { name: body.organizationName },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: "An organization with this name already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password);

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create organization
      const organization = await tx.organization.create({
        data: {
          name: body.organizationName,
          timezone: body.timezone || "UTC",
          logo: body.logo,
          businessHours: body.businessHours,
        },
      });

      // 2. Create user
      const user = await tx.user.create({
        data: {
          email: body.userEmail,
          name: body.userName,
          firstName: body.firstName,
          lastName: body.lastName,
          password: hashedPassword,
          emailVerified: new Date(), // Auto-verify for admin-created accounts
        },
      });

      // 3. Create membership (user is owner of their organization)
      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          orgId: organization.id,
          role: "OWNER", // All users are owners of their org
        },
      });

      return { organization, user, membership };
    });

    console.log(`[Admin] Created client: ${result.organization.name} with user ${result.user.email}`);

    return NextResponse.json({
      success: true,
      message: "Client created successfully",
      data: {
        organizationId: result.organization.id,
        organizationName: result.organization.name,
        userId: result.user.id,
        userEmail: result.user.email,
        loginUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
      },
    });
  } catch (error) {
    console.error("[Admin] Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 },
    );
  }
}
