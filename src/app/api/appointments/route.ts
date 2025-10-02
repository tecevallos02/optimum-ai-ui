// path: src/app/api/appointments/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Mock data — replace with real DB later
  const data = [
    {
      id: "appt_1",
      orgId: "org_1",
      googleEventId: "gcal_1",
      start: new Date().toISOString(),
      end: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      attendee: { name: "Jane Doe", email: "jane@example.com", phone: "555-1111" },
      status: "confirmed" as const,
    },
    {
      id: "appt_2",
      orgId: "org_1",
      googleEventId: "gcal_2",
      start: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
      attendee: { name: "John Smith", email: "john@example.com", phone: "555-2222" },
      status: "pending" as const,
    },
  ];

  return NextResponse.json(data, { status: 200 });
}
