import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { readSheetData } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const phone = searchParams.get('phone');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    // Get company configuration
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        sheets: true,
        phones: true
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Validate phone belongs to company if provided
    if (phone) {
      const phoneExists = company.phones.some((p: any) => p.e164 === phone);
      if (!phoneExists) {
        return NextResponse.json(
          { error: 'Phone number does not belong to this company' },
          { status: 400 }
        );
      }
    }

    if (!company.sheets.length) {
      return NextResponse.json(
        { error: 'No Google Sheet configured for this company' },
        { status: 404 }
      );
    }

    // Read call data from Google Sheets
    const sheet = company.sheets[0];
    const callRows = await readSheetData(
      sheet.spreadsheetId,
      sheet.dataRange,
      phone || undefined
    );

    // Apply date filters
    let filteredCalls = callRows;
    if (from || to) {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;

      filteredCalls = callRows.filter(row => {
        const rowDate = new Date(row.datetime_iso);
        if (fromDate && rowDate < fromDate) return false;
        if (toDate && rowDate > toDate) return false;
        return true;
      });
    }

    // Calculate KPIs
    const totalCalls = filteredCalls.length;
    const bookedCalls = filteredCalls.filter(call => 
      call.status.toLowerCase().includes('booked') || 
      call.status.toLowerCase().includes('scheduled') ||
      call.status.toLowerCase().includes('confirmed')
    ).length;
    const escalatedCalls = filteredCalls.filter(call => 
      call.status.toLowerCase().includes('escalated') ||
      call.notes.toLowerCase().includes('escalated')
    ).length;

    const conversionRate = totalCalls > 0 ? (bookedCalls / totalCalls) * 100 : 0;
    const estimatedSavings = bookedCalls * 15; // $15 per automated booking

    const kpis = {
      callsHandled: totalCalls,
      bookings: bookedCalls,
      avgHandleTime: 0, // Not available from sheet data
      conversionRate: Math.round(conversionRate * 100) / 100,
      callsEscalated: escalatedCalls,
      estimatedSavings
    };

    return NextResponse.json(kpis);
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json(
      { error: "Failed to fetch KPIs" },
      { status: 500 }
    );
  }
}