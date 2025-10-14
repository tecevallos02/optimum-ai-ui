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
    const days = parseInt(searchParams.get('days') || '7');
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    // Fetch calls data for the specified period
    const calls = await prisma.call.findMany({
      where: {
        orgId: membership.orgId,
        startedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { startedAt: 'asc' }
    });

    // Group calls by day
    const callsByDay = new Map();
    
    // Initialize all days with zero values
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dayKey = date.toISOString().split('T')[0];
      callsByDay.set(dayKey, {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        totalCalls: 0,
        escalatedCalls: 0,
        bookedCalls: 0,
        completedCalls: 0,
        date: dayKey
      });
    }

    // Process actual call data
    calls.forEach(call => {
      const callDate = call.startedAt.toISOString().split('T')[0];
      const dayData = callsByDay.get(callDate);
      
      if (dayData) {
        dayData.totalCalls++;
        
        if (call.escalated) {
          dayData.escalatedCalls++;
        }
        
        if (call.disposition === 'booked' || call.intent.includes('book')) {
          dayData.bookedCalls++;
        }
        
        if (call.status === 'COMPLETED') {
          dayData.completedCalls++;
        }
      }
    });

    // Convert to array and return
    const result = Array.from(callsByDay.values());
    
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error fetching calls over time data:', error);
    return NextResponse.json(
      { error: "Failed to fetch calls over time data" },
      { status: 500 }
    );
  }
}
