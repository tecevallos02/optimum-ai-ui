import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/phone-numbers/[id] - Get a specific phone number
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    
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

    const phoneNumber = await prisma.phoneNumber.findFirst({
      where: { 
        id: id,
        orgId: membership.orgId 
      },
      include: {
        calls: {
          orderBy: { startedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(phoneNumber);
  } catch (error) {
    console.error('Error fetching phone number:', error);
    return NextResponse.json(
      { error: "Failed to fetch phone number" },
      { status: 500 }
    );
  }
}

// PUT /api/phone-numbers/[id] - Update a phone number
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
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

    // Check if phone number exists and belongs to organization
    const existingPhoneNumber = await prisma.phoneNumber.findFirst({
      where: { 
        id: id,
        orgId: membership.orgId 
      }
    });

    if (!existingPhoneNumber) {
      return NextResponse.json(
        { error: "Phone number not found" },
        { status: 404 }
      );
    }

    // If this is set as primary, unset other primary numbers
    if (body.isPrimary) {
      await prisma.phoneNumber.updateMany({
        where: { 
          orgId: membership.orgId,
          isPrimary: true,
          id: { not: id }
        },
        data: { isPrimary: false }
      });
    }

    const phoneNumber = await prisma.phoneNumber.update({
      where: { id: id },
      data: {
        phoneNumber: body.phoneNumber,
        friendlyName: body.friendlyName,
        provider: body.provider,
        providerId: body.providerId,
        isActive: body.isActive,
        isPrimary: body.isPrimary,
        capabilities: body.capabilities,
        webhookUrl: body.webhookUrl,
        retellAgentId: body.retellAgentId,
        retellApiKey: body.retellApiKey,
        n8nWorkflowId: body.n8nWorkflowId,
        n8nWebhookSecret: body.n8nWebhookSecret,
      }
    });

    // Log audit event
    await logAudit('phone_number:updated', user.id, membership.orgId, phoneNumber.id);

    return NextResponse.json(phoneNumber);
  } catch (error) {
    console.error('Error updating phone number:', error);
    return NextResponse.json(
      { error: "Failed to update phone number" },
      { status: 500 }
    );
  }
}

// DELETE /api/phone-numbers/[id] - Delete a phone number
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    
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

    // Check if phone number exists and belongs to organization
    const existingPhoneNumber = await prisma.phoneNumber.findFirst({
      where: { 
        id: id,
        orgId: membership.orgId 
      }
    });

    if (!existingPhoneNumber) {
      return NextResponse.json(
        { error: "Phone number not found" },
        { status: 404 }
      );
    }

    await prisma.phoneNumber.delete({
      where: { id: id }
    });

    // Log audit event
    await logAudit('phone_number:deleted', user.id, membership.orgId, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting phone number:', error);
    return NextResponse.json(
      { error: "Failed to delete phone number" },
      { status: 500 }
    );
  }
}
