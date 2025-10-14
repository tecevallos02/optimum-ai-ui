import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readSheetData, getSheetMetadata } from '@/lib/google-sheets';
import { CallRow } from '@/lib/types';
import { requireUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const status = searchParams.get('status');
    const fresh = searchParams.get('fresh') === '1';

    // For now, get the first company (in a real app, you'd link users to companies)
    const company = await prisma.company.findFirst({
      include: {
        sheets: true,
        phones: true,
        cache: true
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'No company found' },
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

    const companySheet = company.sheets[0];
    if (!companySheet) {
      return NextResponse.json(
        { error: 'Google Sheet configuration not found for this company' },
        { status: 404 }
      );
    }

    // Check cache first (if not fresh)
    let calls: CallRow[] = [];
    if (!fresh && company.cache && company.cache.length > 0) {
      const cache = company.cache[0];
      const cacheAge = Date.now() - cache.lastSynced.getTime();
      const maxStaleness = 60 * 1000; // 60 seconds

      if (cacheAge < maxStaleness) {
        // Use cached data - for now, we'll still read from sheet
        // In a real implementation, you'd store the actual data in cache
      }
    }

    // Read from Google Sheets
    calls = await readSheetData({
      spreadsheetId: companySheet.spreadsheetId,
      range: companySheet.dataRange,
      phoneFilter: phone || undefined,
      from: from || undefined,
      to: to || undefined,
      statusFilter: status || undefined,
    });

    // Update cache
    if (company.cache.length > 0) {
      await prisma.sheetCache.update({
        where: { id: company.cache[0].id },
        data: {
          lastSynced: new Date(),
          rowCount: calls.length
        }
      });
    } else {
      await prisma.sheetCache.create({
        data: {
          companyId: company.id,
          lastSynced: new Date(),
          rowCount: calls.length
        }
      });
    }

    // Get sheet metadata for pagination info
    const metadata = await getSheetMetadata(companySheet.spreadsheetId, companySheet.dataRange);
    const totalRows = metadata?.rowCount || calls.length;

    return NextResponse.json({
      calls,
      pagination: {
        total: totalRows,
        page: 1,
        limit: calls.length,
        totalPages: Math.ceil(totalRows / calls.length)
      }
    });
  } catch (error) {
    console.error('Error fetching calls from Google Sheet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls from sheet' },
      { status: 500 }
    );
  }
}