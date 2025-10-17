import { NextResponse } from "next/server";
import { requireUser, getCurrentOrgId } from "@/lib/auth";

export async function POST() {
  try {
    await requireUser();
    const currentOrgId = await getCurrentOrgId();

    if (!currentOrgId) {
      return NextResponse.json(
        { error: "No organization selected" },
        { status: 400 },
      );
    }

    // For now, return a mock connection status
    // In a real implementation, this would:
    // 1. Generate Google OAuth URL
    // 2. Store connection state
    // 3. Handle OAuth callback

    const mockConnection = {
      connected: false,
      provider: "google",
      connectUrl: "/api/calendar/oauth/google",
      message: "Click to connect your Google Calendar",
    };

    return NextResponse.json(mockConnection);
  } catch (error) {
    console.error("Error connecting calendar:", error);
    return NextResponse.json(
      { error: "Failed to connect calendar" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await requireUser();
    const currentOrgId = await getCurrentOrgId();

    if (!currentOrgId) {
      return NextResponse.json(
        { error: "No organization selected" },
        { status: 400 },
      );
    }

    // Check if calendar is connected
    // For now, return mock status
    const connectionStatus = {
      connected: false,
      provider: "google",
      lastSync: null,
      eventsCount: 0,
    };

    return NextResponse.json(connectionStatus);
  } catch (error) {
    console.error("Error checking calendar status:", error);
    return NextResponse.json(
      { error: "Failed to check calendar status" },
      { status: 500 },
    );
  }
}
