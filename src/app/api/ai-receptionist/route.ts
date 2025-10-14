import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { createDefaultRetellAgent } from '@/lib/retell';

// GET /api/ai-receptionist - Get AI receptionist configurations for the current organization
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    
    // Get user's current organization
    const membership = await prisma.membership.findFirst({
      where: { userId: user.id },
      include: { org: true }
    });

    if (!membership) {
      return NextResponse.json(
        { error: "User not associated with any organization" },
        { status: 404 }
      );
    }

    const configs = await prisma.aiReceptionistConfig.findMany({
      where: { orgId: membership.orgId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ configs });
  } catch (error) {
    console.error('Error fetching AI receptionist configs:', error);
    return NextResponse.json(
      { error: "Failed to fetch AI receptionist configurations" },
      { status: 500 }
    );
  }
}

// POST /api/ai-receptionist - Create a new AI receptionist configuration
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    
    // Get user's current organization
    const membership = await prisma.membership.findFirst({
      where: { userId: user.id },
      include: { org: true }
    });

    if (!membership) {
      return NextResponse.json(
        { error: "User not associated with any organization" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Configuration name is required" },
        { status: 400 }
      );
    }

    // If this is set as active, deactivate other configs
    if (body.isActive) {
      await prisma.aiReceptionistConfig.updateMany({
        where: { 
          orgId: membership.orgId,
          isActive: true 
        },
        data: { isActive: false }
      });
    }

    // Create Retell agent if API key is provided
    let retellAgentId = body.retellAgentId;
    if (body.retellApiKey && !retellAgentId) {
      retellAgentId = await createDefaultRetellAgent(membership.orgId, body.retellApiKey);
    }

    const config = await prisma.aiReceptionistConfig.create({
      data: {
        orgId: membership.orgId,
        name: body.name,
        isActive: body.isActive ?? true,
        retellAgentId: retellAgentId,
        retellApiKey: body.retellApiKey,
        voiceSettings: body.voiceSettings || {
          voice_id: "sarah",
          speed: 1.0,
          temperature: 0.8
        },
        greetingMessage: body.greetingMessage || "Hello! Thank you for calling. How can I help you today?",
        businessHoursMessage: body.businessHoursMessage || "Thank you for calling. We're currently outside of business hours. Please leave a message and we'll get back to you soon.",
        escalationRules: body.escalationRules || {
          keywords: ["manager", "supervisor", "complaint", "urgent"],
          maxAttempts: 3,
          escalationMessage: "Let me connect you with a human agent who can better assist you."
        },
        appointmentSettings: body.appointmentSettings || {
          enabled: true,
          bookingWindow: 30, // days
          bufferTime: 15, // minutes
          confirmationMessage: "Your appointment has been scheduled. You'll receive a confirmation email shortly."
        },
        n8nWorkflowId: body.n8nWorkflowId,
        n8nWebhookUrl: body.n8nWebhookUrl,
      }
    });

    // Log audit event
    await logAudit('ai_receptionist:created', user.id, membership.orgId, config.id);

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error creating AI receptionist config:', error);
    return NextResponse.json(
      { error: "Failed to create AI receptionist configuration" },
      { status: 500 }
    );
  }
}
