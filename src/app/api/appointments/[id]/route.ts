import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// DELETE /api/appointments/[id] - Delete appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

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

    // Verify appointment belongs to current user's organization
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: id,
        orgId: org.id
      }
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Delete appointment from database
    await prisma.appointment.delete({
      where: { id }
    });

    console.log(`Deleted appointment ${id} for user ${user.email}`);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
