// path: src/app/api/kpis/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const user = await requireUser();
    console.log('KPI API: User authenticated:', user.email);
    
    // Get user's organization and ensure it exists in the database
    const userData = await prisma.user.findFirst({
      where: { id: user.id }
    }) as any; // Type assertion for organization field
    
    const orgName = userData?.organization || 'Default Organization'
    console.log('KPI API: User organization:', orgName);
    
    // Ensure organization exists in the database
    let org = await prisma.organization.findFirst({
      where: { name: orgName }
    })
    
    if (!org) {
      console.log('Creating organization for KPIs:', orgName);
      org = await prisma.organization.create({
        data: {
          name: orgName,
        }
      })
    }
    
    const orgId = org.id
    console.log('KPI API: Using orgId:', orgId);
    
    // Fetch real call data from the new Call model
    const callsData = await prisma.call.findMany({
      where: { 
        orgId: orgId,
        startedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });
    
    const callsEscalatedCount = callsData.filter((call: any) => call.escalated).length;
    const callsHandled = callsData.filter((call: any) => call.status === 'COMPLETED').length;
    const totalDuration = callsData.reduce((sum: number, call: any) => sum + call.duration, 0);
    const avgHandleTime = callsHandled > 0 ? Math.round(totalDuration / callsHandled) : 0;
    
    // Calculate conversion rate (calls that resulted in appointments)
    const callsWithAppointments = callsData.filter((call: any) => 
      call.disposition === 'booked' || call.intent.includes('book')
    ).length;
    const conversionRate = callsHandled > 0 ? Math.round((callsWithAppointments / callsHandled) * 100) : 0;
    
    console.log('KPI API: Calls escalated count:', callsEscalatedCount);
    console.log('KPI API: Calls handled:', callsHandled);
    console.log('KPI API: Conversion rate:', conversionRate);
    
    // Fetch real appointments count (excluding canceled ones)
    const appointmentsCount = await prisma.appointment.count({
      where: { 
        orgId: orgId,
        status: {
          not: 'CANCELED'
        }
      }
    });
    console.log('KPI API: Appointments count:', appointmentsCount);
    
    // Calculate estimated savings based on call volume and average handle time
    const estimatedSavings = Math.round(callsHandled * avgHandleTime * 0.05); // $0.05 per second saved
    
    const data = {
      callsHandled,
      bookings: appointmentsCount, // Use real appointments count (excluding canceled)
      avgHandleTime,
      conversionRate,
      callsEscalated: callsEscalatedCount, // Use real calls escalated count
      estimatedSavings,
    };
    
    console.log('KPI API: Returning data:', data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    
    // Fallback to 0 if there's an error
    const callsHandled = 0;
    const conversionRate = 0;
    
    const data = {
      callsHandled,
      bookings: 0, // Fallback to 0 if error
      avgHandleTime: 0,
      conversionRate: 0,
      callsEscalated: 0, // Fallback to 0 if error
      estimatedSavings: 0,
    };
    
    console.log('KPI API: Returning fallback data:', data);
    return NextResponse.json(data, { status: 200 });
  }
}
