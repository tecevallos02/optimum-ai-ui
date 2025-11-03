/**
 * Admin Organizations API
 *
 * Allows admins to view and manage all organizations
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/organizations
 *
 * Get all organizations with stats
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // For now, proceed without auth check

    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            memberships: true,
            appointments: true,
            callLogs: true,
            contacts: true,
          },
        },
        retellConfig: {
          select: {
            id: true,
            isActive: true,
            retellPhoneNumber: true,
          },
        },
        n8nConfig: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      organizations,
      total: organizations.length,
    });
  } catch (error) {
    console.error("[Admin Organizations API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/organizations
 *
 * Create a new organization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 },
      );
    }

    const organization = await prisma.organization.create({
      data: {
        name: body.name,
        logo: body.logo,
        timezone: body.timezone || "UTC",
        businessHours: body.businessHours,
      },
    });

    return NextResponse.json({
      organization,
      message: "Organization created successfully",
    });
  } catch (error) {
    console.error("[Admin Organizations API] Error creating org:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 },
    );
  }
}
