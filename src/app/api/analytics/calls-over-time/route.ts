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

    // Group by date
    const callsByDate = new Map<string, number>();
    
    filteredCalls.forEach(call => {
      const date = new Date(call.datetime_iso).toISOString().split('T')[0];
      callsByDate.set(date, (callsByDate.get(date) || 0) + 1);
    });

    // Generate data points for the chart
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      data.push({
        date: dateStr,
        calls: callsByDate.get(dateStr) || 0
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching calls over time:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls over time data' },
      { status: 500 }
    );
  }
}