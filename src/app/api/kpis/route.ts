import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getCombinedData } from '@/lib/combined-data';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    // Get the user's specific company
    if (!user.companyId) {
      return NextResponse.json(
        { error: 'User not linked to any company' },
        { status: 404 }
      );
    }

    // Get combined data (Google Sheets + Retell)
    const combinedData = await getCombinedData(user.companyId, {
      phone: phone || undefined,
      useMockRetell: false, // Use real data from database
    });

    // Return only the main 4 KPIs (Retell data will be used for these)
    const mainKpis = {
      callsHandled: combinedData.kpis.callsHandled,
      bookings: combinedData.kpis.bookings,
      avgHandleTime: combinedData.kpis.avgHandleTime,
      conversionRate: combinedData.kpis.conversionRate,
      callsEscalated: combinedData.kpis.callsEscalated,
      estimatedSavings: combinedData.kpis.estimatedSavings,
    };

    return NextResponse.json(mainKpis);
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