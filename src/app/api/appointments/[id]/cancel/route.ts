import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();

    // Mock implementation - in a real app, this would update the database
    console.log(`Canceling appointment ${id} for user ${user.email}`);
    console.log('Update data:', body);

    // Simulate SMS notification
    console.log('📱 SMS sent to customer about appointment cancellation');

    const updatedAppointment = {
      id,
      status: 'canceled',
      notes: body.notes || 'Appointment canceled.',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error canceling appointment:', error);
    return NextResponse.json(
      { error: "Failed to cancel appointment" },
      { status: 500 }
    );
  }
}
