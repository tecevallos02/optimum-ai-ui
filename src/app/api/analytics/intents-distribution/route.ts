import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { readSheetData } from '@/lib/google-sheets';
import { CallRow } from '@/lib/types';
import { subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const days = parseInt(searchParams.get('days') || '30');

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

    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const calls: CallRow[] = await readSheetData({
      spreadsheetId: companySheet.spreadsheetId,
      range: companySheet.dataRange,
      phoneFilter: phone || undefined,
      from: startDate.toISOString(),
      to: endDate.toISOString(),
    });

    const intentCounts: { [key: string]: number } = {};
    calls.forEach(call => {
      const intent = call.intent || 'other';
      intentCounts[intent] = (intentCounts[intent] || 0) + 1;
    });

    const data = Object.keys(intentCounts).map(intent => ({
      name: intent,
      value: intentCounts[intent],
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching intents distribution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch intents distribution' },
      { status: 500 }
    );
  }
}