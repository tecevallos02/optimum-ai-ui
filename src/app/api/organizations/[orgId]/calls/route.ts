/**
 * Organization Call Logs API
 *
 * Retrieve call logs for a specific organization
 * Supports filtering, pagination, and analytics
 *
 * Endpoints:
 * - GET /api/organizations/[orgId]/calls - List call logs with filters
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

/**
 * GET /api/organizations/[orgId]/calls
 *
 * Get call logs for an organization with filtering and pagination
 *
 * Query params:
 * - limit: Number of records to return (default: 50, max: 100)
 * - offset: Number of records to skip (default: 0)
 * - startDate: Filter calls after this date (ISO 8601)
 * - endDate: Filter calls before this date (ISO 8601)
 * - status: Filter by call status (COMPLETED, FAILED, etc.)
 * - intent: Filter by call intent (BOOKING, QUOTE, etc.)
 * - customerPhone: Filter by customer phone number
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await params;

    // Verify user has access to this organization
    const membership = await prisma.membership.findFirst({
      where: {
        userId: (session.user as any).id,
        orgId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10),
      100,
    );
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const intent = searchParams.get("intent");
    const customerPhone = searchParams.get("customerPhone");

    // Build where clause
    const where: any = {
      orgId,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (status) {
      where.status = status;
    }

    if (intent) {
      where.intent = intent;
    }

    if (customerPhone) {
      where.customerPhone = customerPhone;
    }

    // Get total count for pagination
    const totalCount = await prisma.callLog.count({ where });

    // Get call logs
    const callLogs = await prisma.callLog.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        callId: true,
        customerPhone: true,
        customerName: true,
        duration: true,
        status: true,
        intent: true,
        summary: true,
        sentiment: true,
        recordingUrl: true,
        timeSaved: true,
        costUSD: true,
        createdAt: true,
      },
    });

    // Calculate analytics for this org
    const analytics = await calculateCallAnalytics(orgId, where);

    return NextResponse.json({
      calls: callLogs,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      analytics,
    });
  } catch (error) {
    console.error("[Call Logs API] Error fetching calls:", error);
    return NextResponse.json(
      { error: "Failed to fetch call logs" },
      { status: 500 },
    );
  }
}

/**
 * Calculate call analytics for an organization
 */
async function calculateCallAnalytics(orgId: string, where: any) {
  try {
    // Get all calls matching filters
    const calls = await prisma.callLog.findMany({
      where,
      select: {
        duration: true,
        status: true,
        intent: true,
        timeSaved: true,
        costUSD: true,
      },
    });

    const totalCalls = calls.length;
    const totalDuration = calls.reduce((sum, call) => sum + call.duration, 0);
    const totalTimeSaved = calls.reduce(
      (sum, call) => sum + (call.timeSaved || 0),
      0,
    );
    const totalCost = calls.reduce(
      (sum, call) => sum + Number(call.costUSD || 0),
      0,
    );

    const avgCallDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;
    const avgTimeSaved = totalCalls > 0 ? totalTimeSaved / totalCalls : 0;

    // Count by status
    const byStatus = calls.reduce(
      (acc, call) => {
        acc[call.status] = (acc[call.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Count by intent
    const byIntent = calls.reduce(
      (acc, call) => {
        if (call.intent) {
          acc[call.intent] = (acc[call.intent] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalCalls,
      totalDuration,
      totalTimeSaved,
      totalCost: totalCost.toFixed(2),
      avgCallDuration: Math.round(avgCallDuration),
      avgTimeSaved: Math.round(avgTimeSaved),
      byStatus,
      byIntent,
    };
  } catch (error) {
    console.error("[Call Analytics] Error calculating analytics:", error);
    return null;
  }
}
