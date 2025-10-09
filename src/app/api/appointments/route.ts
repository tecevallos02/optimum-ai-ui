import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const user = await requireUser();
    
    // Get user's organization and ensure it exists in the database
    const userData = await prisma.user.findFirst({
      where: { id: user.id }
    }) as any;
    
    const orgName = userData?.organization || 'Default Organization'
    
    // Ensure organization exists in the database
    let org = await prisma.organization.findFirst({
      where: { name: orgName }
    })
    
    if (!org) {
      console.log('Creating organization for appointments GET:', orgName);
      org = await prisma.organization.create({
        data: {
          name: orgName,
        }
      })
    }
    
    const currentOrgId = org.id

    // For now, return mock data with realistic appointment scenarios
    // In a real implementation, this would fetch from Google Calendar API
    const data = [
      {
        id: "appt_1",
        orgId: currentOrgId,
        googleEventId: "gcal_1",
        title: "Dental Cleaning",
        customerName: "Sarah Johnson",
        customerPhone: "555-1234",
        customerEmail: "sarah.johnson@email.com",
        startsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        endsAt: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
        status: "confirmed" as const,
        source: "phone" as const,
        notes: "Patient mentioned sensitivity in lower left molars and wants to discuss whitening options.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "appt_2",
        orgId: currentOrgId,
        googleEventId: "gcal_2",
        title: "Website Consultation",
        customerName: "Michael Chen",
        customerPhone: "555-5678",
        customerEmail: "m.chen@techcorp.com",
        startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endsAt: new Date(Date.now() + 24.5 * 60 * 60 * 1000).toISOString(),
        status: "scheduled" as const,
        source: "web" as const,
        notes: "Initial consultation for website redesign project. Client wants to discuss e-commerce integration and mobile responsiveness.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "appt_3",
        orgId: currentOrgId,
        googleEventId: "gcal_3",
        title: "Legal Consultation",
        customerName: "Emily Rodriguez",
        customerPhone: "555-9012",
        customerEmail: "emily.r@lawfirm.com",
        startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        status: "confirmed" as const,
        source: "agent" as const,
        notes: "Legal consultation regarding property dispute. Client needs advice on boundary issues and potential litigation.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "appt_4",
        orgId: currentOrgId,
        googleEventId: "gcal_4",
        title: "Personal Training",
        customerName: "David Thompson",
        customerPhone: "555-3456",
        customerEmail: "david.t@fitness.com",
        startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
        status: "scheduled" as const,
        source: "imported" as const,
        notes: "Personal training session. Client wants to focus on strength training and discuss nutrition plan for weight loss goals.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    
    // Get user's organization and ensure it exists in the database
    const userData = await prisma.user.findFirst({
      where: { id: user.id }
    }) as any;
    
    const orgName = userData?.organization || 'Default Organization'
    
    // Ensure organization exists in the database
    let org = await prisma.organization.findFirst({
      where: { name: orgName }
    })
    
    if (!org) {
      console.log('Creating organization for appointments POST:', orgName);
      org = await prisma.organization.create({
        data: {
          name: orgName,
        }
      })
    }
    
    const currentOrgId = org.id
    const body = await request.json();

    // Create new appointment (mock implementation)
    const newAppointment = {
      id: `appt_${Date.now()}`,
      orgId: currentOrgId,
      googleEventId: body.googleEventId || undefined,
      title: body.title,
      customerName: body.customerName,
      customerPhone: body.customerPhone || undefined,
      customerEmail: body.customerEmail || undefined,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      status: body.status || 'scheduled',
      source: body.source || 'agent',
      notes: body.notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Created new appointment:', newAppointment);

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
