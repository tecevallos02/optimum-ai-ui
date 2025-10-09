import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();

    // Get user's organization
    const userData = await prisma.user.findFirst({
      where: { id: user.id }
    }) as any;
    
    const orgName = userData?.organization || 'Default Organization'
    
    // Ensure organization exists in the database
    let org = await prisma.organization.findFirst({
      where: { name: orgName }
    })
    
    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Update appointment in database
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: id,
        orgId: org.id
      },
      data: {
        status: 'CANCELED',
        notes: body.notes || 'Appointment canceled.',
      }
    });

    // Simulate SMS notification
    console.log('📱 SMS sent to customer about appointment cancellation');

    const responseData = {
      id: updatedAppointment.id,
      status: updatedAppointment.status.toLowerCase(),
      notes: updatedAppointment.notes,
      updatedAt: updatedAppointment.updatedAt.toISOString(),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error canceling appointment:', error);
    return NextResponse.json(
      { error: "Failed to cancel appointment" },
      { status: 500 }
    );
  }
}
