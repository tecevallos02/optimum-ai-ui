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

    // For now, return mock data with realistic appointment scenarios
    // In a real implementation, this would fetch from Google Calendar API
    const data = [
      {
        id: "appt_1",
        orgId: currentOrgId,
        googleEventId: "gcal_1",
        start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        end: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
        attendee: { name: "Sarah Johnson", email: "sarah.johnson@email.com", phone: "555-1234" },
        status: "confirmed" as const,
        description: "Dental cleaning and checkup. Patient mentioned sensitivity in lower left molars and wants to discuss whitening options.",
      },
      {
        id: "appt_2",
        orgId: currentOrgId,
        googleEventId: "gcal_2",
        start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        end: new Date(Date.now() + 24.5 * 60 * 60 * 1000).toISOString(),
        attendee: { name: "Michael Chen", email: "m.chen@techcorp.com", phone: "555-5678" },
        status: "pending" as const,
        description: "Initial consultation for website redesign project. Client wants to discuss e-commerce integration and mobile responsiveness.",
      },
      {
        id: "appt_3",
        orgId: currentOrgId,
        googleEventId: "gcal_3",
        start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        attendee: { name: "Emily Rodriguez", email: "emily.r@lawfirm.com", phone: "555-9012" },
        status: "confirmed" as const,
        description: "Legal consultation regarding property dispute. Client needs advice on boundary issues and potential litigation.",
      },
      {
        id: "appt_4",
        orgId: currentOrgId,
        googleEventId: "gcal_4",
        start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
        attendee: { name: "David Thompson", email: "david.t@fitness.com", phone: "555-3456" },
        status: "pending" as const,
        description: "Personal training session. Client wants to focus on strength training and discuss nutrition plan for weight loss goals.",
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
