import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getCombinedData } from "@/lib/combined-data";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const startDate = searchParams.get("from");
    const endDate = searchParams.get("to");

    // Get the user's specific company
    if (!user.companyId) {
      return NextResponse.json(
        { error: "User not linked to any company" },
        { status: 404 },
      );
    }

    // Get combined data (Google Sheets + Retell)
    const combinedData = await getCombinedData(user.companyId, {
      phone: phone || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      useMockRetell: true, // Use mock data for now
    });

    // Combine appointments and call logs into a unified format
    const allCalls = [
      // Google Sheets appointments
      ...combinedData.appointments.map((appointment) => ({
        id: appointment.appointment_id,
        type: "appointment",
        customerName: appointment.name,
        customerPhone: appointment.phone,
        datetime: appointment.datetime_iso,
        status: appointment.status,
        intent: appointment.intent,
        notes: appointment.notes,
        address: appointment.address,
        source: "google_sheets",
      })),
      // Retell call logs
      ...combinedData.callLogs.map((call) => ({
        id: call.callId,
        type: "call",
        customerName: "Unknown", // Retell doesn't provide customer name
        customerPhone: call.customerPhone,
        datetime: call.startTime,
        status: call.status,
        intent: "call",
        notes: call.summary || "",
        address: "",
        source: "retell",
        duration: call.duration,
        timeSaved: call.timeSaved,
        cost: call.cost,
      })),
    ].sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
    );

    return NextResponse.json({
      calls: allCalls,
      totalCount: allCalls.length,
      retellAnalytics: combinedData.retellAnalytics,
    });
  } catch (error) {
    console.error("Error fetching call logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch call logs" },
      { status: 500 },
    );
  }
}
