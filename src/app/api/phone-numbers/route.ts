import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/phone-numbers - Get all phone numbers for the current organization
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

    const phoneNumbers = await prisma.phoneNumber.findMany({
      where: { orgId: membership.orgId },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ phoneNumbers });
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    return NextResponse.json(
      { error: "Failed to fetch phone numbers" },
      { status: 500 }
    );
  }
}

// POST /api/phone-numbers - Create a new phone number
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
    if (!body.phoneNumber || !body.provider) {
      return NextResponse.json(
        { error: "Phone number and provider are required" },
        { status: 400 }
      );
    }

    // If this is set as primary, unset other primary numbers
    if (body.isPrimary) {
      await prisma.phoneNumber.updateMany({
        where: { 
          orgId: membership.orgId,
          isPrimary: true 
        },
        data: { isPrimary: false }
      });
    }

    const phoneNumber = await prisma.phoneNumber.create({
      data: {
        orgId: membership.orgId,
        phoneNumber: body.phoneNumber,
        friendlyName: body.friendlyName,
        provider: body.provider,
        providerId: body.providerId,
        isActive: body.isActive ?? true,
        isPrimary: body.isPrimary ?? false,
        capabilities: body.capabilities ?? [],
        webhookUrl: body.webhookUrl,
        retellAgentId: body.retellAgentId,
        retellApiKey: body.retellApiKey,
        n8nWorkflowId: body.n8nWorkflowId,
        n8nWebhookSecret: body.n8nWebhookSecret,
      }
    });

    // Log audit event
    await logAudit('phone_number:created', user.id, membership.orgId, phoneNumber.id);

    return NextResponse.json(phoneNumber);
  } catch (error) {
    console.error('Error creating phone number:', error);
    return NextResponse.json(
      { error: "Failed to create phone number" },
      { status: 500 }
    );
  }
}
