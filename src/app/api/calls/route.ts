// path: src/app/api/calls/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    
    // Get user's current organization
    const membership = await prisma.membership.findFirst({
      where: { userId: user.id },
      include: { org: true }
    });

    if (!membership) {
      return NextResponse.json(
        { error: "User not associated with any organization" },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const escalated = searchParams.get('escalated');

    // Build where clause
    const where: any = { orgId: membership.orgId };
    
    if (status) {
      where.status = status;
    }
    
    if (escalated !== null) {
      where.escalated = escalated === 'true';
    }

    // Fetch calls with pagination
    const calls = await prisma.call.findMany({
      where,
      include: {
        phoneNumber: {
          select: {
            friendlyName: true,
            phoneNumber: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.call.count({ where });

    return NextResponse.json({
      calls,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: "Failed to fetch calls" },
      { status: 500 }
    );
  }
}
