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
      useMockRetell: true, // Use mock data for now
    });

    return NextResponse.json(combinedData.kpis);
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
        totalCalls: 0,
        totalTimeSaved: 0,
        totalCost: 0,
        averageCallDuration: 0,
        averageTimeSaved: 0,
      },
      { status: 500 }
    );
  }
}