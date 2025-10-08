// path: src/app/api/kpis/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const user = await requireUser();
    
    // Get user's organization and ensure it exists in the database
    const userData = await prisma.user.findFirst({
      where: { id: user.id }
    }) as any; // Type assertion for organization field
    
    const orgName = userData?.organization || 'Default Organization'
    
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
    
    // Fetch real complaints count from database
    const complaintsCount = await prisma.complaint.count({
      where: { orgId: orgId }
    });
    
    // For now, keep other KPIs as mock data
    // In a real implementation, these would also be calculated from actual data
    const callsHandled = 42;
    const bookings = 11;
    const conversionRate = callsHandled > 0 ? (bookings / callsHandled) * 100 : 0;
    
    const data = {
      callsHandled,
      bookings,
      avgHandleTime: 73,
      conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal place
      complaints: complaintsCount, // Use real complaints count
      estimatedSavings: 1840,
    };
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    
    // Fallback to mock data if there's an error
    const callsHandled = 42;
    const bookings = 11;
    const conversionRate = callsHandled > 0 ? (bookings / callsHandled) * 100 : 0;
    
    const data = {
      callsHandled,
      bookings,
      avgHandleTime: 73,
      conversionRate: Math.round(conversionRate * 10) / 10,
      complaints: 0, // Fallback to 0 if error
      estimatedSavings: 1840,
    };
    
    return NextResponse.json(data, { status: 200 });
  }
}
