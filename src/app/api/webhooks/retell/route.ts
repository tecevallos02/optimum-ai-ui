import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { createAppointmentFromCall, parseAppointmentFromTranscript } from '@/lib/appointment-creation';
import { Call } from '@/lib/types';
import { Decimal, JsonValue } from '@prisma/client/runtime/library';

type CallWithMetadata = {
  id: string;
  orgId: string;
  phoneNumberId?: string | null;
  externalId?: string | null;
  fromNumber: string;
  toNumber: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: 'RINGING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'BUSY' | 'NO_ANSWER' | 'CANCELLED';
  duration: number;
  recordingUrl?: string | null;
  transcript?: string | null;
  transcriptUrl?: string | null;
  intent: string[];
  disposition?: string | null;
  escalated: boolean;
  escalatedTo?: string | null;
  cost?: Decimal | null;
  tags: string[];
  metadata?: JsonValue;
  startedAt: Date;
  endedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  phoneNumber?: {
    id: string;
    phoneNumber: string;
    friendlyName: string | null;
  } | null;
};

// POST /api/webhooks/retell - Handle Retell AI webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = await headers();
    
    // Verify webhook signature if provided
    const webhookSecret = headersList.get('x-retell-signature');
    
    console.log('Retell Webhook received:', {
      event: body.event,
      callId: body.call_id,
      timestamp: new Date().toISOString()
    });

    // Find the call by external ID
    const call = await prisma.call.findFirst({
      where: { externalId: body.call_id },
      include: { phoneNumber: true }
    });

    if (!call) {
      console.error('Call not found:', body.call_id);
      return NextResponse.json(
        { error: "Call not found" },
        { status: 404 }
      );
    }

    // Handle different Retell events
    switch (body.event) {
      case 'call_started':
        await handleCallStarted(body, call);
        break;
      case 'call_ended':
        await handleCallEnded(body, call);
        break;
      case 'call_analyzed':
        await handleCallAnalyzed(body, call);
        break;
      case 'call_recording_ready':
        await handleCallRecordingReady(body, call);
        break;
      case 'call_transcript_ready':
        await handleCallTranscriptReady(body, call);
        break;
      case 'call_escalated':
        await handleCallEscalated(body, call);
        break;
      default:
        console.log('Unknown Retell event type:', body.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Retell webhook:', error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

async function handleCallStarted(body: any, call: CallWithMetadata) {
  await prisma.call.update({
    where: { id: call.id },
    data: {
      status: 'IN_PROGRESS',
      startedAt: new Date(body.timestamp),
      metadata: {
        ...(typeof call.metadata === 'object' && call.metadata !== null ? call.metadata as Record<string, any> : {}),
        retellEvent: body.event,
        retellTimestamp: body.timestamp,
        ...body
      }
    }
  });

  console.log('Call started via Retell:', call.id);
}

async function handleCallEnded(body: any, call: CallWithMetadata) {
  await prisma.call.update({
    where: { id: call.id },
    data: {
      status: 'COMPLETED',
      duration: body.duration || 0,
      endedAt: new Date(body.timestamp),
      disposition: body.disposition,
      escalated: body.escalated || false,
      escalatedTo: body.escalated_to,
      cost: body.cost ? parseFloat(body.cost.toString()) : null,
      tags: body.tags || [],
      metadata: {
        ...(typeof call.metadata === 'object' && call.metadata !== null ? call.metadata as Record<string, any> : {}),
        retellEvent: body.event,
        retellTimestamp: body.timestamp,
        ...body
      }
    }
  });

  console.log('Call ended via Retell:', call.id);
}

async function handleCallAnalyzed(body: any, call: CallWithMetadata) {
  await prisma.call.update({
    where: { id: call.id },
    data: {
      intent: body.intent || [],
      disposition: body.disposition,
      escalated: body.escalated || false,
      metadata: {
        ...(typeof call.metadata === 'object' && call.metadata !== null ? call.metadata as Record<string, any> : {}),
        retellEvent: body.event,
        retellTimestamp: body.timestamp,
        analysis: body.analysis,
        ...body
      }
    }
  });

  // If the call resulted in a booking and we have transcript, try to create an appointment
  if ((body.disposition === 'booked' || body.intent?.includes('book')) && body.transcript) {
    try {
      const appointmentData = await parseAppointmentFromTranscript(
        body.transcript,
        call.fromNumber, // Use phone number as customer name for now
        call.fromNumber
      );

      if (appointmentData) {
        await createAppointmentFromCall(call.id, appointmentData);
        console.log('Appointment created from call analysis:', call.id);
      }
    } catch (error) {
      console.error('Error creating appointment from call analysis:', error);
    }
  }

  console.log('Call analyzed via Retell:', call.id);
}

async function handleCallRecordingReady(body: any, call: CallWithMetadata) {
  await prisma.call.update({
    where: { id: call.id },
    data: {
      recordingUrl: body.recording_url,
      metadata: {
        ...(typeof call.metadata === 'object' && call.metadata !== null ? call.metadata as Record<string, any> : {}),
        retellEvent: body.event,
        retellTimestamp: body.timestamp,
        recordingUrl: body.recording_url,
        ...body
      }
    }
  });

  console.log('Recording ready via Retell:', call.id);
}

async function handleCallTranscriptReady(body: any, call: CallWithMetadata) {
  await prisma.call.update({
    where: { id: call.id },
    data: {
      transcript: body.transcript,
      transcriptUrl: body.transcript_url,
      intent: body.intent || [],
      metadata: {
        ...(typeof call.metadata === 'object' && call.metadata !== null ? call.metadata as Record<string, any> : {}),
        retellEvent: body.event,
        retellTimestamp: body.timestamp,
        transcript: body.transcript,
        transcriptUrl: body.transcript_url,
        ...body
      }
    }
  });

  console.log('Transcript ready via Retell:', call.id);
}

async function handleCallEscalated(body: any, call: CallWithMetadata) {
  await prisma.call.update({
    where: { id: call.id },
    data: {
      escalated: true,
      escalatedTo: body.escalated_to,
      metadata: {
        ...(typeof call.metadata === 'object' && call.metadata !== null ? call.metadata as Record<string, any> : {}),
        retellEvent: body.event,
        retellTimestamp: body.timestamp,
        escalated: true,
        escalatedTo: body.escalated_to,
        escalationReason: body.escalation_reason,
        ...body
      }
    }
  });

  console.log('Call escalated via Retell:', call.id);
}
