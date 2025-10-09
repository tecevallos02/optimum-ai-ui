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
    
    // For now, return 0 for calls escalated since we don't have a call model yet
    // TODO: Implement call model and escalation tracking
    const callsEscalatedCount = 0;
    console.log('KPI API: Calls escalated count:', callsEscalatedCount);
    
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
    
    // For now, keep other KPIs as 0 until real data is implemented
    // In a real implementation, these would be calculated from actual data
    const callsHandled = 0;
    const conversionRate = 0;
    
    const data = {
      callsHandled,
      bookings: appointmentsCount, // Use real appointments count (excluding canceled)
      avgHandleTime: 0,
      conversionRate: 0,
      callsEscalated: callsEscalatedCount, // Use real calls escalated count
      estimatedSavings: 0,
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
