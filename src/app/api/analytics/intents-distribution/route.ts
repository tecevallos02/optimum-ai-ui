import { NextRequest, NextResponse } from 'next/server';
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
    const days = parseInt(searchParams.get('days') || '30');
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    // Fetch calls data for the specified period
    const calls = await prisma.call.findMany({
      where: {
        orgId: membership.orgId,
        startedAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      }
    });

    // Count intents
    const intentCounts = new Map();
    const totalCalls = calls.length;

    calls.forEach(call => {
      if (call.intent && call.intent.length > 0) {
        call.intent.forEach(intent => {
          const normalizedIntent = intent.toLowerCase().trim();
          intentCounts.set(normalizedIntent, (intentCounts.get(normalizedIntent) || 0) + 1);
        });
      } else {
        // If no intent detected, categorize by disposition
        const disposition = call.disposition?.toLowerCase() || 'unknown';
        let intent = 'unknown';
        
        if (disposition.includes('book') || disposition.includes('appointment')) {
          intent = 'booking';
        } else if (disposition.includes('info') || disposition.includes('question')) {
          intent = 'information';
        } else if (disposition.includes('cancel')) {
          intent = 'cancellation';
        } else if (disposition.includes('complaint') || disposition.includes('issue')) {
          intent = 'complaint';
        } else if (call.escalated) {
          intent = 'escalation';
        }
        
        intentCounts.set(intent, (intentCounts.get(intent) || 0) + 1);
      }
    });

    // Convert to array with colors and percentages
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
    ];

    const result = Array.from(intentCounts.entries()).map(([intent, count], index) => ({
      name: intent.charAt(0).toUpperCase() + intent.slice(1),
      count,
      percentage: totalCalls > 0 ? Math.round((count / totalCalls) * 100) : 0,
      color: colors[index % colors.length]
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error fetching intents distribution data:', error);
    return NextResponse.json(
      { error: "Failed to fetch intents distribution data" },
      { status: 500 }
    );
  }
}
