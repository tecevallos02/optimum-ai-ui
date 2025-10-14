import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { readSheetData } from '@/lib/google-sheets';
import { CallRow } from '@/lib/types';
import { format, subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const days = parseInt(searchParams.get('days') || '30');

    // Get the user's specific company
    if (!user.companyId) {
      return NextResponse.json(
        { error: 'User not linked to any company' },
        { status: 404 }
      );
    }

    const company = await prisma.company.findUnique({
      where: {
        id: user.companyId
      },
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

    const dailyCalls: { [key: string]: number } = {};
    for (let i = 0; i <= days; i++) {
      const date = format(subDays(endDate, i), 'yyyy-MM-dd');
      dailyCalls[date] = 0;
    }

    calls.forEach(call => {
      const callDate = format(new Date(call.datetime_iso), 'yyyy-MM-dd');
      if (dailyCalls[callDate] !== undefined) {
        dailyCalls[callDate]++;
      }
    });

    const data = Object.keys(dailyCalls).sort().map(date => ({
      date,
      calls: dailyCalls[date],
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching calls over time:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls over time' },
      { status: 500 }
    );
  }
}