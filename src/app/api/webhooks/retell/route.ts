/**
 * Retell AI Webhook Handler
 *
 * This endpoint receives webhooks from Retell AI when calls are completed.
 * It handles organization isolation by routing calls to the correct org based on agent ID.
 *
 * Security:
 * - Validates HMAC signature to ensure webhooks are from Retell
 * - Uses organization-specific webhook secrets
 *
 * Flow:
 * 1. Receive webhook from Retell
 * 2. Validate signature
 * 3. Identify organization by agent ID
 * 4. Store call log in database
 * 5. Trigger n8n workflow for that organization
 * 6. Return success response
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyHmacSignature } from "@/lib/encryption";
import { CallStatus, CallIntent } from "@prisma/client";

// Retell webhook event types
type RetellWebhookEvent = {
  event: "call_started" | "call_ended" | "call_analyzed";
  call: {
    call_id: string;
    agent_id: string;
    from_number: string;
    to_number: string;
    start_timestamp: number;
    end_timestamp?: number;
    transcript?: string;
    recording_url?: string;
    call_analysis?: {
      summary?: string;
      intent?: string;
      sentiment?: string;
      custom_data?: Record<string, any>;
    };
  };
};

/**
 * POST /api/webhooks/retell
 *
 * Receives webhooks from Retell AI
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse the request body
    const body = await request.text();
    const payload: RetellWebhookEvent = JSON.parse(body);

    console.log(`[Retell Webhook] Received event: ${payload.event} for call ${payload.call.call_id}`);

    // 2. Find the organization by agent ID
    const orgRetellConfig = await prisma.organizationRetell.findFirst({
      where: {
        retellAgentId: payload.call.agent_id,
        isActive: true,
      },
      include: {
        org: {
          include: {
            n8nConfig: true,
          },
        },
      },
    });

    if (!orgRetellConfig) {
      console.error(`[Retell Webhook] No organization found for agent ID: ${payload.call.agent_id}`);
      return NextResponse.json(
        { error: "Organization not found for this agent" },
        { status: 404 },
      );
    }

    // 3. Verify webhook signature
    const signature = request.headers.get("x-retell-signature");
    if (!signature) {
      console.error("[Retell Webhook] Missing signature header");
      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 401 },
      );
    }

    const isValidSignature = verifyHmacSignature(
      orgRetellConfig.webhookSecret,
      body,
      signature,
    );

    if (!isValidSignature) {
      console.error("[Retell Webhook] Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    // 4. Handle different event types
    switch (payload.event) {
      case "call_started":
        await handleCallStarted(orgRetellConfig.orgId, payload);
        break;

      case "call_ended":
        await handleCallEnded(orgRetellConfig.orgId, payload);
        break;

      case "call_analyzed":
        await handleCallAnalyzed(orgRetellConfig.orgId, payload, orgRetellConfig.org.n8nConfig);
        break;

      default:
        console.warn(`[Retell Webhook] Unknown event type: ${payload.event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Retell Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}

/**
 * Handle call_started event
 * Creates initial call log entry
 */
async function handleCallStarted(
  orgId: string,
  payload: RetellWebhookEvent,
) {
  console.log(`[Retell Webhook] Handling call_started for org ${orgId}`);

  try {
    await prisma.callLog.create({
      data: {
        orgId,
        callId: payload.call.call_id,
        retellAgentId: payload.call.agent_id,
        customerPhone: payload.call.from_number,
        duration: 0,
        status: CallStatus.IN_PROGRESS,
        createdAt: new Date(payload.call.start_timestamp * 1000),
      },
    });

    console.log(`[Retell Webhook] Created call log for ${payload.call.call_id}`);
  } catch (error) {
    console.error("[Retell Webhook] Error creating call log:", error);
    throw error;
  }
}

/**
 * Handle call_ended event
 * Updates call log with duration and final status
 */
async function handleCallEnded(
  orgId: string,
  payload: RetellWebhookEvent,
) {
  console.log(`[Retell Webhook] Handling call_ended for org ${orgId}`);

  try {
    const duration = payload.call.end_timestamp && payload.call.start_timestamp
      ? payload.call.end_timestamp - payload.call.start_timestamp
      : 0;

    // Calculate estimated time saved (assuming 70% efficiency)
    const timeSaved = Math.floor(duration * 0.7);

    // Calculate cost (example: $0.02 per second)
    const costUSD = duration * 0.02;

    await prisma.callLog.update({
      where: { callId: payload.call.call_id },
      data: {
        duration,
        status: CallStatus.COMPLETED,
        recordingUrl: payload.call.recording_url,
        transcript: payload.call.transcript,
        timeSaved,
        costUSD,
      },
    });

    console.log(`[Retell Webhook] Updated call log for ${payload.call.call_id}`);
  } catch (error) {
    console.error("[Retell Webhook] Error updating call log:", error);
    throw error;
  }
}

/**
 * Handle call_analyzed event
 * Updates call log with AI analysis and triggers n8n workflow
 */
async function handleCallAnalyzed(
  orgId: string,
  payload: RetellWebhookEvent,
  n8nConfig: any,
) {
  console.log(`[Retell Webhook] Handling call_analyzed for org ${orgId}`);

  try {
    const analysis = payload.call.call_analysis;

    // Map Retell intent to our CallIntent enum
    const intent = mapIntentToEnum(analysis?.intent);

    // Update call log with analysis
    await prisma.callLog.update({
      where: { callId: payload.call.call_id },
      data: {
        summary: analysis?.summary,
        intent,
        sentiment: analysis?.sentiment,
        metadata: analysis?.custom_data,
      },
    });

    console.log(`[Retell Webhook] Updated call analysis for ${payload.call.call_id}`);

    // Trigger n8n workflow if configured
    if (n8nConfig && n8nConfig.isActive && n8nConfig.webhookUrl) {
      await triggerN8nWorkflow(orgId, n8nConfig, payload);
    }

    // Auto-create contact if doesn't exist
    await createOrUpdateContact(orgId, payload);

    // Auto-create appointment if intent is booking
    if (intent === CallIntent.BOOKING) {
      await createAppointmentFromCall(orgId, payload);
    }
  } catch (error) {
    console.error("[Retell Webhook] Error handling call analysis:", error);
    throw error;
  }
}

/**
 * Map Retell intent string to our CallIntent enum
 */
function mapIntentToEnum(intent?: string): CallIntent | null {
  if (!intent) return null;

  const intentMap: Record<string, CallIntent> = {
    booking: CallIntent.BOOKING,
    appointment: CallIntent.BOOKING,
    schedule: CallIntent.BOOKING,
    reschedule: CallIntent.RESCHEDULE,
    cancel: CallIntent.CANCELLATION,
    cancellation: CallIntent.CANCELLATION,
    quote: CallIntent.QUOTE,
    pricing: CallIntent.QUOTE,
    price: CallIntent.QUOTE,
    information: CallIntent.INFORMATION,
    inquiry: CallIntent.INFORMATION,
    complaint: CallIntent.COMPLAINT,
    issue: CallIntent.COMPLAINT,
  };

  return intentMap[intent.toLowerCase()] || CallIntent.OTHER;
}

/**
 * Trigger n8n workflow for this organization
 */
async function triggerN8nWorkflow(
  orgId: string,
  n8nConfig: any,
  payload: RetellWebhookEvent,
) {
  try {
    console.log(`[Retell Webhook] Triggering n8n workflow for org ${orgId}`);

    const workflowPayload = {
      orgId,
      callId: payload.call.call_id,
      agentId: payload.call.agent_id,
      customerPhone: payload.call.from_number,
      transcript: payload.call.transcript,
      analysis: payload.call.call_analysis,
      timestamp: new Date().toISOString(),
    };

    // Log workflow execution
    const startedAt = new Date();

    const response = await fetch(n8nConfig.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(workflowPayload),
    });

    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();

    if (response.ok) {
      const output = await response.json();

      // Log successful execution
      await prisma.workflowExecution.create({
        data: {
          orgId,
          workflowId: n8nConfig.workflowId,
          executionId: `n8n_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          trigger: "webhook",
          status: "SUCCESS",
          input: workflowPayload,
          output,
          startedAt,
          completedAt,
          durationMs,
        },
      });

      console.log(`[Retell Webhook] n8n workflow triggered successfully`);
    } else {
      throw new Error(`n8n workflow returned status ${response.status}`);
    }
  } catch (error) {
    console.error("[Retell Webhook] Error triggering n8n workflow:", error);

    // Log failed execution
    await prisma.workflowExecution.create({
      data: {
        orgId,
        workflowId: n8nConfig.workflowId,
        executionId: `n8n_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        trigger: "webhook",
        status: "ERROR",
        input: payload,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        startedAt: new Date(),
      },
    });
  }
}

/**
 * Create or update contact from call
 */
async function createOrUpdateContact(
  orgId: string,
  payload: RetellWebhookEvent,
) {
  try {
    const customerPhone = payload.call.from_number;
    const customerName = payload.call.call_analysis?.custom_data?.customer_name;

    // Check if contact exists
    const existingContact = await prisma.contact.findFirst({
      where: {
        orgId,
        phone: customerPhone,
      },
    });

    if (existingContact) {
      // Update existing contact
      await prisma.contact.update({
        where: { id: existingContact.id },
        data: {
          name: customerName || existingContact.name,
          source: "ai_receptionist",
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new contact
      await prisma.contact.create({
        data: {
          orgId,
          name: customerName || "Unknown Caller",
          phone: customerPhone,
          source: "ai_receptionist",
          tags: ["ai_call"],
        },
      });
    }

    console.log(`[Retell Webhook] Created/updated contact for ${customerPhone}`);
  } catch (error) {
    console.error("[Retell Webhook] Error creating/updating contact:", error);
  }
}

/**
 * Create appointment from booking call
 */
async function createAppointmentFromCall(
  orgId: string,
  payload: RetellWebhookEvent,
) {
  try {
    const customData = payload.call.call_analysis?.custom_data;

    if (!customData?.appointment_date || !customData?.appointment_time) {
      console.log("[Retell Webhook] No appointment data in call analysis");
      return;
    }

    // Parse appointment date/time
    const appointmentDateTime = new Date(`${customData.appointment_date}T${customData.appointment_time}`);
    const duration = customData.appointment_duration || 60; // Default 60 minutes
    const endDateTime = new Date(appointmentDateTime.getTime() + duration * 60000);

    await prisma.appointment.create({
      data: {
        orgId,
        title: customData.service || "Phone Appointment",
        customerName: customData.customer_name || "Unknown Caller",
        customerPhone: payload.call.from_number,
        customerEmail: customData.customer_email,
        startsAt: appointmentDateTime,
        endsAt: endDateTime,
        status: "SCHEDULED",
        source: "PHONE",
        notes: `Booked via AI receptionist. Call ID: ${payload.call.call_id}`,
      },
    });

    console.log(`[Retell Webhook] Created appointment from call ${payload.call.call_id}`);
  } catch (error) {
    console.error("[Retell Webhook] Error creating appointment:", error);
  }
}
