import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { readSheetData } from '@/lib/google-sheets';
import { KPI, CallRow } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    // For now, get the first company (in a real app, you'd link users to companies)
    const company = await prisma.company.findFirst({
      include: {
        sheets: true,
        phones: true,
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'No company found' },
        { status: 404 }
      );
    }

    if (phone) {
      const phoneExists = company.phones.some((p: any) => p.e164 === phone);
      if (!phoneExists) {
        return NextResponse.json(
          { error: 'Phone number does not belong to this company' },
          { status: 400 }
        );
      }
    }

    const companySheet = company.sheets[0];
    if (!companySheet) {
      return NextResponse.json(
        { error: 'Google Sheet configuration not found for this company' },
        { status: 404 }
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

    const callsHandled = calls.filter(c => c.status.toLowerCase().includes('completed') || c.status.toLowerCase().includes('booked')).length;
    const bookings = calls.filter(c => c.intent === 'booking').length;
    const callsEscalated = calls.filter(c => c.status.toLowerCase().includes('escalated')).length;

    // For avgHandleTime and estimatedSavings, we need duration.
    // Google Sheets data doesn't currently provide duration directly.
    // For now, we'll use placeholders or derive a simple estimate.
    // Assuming an average call duration for simplicity if not in sheet.
    const averageCallDurationSeconds = 180; // 3 minutes
    const totalDuration = callsHandled * averageCallDurationSeconds;
    const avgHandleTime = callsHandled > 0 ? averageCallDurationSeconds : 0; // Placeholder

    const conversionRate = callsHandled > 0 ? Math.round((bookings / callsHandled) * 100) : 0;
    const estimatedSavings = Math.round(callsHandled * avgHandleTime * 0.05); // $0.05 per second saved

    const kpis: KPI = {
      callsHandled,
      bookings,
      avgHandleTime,
      conversionRate,
      callsEscalated,
      estimatedSavings,
    };

    return NextResponse.json(kpis);
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json(
      {
        callsHandled: 0,
        bookings: 0,
        avgHandleTime: 0,
        conversionRate: 0,
        callsEscalated: 0,
        estimatedSavings: 0,
      },
      { status: 500 }
    );
  }
}