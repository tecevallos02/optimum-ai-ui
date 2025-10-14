import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { readSheetData } from '@/lib/google-sheets';
import { CallRow } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const status = searchParams.get('status');

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
      from: from || undefined,
      to: to || undefined,
      statusFilter: status || undefined,
      companyId: company.id, // Pass companyId for mock data generation
    });

    return NextResponse.json({ calls });
  } catch (error) {
    console.error('Error fetching calls from Google Sheet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls from sheet' },
      { status: 500 }
    );
  }
}