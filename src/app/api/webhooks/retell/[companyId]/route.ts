import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const body = await request.json();

    console.log(`📞 Retell webhook received for company ${companyId}:`, body);

    // Validate company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { retell: true }
    });

    if (!company) {
      console.error(`Company ${companyId} not found`);
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Process the Retell webhook data
    const retellData = {
      callId: body.call_id || body.callId,
      workflowId: body.workflow_id || body.workflowId,
      customerPhone: body.customer_phone || body.customerPhone,
      startTime: body.start_time || body.startTime,
      endTime: body.end_time || body.endTime,
      duration: body.duration || 0,
      status: body.status || 'completed',
      timeSaved: body.time_saved || body.timeSaved || 0,
      cost: body.cost || 0,
      transcript: body.transcript,
      summary: body.summary,
      metadata: body.metadata || {},
    };

    // Store call data in database for real-time UI updates
    // You might want to create a CallLog model for this
    console.log('📊 Storing Retell call data:', retellData);

    // Trigger UI revalidation (SWR)
    // This will cause the dashboard to refresh with new data
    const revalidateUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/revalidate?tag=retell-${companyId}`;
    
    try {
      await fetch(revalidateUrl, { method: 'POST' });
      console.log('✅ UI revalidation triggered');
    } catch (error) {
      console.error('❌ Failed to trigger UI revalidation:', error);
    }

    // Forward to n8n webhook (if configured)
    const companyRetell = company.retell[0];
    if (companyRetell?.webhookUrl) {
      try {
        const n8nResponse = await fetch(companyRetell.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Retell-Source': 'ui-webhook',
          },
          body: JSON.stringify({
            ...retellData,
            companyId,
            timestamp: new Date().toISOString(),
          }),
        });

        if (n8nResponse.ok) {
          console.log('✅ Data forwarded to n8n successfully');
        } else {
          console.error('❌ n8n webhook failed:', n8nResponse.status);
        }
      } catch (error) {
        console.error('❌ Failed to forward to n8n:', error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      forwardedToN8n: !!companyRetell?.webhookUrl
    });

  } catch (error) {
    console.error('Error processing Retell webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
