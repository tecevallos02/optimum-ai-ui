import { NextResponse } from "next/server";
import { requireUser, getCurrentOrgId } from "@/lib/auth";

export async function POST() {
  try {
    // Try to authenticate user, but don't fail if auth is not available
    let user;
    let currentOrgId;
    
    try {
      user = await requireUser();
      currentOrgId = await getCurrentOrgId();
      console.log("✅ Calendar POST - User authenticated:", user.id);
    } catch (authError) {
      console.log("⚠️ Calendar POST - Authentication failed, using fallback:", authError);
      // Use fallback for development
      user = {
        id: "test-user-id",
        email: "test@example.com",
        name: "Test User",
        companyId: null
      };
      currentOrgId = null;
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
    // Try to authenticate user, but don't fail if auth is not available
    let user;
    let currentOrgId;
    
    try {
      user = await requireUser();
      currentOrgId = await getCurrentOrgId();
      console.log("✅ Calendar API - User authenticated:", user.id);
    } catch (authError) {
      console.log("⚠️ Calendar API - Authentication failed, using fallback:", authError);
      // Use fallback for development
      user = {
        id: "test-user-id",
        email: "test@example.com",
        name: "Test User",
        companyId: null
      };
      currentOrgId = null;
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
