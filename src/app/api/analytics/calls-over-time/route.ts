import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { readSheetData } from "@/lib/google-sheets";
import { CallRow } from "@/lib/types";
import { format, subDays } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const days = parseInt(searchParams.get("days") || "30");

    // Get the user's specific company
    if (!user.companyId) {
      return NextResponse.json(
        { error: "User not linked to any company" },
        { status: 404 },
      );
    }

    // Dynamic import to avoid build-time database connection
    const { prisma } = await import("@/lib/prisma");

    const company = await prisma.company.findUnique({
      where: {
        id: user.companyId,
      },
      include: {
        sheets: true,
        phones: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "No company found" }, { status: 404 });
    }

    if (phone) {
      const phoneExists = company.phones.some((p: any) => p.e164 === phone);
      if (!phoneExists) {
        return NextResponse.json(
          { error: "Phone number does not belong to this company" },
          { status: 400 },
        );
      }
    }

    const companySheet = company.sheets[0];
    if (!companySheet) {
      return NextResponse.json(
        { error: "Google Sheet configuration not found for this company" },
        { status: 404 },
      );
    }

    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const calls: CallRow[] = await readSheetData({
      spreadsheetId: companySheet.spreadsheetId,
      range: companySheet.dataRange,
      phoneFilter: phone || undefined,
      from: startDate.toISOString(),
      to: endDate.toISOString(),
      companyId: company.id, // Pass companyId for mock data generation
    });

    console.log(`📊 Calls Over Time API Debug:`, {
      companyId: company.id,
      callsCount: calls.length,
      dateRange: `${startDate.toISOString()} to ${endDate.toISOString()}`,
      firstCall: calls[0]
        ? {
            id: calls[0].appointment_id,
            date: calls[0].datetime_iso,
            status: calls[0].status,
          }
        : "none",
    });

    const dailyCalls: { [key: string]: number } = {};
    for (let i = 0; i <= days; i++) {
      const date = format(subDays(endDate, i), "yyyy-MM-dd");
      dailyCalls[date] = 0;
    }

    calls.forEach((call) => {
      const callDate = format(new Date(call.datetime_iso), "yyyy-MM-dd");
      if (dailyCalls[callDate] !== undefined) {
        dailyCalls[callDate]++;
      }
    });

    // Generate chart data with proper format for CallsOverTime component
    const data = Object.keys(dailyCalls)
      .sort()
      .map((date) => {
        const dayCalls = calls.filter(
          (call) => format(new Date(call.datetime_iso), "yyyy-MM-dd") === date,
        );

        return {
          name: format(new Date(date), "MMM dd"),
          totalCalls: dailyCalls[date],
          escalatedCalls: dayCalls.filter((call) => call.status === "escalated")
            .length,
          bookedCalls: dayCalls.filter((call) => call.status === "booked")
            .length,
          completedCalls: dayCalls.filter((call) => call.status === "completed")
            .length,
          quoteCalls: dayCalls.filter((call) => call.intent === "quote").length,
          otherCalls: dayCalls.filter((call) => call.intent === "other").length,
        };
      });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching calls over time:", error);
    return NextResponse.json(
      { error: "Failed to fetch calls over time" },
      { status: 500 },
    );
  }
}
