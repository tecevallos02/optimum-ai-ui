import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    // Revalidate SWR cache for this company
    revalidateTag(`calls-${companyId}`);
    revalidateTag(`analytics-${companyId}`);
    revalidateTag(`kpis-${companyId}`);

    return NextResponse.json({ 
      success: true, 
      message: `Cache invalidated for company ${companyId}` 
    });
  } catch (error) {
    console.error('Error processing sheet update webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
