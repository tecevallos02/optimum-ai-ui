import { NextResponse } from "next/server";
import { requireUser, getCurrentOrgId } from "@/lib/auth";

export async function GET() {
  try {
    await requireUser();
    const currentOrgId = await getCurrentOrgId();
    
    if (!currentOrgId) {
      return NextResponse.json(
        { error: "No organization selected" },
        { status: 400 }
      );
    }

    // For now, return mock data
    // In a real implementation, this would fetch from Google Calendar API
    const data = [
      {
        id: "appt_1",
        orgId: currentOrgId,
        googleEventId: "gcal_1",
        start: new Date().toISOString(),
        end: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        attendee: { name: "Jane Doe", email: "jane@example.com", phone: "555-1111" },
        status: "confirmed" as const,
      },
      {
        id: "appt_2",
        orgId: currentOrgId,
        googleEventId: "gcal_2",
        start: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
        attendee: { name: "John Smith", email: "john@example.com", phone: "555-2222" },
        status: "pending" as const,
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
