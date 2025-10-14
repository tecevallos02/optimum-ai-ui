import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readSheetData, getSheetMetadata } from '@/lib/google-sheets';
import { CallRow } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const phone = searchParams.get('phone');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const status = searchParams.get('status');
    const fresh = searchParams.get('fresh') === '1';

    // Validate required companyId
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
        phones: true,
        cache: true
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
      const phoneExists = company.phones.some(p => p.e164 === phone);
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

    const sheet = company.sheets[0];
    let callRows: CallRow[] = [];

    // Check cache first (unless fresh=1)
    if (!fresh && company.cache.length > 0) {
      const cache = company.cache[0];
      const cacheAge = Date.now() - cache.lastSynced.getTime();
      const maxStaleness = 60 * 1000; // 60 seconds

      if (cacheAge < maxStaleness) {
        // Use cached data - in a real implementation, you'd store the actual data
        // For now, we'll always read from sheets but this is where you'd return cached data
      }
    }

    // Read from Google Sheets
    callRows = await readSheetData(
      sheet.spreadsheetId,
      sheet.dataRange,
      phone || undefined
    );

    // Apply filters
    if (from || to) {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;

      callRows = callRows.filter(row => {
        const rowDate = new Date(row.datetime_iso);
        if (fromDate && rowDate < fromDate) return false;
        if (toDate && rowDate > toDate) return false;
        return true;
      });
    }

    if (status) {
      callRows = callRows.filter(row => 
        row.status.toLowerCase().includes(status.toLowerCase())
      );
    }

    // Update cache opportunistically
    try {
      const metadata = await getSheetMetadata(sheet.spreadsheetId, sheet.dataRange);
      
      await prisma.sheetCache.upsert({
        where: { companyId },
        update: {
          lastSynced: new Date(),
          rowCount: metadata.rowCount
        },
        create: {
          companyId,
          lastSynced: new Date(),
          rowCount: metadata.rowCount
        }
      });
    } catch (error) {
      console.warn('Failed to update cache:', error);
      // Don't fail the request if cache update fails
    }

    return NextResponse.json({ calls: callRows });
  } catch (error) {
    console.error('Error fetching calls from sheets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    );
  }
}
