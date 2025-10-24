import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { readSheetData } from "@/lib/google-sheets";
import { CallRow } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params; // This 'id' is the appointment_id from CallRow

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    // For now, get the first company (in a real app, you'd link users to companies)
    const company = await prisma.company.findFirst({
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

    const calls: CallRow[] = await readSheetData({
      spreadsheetId: companySheet.spreadsheetId,
      range: companySheet.dataRange,
      phoneFilter: phone || undefined,
      from: undefined,
      to: undefined,
      statusFilter: undefined,
    });

    const call = calls.find((c) => c.appointment_id === id);

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    return NextResponse.json(call);
  } catch (error) {
    console.error("Error fetching call details from Google Sheet:", error);
    return NextResponse.json(
      { error: "Failed to fetch call details" },
      { status: 500 },
    );
  }
}
