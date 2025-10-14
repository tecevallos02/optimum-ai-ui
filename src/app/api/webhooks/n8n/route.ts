import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { Call } from '@/lib/types';

interface CallWithMetadata extends Call {
  metadata?: Record<string, any>;
}

interface PhoneNumberRecord {
  id: string;
  orgId: string;
  phoneNumber: string;
  retellAgentId?: string | null;
  retellApiKey?: string | null;
}

// POST /api/webhooks/n8n - Handle N8N webhook for call events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = await headers();
    
    // Verify webhook signature if provided
    const webhookSecret = headersList.get('x-webhook-secret');
    const phoneNumber = headersList.get('x-phone-number');
    
    console.log('N8N Webhook received:', {
      event: body.event,
      phoneNumber,
      timestamp: new Date().toISOString()
    });

    // Find the phone number and organization
    const phoneNumberRecord = await prisma.phoneNumber.findFirst({
      where: { 
        phoneNumber: phoneNumber || body.toNumber,
        isActive: true 
      },
      include: { org: true }
    });

    if (!phoneNumberRecord) {
      console.error('Phone number not found:', phoneNumber || body.toNumber);
      return NextResponse.json(
        { error: "Phone number not found" },
        { status: 404 }
      );
    }

    // Handle different call events
    switch (body.event) {
      case 'call.started':
        await handleCallStarted(body, phoneNumberRecord);
        break;
      case 'call.ended':
        await handleCallEnded(body, phoneNumberRecord);
        break;
      case 'call.recording.ready':
        await handleCallRecordingReady(body, phoneNumberRecord);
        break;
      case 'call.transcript.ready':
        await handleCallTranscriptReady(body, phoneNumberRecord);
        break;
      case 'call.escalated':
        await handleCallEscalated(body, phoneNumberRecord);
        break;
      default:
        console.log('Unknown event type:', body.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing N8N webhook:', error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

async function handleCallStarted(body: any, phoneNumber: PhoneNumberRecord) {
  const call = await prisma.call.create({
    data: {
      orgId: phoneNumber.orgId,
      phoneNumberId: phoneNumber.id,
      externalId: body.callId,
      fromNumber: body.fromNumber,
      toNumber: body.toNumber,
      direction: body.direction === 'inbound' ? 'INBOUND' : 'OUTBOUND',
      status: 'IN_PROGRESS',
      startedAt: new Date(body.timestamp),
      metadata: {
        provider: 'retell',
        agentId: phoneNumber.retellAgentId,
        ...body
      }
    }
  });

  console.log('Call started:', call.id);
}

async function handleCallEnded(body: any, phoneNumber: PhoneNumberRecord) {
  const call = await prisma.call.updateMany({
    where: { externalId: body.callId },
    data: {
      status: 'COMPLETED',
      duration: body.duration || 0,
      endedAt: new Date(body.timestamp),
      disposition: body.disposition,
      escalated: body.escalated || false,
      escalatedTo: body.escalatedTo,
      cost: body.cost ? parseFloat(body.cost) : null,
      tags: body.tags || [],
      metadata: {
        ...body
      }
    }
  });

  console.log('Call ended:', body.callId);
}

async function handleCallRecordingReady(body: any, phoneNumber: PhoneNumberRecord) {
  await prisma.call.updateMany({
    where: { externalId: body.callId },
    data: {
      recordingUrl: body.recordingUrl,
      metadata: {
        recordingUrl: body.recordingUrl,
        ...body
      }
    }
  });

  console.log('Recording ready:', body.callId);
}

async function handleCallTranscriptReady(body: any, phoneNumber: PhoneNumberRecord) {
  await prisma.call.updateMany({
    where: { externalId: body.callId },
    data: {
      transcript: body.transcript,
      transcriptUrl: body.transcriptUrl,
      intent: body.intent || [],
      metadata: {
        transcript: body.transcript,
        transcriptUrl: body.transcriptUrl,
        intent: body.intent,
        ...body
      }
    }
  });

  console.log('Transcript ready:', body.callId);
}

async function handleCallEscalated(body: any, phoneNumber: PhoneNumberRecord) {
  await prisma.call.updateMany({
    where: { externalId: body.callId },
    data: {
      escalated: true,
      escalatedTo: body.escalatedTo,
      metadata: {
        escalated: true,
        escalatedTo: body.escalatedTo,
        escalationReason: body.escalationReason,
        ...body
      }
    }
  });

  console.log('Call escalated:', body.callId);
}
