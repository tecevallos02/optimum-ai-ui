/**
 * Organization Usage & Billing API
 *
 * Track usage metrics for billing purposes:
 * - Call counts and durations
 * - n8n workflow executions
 * - Total costs
 * - Time saved metrics
 *
 * Endpoints:
 * - GET /api/organizations/[orgId]/usage - Get usage stats for billing period
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

/**
 * GET /api/organizations/[orgId]/usage
 *
 * Get usage statistics for an organization
 *
 * Query params:
 * - startDate: Start of billing period (ISO 8601)
 * - endDate: End of billing period (ISO 8601)
 * - period: Predefined period (current_month, last_month, current_year)
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
    const period = searchParams.get("period") || "current_month";
    let startDate: Date;
    let endDate: Date = new Date();

    // Calculate date range based on period
    if (searchParams.get("startDate") && searchParams.get("endDate")) {
      startDate = new Date(searchParams.get("startDate")!);
      endDate = new Date(searchParams.get("endDate")!);
    } else {
      switch (period) {
        case "current_month":
          startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
          break;
        case "last_month":
          const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
          startDate = lastMonth;
          endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
          break;
        case "current_year":
          startDate = new Date(endDate.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      }
    }

    // Get call usage
    const callUsage = await getCallUsage(orgId, startDate, endDate);

    // Get workflow execution usage
    const workflowUsage = await getWorkflowUsage(orgId, startDate, endDate);

    // Calculate billing
    const billing = calculateBilling(callUsage, workflowUsage);

    return NextResponse.json({
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        type: period,
      },
      calls: callUsage,
      workflows: workflowUsage,
      billing,
    });
  } catch (error) {
    console.error("[Usage API] Error fetching usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage statistics" },
      { status: 500 },
    );
  }
}

/**
 * Get call usage statistics
 */
async function getCallUsage(orgId: string, startDate: Date, endDate: Date) {
  try {
    const calls = await prisma.callLog.findMany({
      where: {
        orgId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        duration: true,
        status: true,
        intent: true,
        timeSaved: true,
        costUSD: true,
      },
    });

    const totalCalls = calls.length;
    const completedCalls = calls.filter((c) => c.status === "COMPLETED").length;
    const failedCalls = calls.filter((c) => c.status === "FAILED").length;

    const totalDuration = calls.reduce((sum, call) => sum + call.duration, 0);
    const totalTimeSaved = calls.reduce(
      (sum, call) => sum + (call.timeSaved || 0),
      0,
    );
    const totalCost = calls.reduce(
      (sum, call) => sum + Number(call.costUSD || 0),
      0,
    );

    // Group by intent
    const byIntent = calls.reduce(
      (acc, call) => {
        if (call.intent) {
          acc[call.intent] = (acc[call.intent] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    // Group by date for daily breakdown
    const dailyBreakdown = calls.reduce(
      (acc, call) => {
        const date = new Date(call.createdAt).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = {
            calls: 0,
            duration: 0,
            cost: 0,
          };
        }
        acc[date].calls += 1;
        acc[date].duration += call.duration;
        acc[date].cost += Number(call.costUSD || 0);
        return acc;
      },
      {} as Record<
        string,
        {
          calls: number;
          duration: number;
          cost: number;
        }
      >,
    );

    return {
      totalCalls,
      completedCalls,
      failedCalls,
      totalDuration,
      totalTimeSaved,
      totalCost: Number(totalCost.toFixed(2)),
      avgCallDuration: totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0,
      avgTimeSaved: totalCalls > 0 ? Math.round(totalTimeSaved / totalCalls) : 0,
      avgCostPerCall: totalCalls > 0 ? Number((totalCost / totalCalls).toFixed(2)) : 0,
      byIntent,
      dailyBreakdown,
    };
  } catch (error) {
    console.error("[Usage API] Error calculating call usage:", error);
    return null;
  }
}

/**
 * Get workflow execution usage
 */
async function getWorkflowUsage(orgId: string, startDate: Date, endDate: Date) {
  try {
    const executions = await prisma.workflowExecution.findMany({
      where: {
        orgId,
        startedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        status: true,
        durationMs: true,
        startedAt: true,
      },
    });

    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(
      (e) => e.status === "SUCCESS",
    ).length;
    const failedExecutions = executions.filter((e) => e.status === "ERROR").length;

    const totalDuration = executions.reduce(
      (sum, exec) => sum + (exec.durationMs || 0),
      0,
    );
    const avgDuration = totalExecutions > 0 ? totalDuration / totalExecutions : 0;

    // Group by date
    const dailyBreakdown = executions.reduce(
      (acc, exec) => {
        const date = new Date(exec.startedAt).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = {
            executions: 0,
            successful: 0,
            failed: 0,
          };
        }
        acc[date].executions += 1;
        if (exec.status === "SUCCESS") acc[date].successful += 1;
        if (exec.status === "ERROR") acc[date].failed += 1;
        return acc;
      },
      {} as Record<
        string,
        {
          executions: number;
          successful: number;
          failed: number;
        }
      >,
    );

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      totalDurationMs: totalDuration,
      avgDurationMs: Math.round(avgDuration),
      successRate:
        totalExecutions > 0
          ? Number(((successfulExecutions / totalExecutions) * 100).toFixed(2))
          : 0,
      dailyBreakdown,
    };
  } catch (error) {
    console.error("[Usage API] Error calculating workflow usage:", error);
    return null;
  }
}

/**
 * Calculate billing based on usage
 * Simple fixed monthly pricing - all clients pay the same
 */
function calculateBilling(callUsage: any, workflowUsage: any) {
  // Fixed pricing model - all clients pay the same monthly fee
  const PRICING = {
    monthlyFee: 299, // $299/month flat fee for all features
  };

  const callMinutes = callUsage ? callUsage.totalDuration / 60 : 0;

  // Calculate estimated savings to show ROI
  const timeSavedHours = callUsage
    ? callUsage.totalTimeSaved / 3600
    : 0;
  const laborCostPerHour = 25; // $25/hour average receptionist cost
  const estimatedSavings = timeSavedHours * laborCostPerHour;

  // Simple billing structure
  const total = PRICING.monthlyFee;

  return {
    monthlyFee: PRICING.monthlyFee,
    total: total,
    estimatedSavings: Number(estimatedSavings.toFixed(2)),
    roi:
      total > 0
        ? Number((((estimatedSavings - total) / total) * 100).toFixed(2))
        : 0,
    breakdown: {
      totalCalls: callUsage?.totalCalls || 0,
      totalMinutes: Number(callMinutes.toFixed(2)),
      totalWorkflowExecutions: workflowUsage?.totalExecutions || 0,
      timeSavedHours: Number(timeSavedHours.toFixed(2)),
    },
    // Additional metrics for tracking (not billing)
    metrics: {
      avgCallDuration: callUsage?.avgCallDuration || 0,
      avgTimeSavedPerCall: callUsage?.avgTimeSaved || 0,
      completedCalls: callUsage?.completedCalls || 0,
      failedCalls: callUsage?.failedCalls || 0,
      workflowSuccessRate: workflowUsage?.successRate || 0,
    },
  };
}
