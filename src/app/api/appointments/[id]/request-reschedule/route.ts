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
    console.log(`Requesting reschedule for appointment ${id} for user ${user.email}`);
    console.log('Update data:', body);

    // Simulate SMS notification
    console.log('📱 SMS sent to customer with reschedule link');

    const updatedAppointment = {
      id,
      status: 'scheduled', // Keep as scheduled but mark for reschedule
      notes: body.notes || 'Reschedule requested.',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error requesting reschedule:', error);
    return NextResponse.json(
      { error: "Failed to request reschedule" },
      { status: 500 }
    );
  }
}
