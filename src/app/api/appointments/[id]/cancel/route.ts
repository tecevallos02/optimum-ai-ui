import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PATCH /api/appointments/[id]/cancel - Cancel appointment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    // Get user's organization
    const userData = (await prisma.user.findFirst({
      where: { id: user.id },
    })) as any;

    const orgName = userData?.organization || "Default Organization";

    // Ensure organization exists in the database
    const org = await prisma.organization.findFirst({
      where: { name: orgName },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Verify appointment belongs to current user's organization
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: id,
        orgId: org.id,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    const body = await request.json();

    // Update appointment status to canceled
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELED",
        notes: body.notes || existingAppointment.notes,
      },
    });

    console.log(`Canceled appointment ${id} for user ${user.email}`);

    // Convert to API format
    const responseData = {
      id: updatedAppointment.id,
      orgId: updatedAppointment.orgId,
      googleEventId: updatedAppointment.googleEventId,
      title: updatedAppointment.title,
      customerName: updatedAppointment.customerName,
      customerPhone: updatedAppointment.customerPhone,
      customerEmail: updatedAppointment.customerEmail,
      startsAt: updatedAppointment.startsAt.toISOString(),
      endsAt: updatedAppointment.endsAt.toISOString(),
      status: updatedAppointment.status.toLowerCase(),
      source: updatedAppointment.source.toLowerCase(),
      description: updatedAppointment.description,
      notes: updatedAppointment.notes,
      createdAt: updatedAppointment.createdAt.toISOString(),
      updatedAt: updatedAppointment.updatedAt.toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error canceling appointment:", error);
    return NextResponse.json(
      { error: "Failed to cancel appointment" },
      { status: 500 },
    );
  }
}
