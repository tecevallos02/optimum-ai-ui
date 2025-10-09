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

    // Fetch appointments from database
    const appointments = await prisma.appointment.findMany({
      where: { orgId: currentOrgId },
      orderBy: { startsAt: 'asc' }
    });

    // Convert database format to API format
    const data = appointments.map(appointment => ({
      id: appointment.id,
      orgId: appointment.orgId,
      googleEventId: appointment.googleEventId,
      title: appointment.title,
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone,
      customerEmail: appointment.customerEmail,
      startsAt: appointment.startsAt.toISOString(),
      endsAt: appointment.endsAt.toISOString(),
      status: appointment.status.toLowerCase(),
      source: appointment.source.toLowerCase(),
      description: appointment.description,
      notes: appointment.notes,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    }));

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

    // Validate required fields
    if (!body.title || !body.customerName || !body.startsAt || !body.endsAt) {
      return NextResponse.json(
        { error: "Missing required fields: title, customerName, startsAt, endsAt" },
        { status: 400 }
      );
    }

    // Create new appointment in database
    const newAppointment = await prisma.appointment.create({
      data: {
        orgId: currentOrgId,
        googleEventId: body.googleEventId || null,
        title: body.title,
        customerName: body.customerName,
        customerPhone: body.customerPhone || null,
        customerEmail: body.customerEmail || null,
        startsAt: new Date(body.startsAt),
        endsAt: new Date(body.endsAt),
        status: body.status?.toUpperCase() || 'SCHEDULED',
        source: body.source?.toUpperCase() || 'AGENT',
        description: body.description || null,
        notes: body.notes || null,
      }
    });

    // Convert to API format
    const responseData = {
      id: newAppointment.id,
      orgId: newAppointment.orgId,
      googleEventId: newAppointment.googleEventId,
      title: newAppointment.title,
      customerName: newAppointment.customerName,
      customerPhone: newAppointment.customerPhone,
      customerEmail: newAppointment.customerEmail,
      startsAt: newAppointment.startsAt.toISOString(),
      endsAt: newAppointment.endsAt.toISOString(),
      status: newAppointment.status.toLowerCase(),
      source: newAppointment.source.toLowerCase(),
      description: newAppointment.description,
      notes: newAppointment.notes,
      createdAt: newAppointment.createdAt.toISOString(),
      updatedAt: newAppointment.updatedAt.toISOString(),
    };

    console.log('Created new appointment:', responseData);

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
