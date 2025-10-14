import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readSheetData } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const phone = searchParams.get('phone');
    const days = parseInt(searchParams.get('days') || '30');

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

    // Filter by date range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filteredCalls = callRows.filter(row => {
      const rowDate = new Date(row.datetime_iso);
      return rowDate >= cutoffDate;
    });

    // Count intents
    const intentCounts = new Map<string, number>();
    
    filteredCalls.forEach(call => {
      const intent = call.intent || 'other';
      intentCounts.set(intent, (intentCounts.get(intent) || 0) + 1);
    });

    // Convert to array format
    const data = Array.from(intentCounts.entries()).map(([intent, count]) => ({
      intent,
      count
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching intents distribution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch intents distribution data' },
      { status: 500 }
    );
  }
}