/**
 * Organization Retell Configuration API
 *
 * Manages Retell AI agent configuration for each organization.
 * Allows admins to setup, update, and retrieve Retell config per org.
 *
 * Endpoints:
 * - GET    /api/organizations/[orgId]/retell - Get Retell config
 * - POST   /api/organizations/[orgId]/retell - Create/Update Retell config
 * - DELETE /api/organizations/[orgId]/retell - Delete Retell config
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, generateSecret } from "@/lib/encryption";
import { getServerSession } from "next-auth/next";

/**
 * GET /api/organizations/[orgId]/retell
 *
 * Get Retell configuration for an organization
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await params;

    // Verify user has access to this organization
    const membership = await prisma.membership.findFirst({
      where: {
        userId: (session.user as any).id,
        orgId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get Retell config
    const retellConfig = await prisma.organizationRetell.findUnique({
      where: { orgId },
      include: {
        org: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!retellConfig) {
      return NextResponse.json(
        { error: "Retell configuration not found" },
        { status: 404 },
      );
    }

    // Decrypt API key for display (mask most of it)
    let maskedApiKey = "";
    try {
      const decryptedKey = decrypt(retellConfig.apiKey);
      maskedApiKey = `${decryptedKey.substring(0, 8)}...${decryptedKey.substring(decryptedKey.length - 4)}`;
    } catch {
      maskedApiKey = "***encrypted***";
    }

    return NextResponse.json({
      id: retellConfig.id,
      orgId: retellConfig.orgId,
      organizationName: retellConfig.org.name,
      retellAgentId: retellConfig.retellAgentId,
      retellPhoneNumber: retellConfig.retellPhoneNumber,
      apiKey: maskedApiKey,
      voiceId: retellConfig.voiceId,
      language: retellConfig.language,
      customPrompt: retellConfig.customPrompt,
      callSettings: retellConfig.callSettings,
      isActive: retellConfig.isActive,
      createdAt: retellConfig.createdAt,
      updatedAt: retellConfig.updatedAt,
    });
  } catch (error) {
    console.error("[Retell Config API] Error fetching config:", error);
    return NextResponse.json(
      { error: "Failed to fetch Retell configuration" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/organizations/[orgId]/retell
 *
 * Create or update Retell configuration for an organization
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await params;

    // Verify user has access to this organization (simplified - all users are owners)
    const membership = await prisma.membership.findFirst({
      where: {
        userId: (session.user as any).id,
        orgId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this organization" },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.retellAgentId || !body.apiKey) {
      return NextResponse.json(
        { error: "Missing required fields: retellAgentId, apiKey" },
        { status: 400 },
      );
    }

    // Encrypt API key
    const encryptedApiKey = encrypt(body.apiKey);

    // Generate webhook secret if not provided
    const webhookSecret = body.webhookSecret || generateSecret(32);

    // Check if config already exists
    const existingConfig = await prisma.organizationRetell.findUnique({
      where: { orgId },
    });

    let retellConfig;

    if (existingConfig) {
      // Update existing config
      retellConfig = await prisma.organizationRetell.update({
        where: { orgId },
        data: {
          retellAgentId: body.retellAgentId,
          retellPhoneNumber: body.retellPhoneNumber,
          apiKey: encryptedApiKey,
          webhookSecret,
          voiceId: body.voiceId,
          language: body.language || "en-US",
          customPrompt: body.customPrompt,
          callSettings: body.callSettings,
          isActive: body.isActive !== undefined ? body.isActive : true,
        },
      });

      console.log(`[Retell Config API] Updated config for org ${orgId}`);
    } else {
      // Create new config
      retellConfig = await prisma.organizationRetell.create({
        data: {
          orgId,
          retellAgentId: body.retellAgentId,
          retellPhoneNumber: body.retellPhoneNumber,
          apiKey: encryptedApiKey,
          webhookSecret,
          voiceId: body.voiceId,
          language: body.language || "en-US",
          customPrompt: body.customPrompt,
          callSettings: body.callSettings,
          isActive: body.isActive !== undefined ? body.isActive : true,
        },
      });

      console.log(`[Retell Config API] Created config for org ${orgId}`);
    }

    // Return webhook URL for Retell setup
    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.RETELL_WEBHOOK_BASE_URL}/api/webhooks/retell`;

    return NextResponse.json({
      id: retellConfig.id,
      orgId: retellConfig.orgId,
      retellAgentId: retellConfig.retellAgentId,
      retellPhoneNumber: retellConfig.retellPhoneNumber,
      webhookUrl,
      webhookSecret,
      voiceId: retellConfig.voiceId,
      language: retellConfig.language,
      customPrompt: retellConfig.customPrompt,
      callSettings: retellConfig.callSettings,
      isActive: retellConfig.isActive,
      message: existingConfig
        ? "Retell configuration updated successfully"
        : "Retell configuration created successfully. Configure this webhook URL in your Retell agent settings.",
    });
  } catch (error) {
    console.error("[Retell Config API] Error saving config:", error);
    return NextResponse.json(
      { error: "Failed to save Retell configuration" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/organizations/[orgId]/retell
 *
 * Delete Retell configuration for an organization
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await params;

    // Verify user has access to this organization (simplified - all users are owners)
    const membership = await prisma.membership.findFirst({
      where: {
        userId: (session.user as any).id,
        orgId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this organization" },
        { status: 403 },
      );
    }

    // Delete Retell config
    await prisma.organizationRetell.delete({
      where: { orgId },
    });

    console.log(`[Retell Config API] Deleted config for org ${orgId}`);

    return NextResponse.json({
      message: "Retell configuration deleted successfully",
    });
  } catch (error) {
    console.error("[Retell Config API] Error deleting config:", error);
    return NextResponse.json(
      { error: "Failed to delete Retell configuration" },
      { status: 500 },
    );
  }
}
