import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readSheetData } from "@/lib/google-sheets";

export async function GET() {
  try {
    const user = await requireUser();
    
    // Get the user's specific company
    console.log(`🔍 Appointments API - User ID: ${user.id}`);
    console.log(`🔍 Appointments API - User companyId: ${user.companyId}`);
    
    if (!user.companyId) {
      console.log('❌ User not linked to any company');
      return NextResponse.json(
        { error: 'User not linked to any company' },
        { status: 404 }
      );
    }

    const company = await prisma.company.findUnique({
      where: {
        id: user.companyId
      },
      include: {
        sheets: true,
        phones: true,
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'No company found for this user' },
        { status: 404 }
      );
    }

    const companySheet = company.sheets[0];
    if (!companySheet) {
      return NextResponse.json(
        { error: 'Google Sheet configuration not found for this company' },
        { status: 404 }
      );
    }

    // Read data from Google Sheets
    const calls = await readSheetData({
      spreadsheetId: companySheet.spreadsheetId,
      range: companySheet.dataRange,
    });

    // Convert CallRow data to Appointment format for upcoming appointments
    // Only include calls that are booked/scheduled/confirmed
    const appointments = calls
      .filter(call => 
        call.status.toLowerCase() === 'booked' || 
        call.status.toLowerCase() === 'scheduled' || 
        call.status.toLowerCase() === 'confirmed'
      )
      .map(call => ({
        id: call.appointment_id,
        orgId: company.id,
        googleEventId: null,
        title: `Appointment with ${call.name}`,
        customerName: call.name,
        customerPhone: call.phone,
        customerEmail: null,
        startsAt: call.datetime_iso,
        endsAt: new Date(new Date(call.datetime_iso).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
        status: call.status.toLowerCase(),
        source: 'phone',
        description: call.notes,
        notes: call.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

    return NextResponse.json(appointments, { status: 200 });
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
