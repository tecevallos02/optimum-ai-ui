/**
 * Organization n8n Configuration API
 *
 * Manages n8n workflow configuration for each organization.
 * Allows admins to setup, update, and retrieve n8n config per org.
 *
 * Endpoints:
 * - GET    /api/organizations/[orgId]/n8n - Get n8n config
 * - POST   /api/organizations/[orgId]/n8n - Create/Update n8n config
 * - DELETE /api/organizations/[orgId]/n8n - Delete n8n config
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, generateSecret } from "@/lib/encryption";
import { getServerSession } from "next-auth";

/**
 * GET /api/organizations/[orgId]/n8n
 *
 * Get n8n configuration for an organization
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = params;

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

    // Get n8n config
    const n8nConfig = await prisma.organizationN8n.findUnique({
      where: { orgId },
      include: {
        org: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!n8nConfig) {
      return NextResponse.json(
        { error: "n8n configuration not found" },
        { status: 404 },
      );
    }

    // Decrypt API key for display (mask most of it)
    let maskedApiKey = "";
    try {
      const decryptedKey = decrypt(n8nConfig.apiKey);
      maskedApiKey = `${decryptedKey.substring(0, 8)}...${decryptedKey.substring(decryptedKey.length - 4)}`;
    } catch {
      maskedApiKey = "***encrypted***";
    }

    return NextResponse.json({
      id: n8nConfig.id,
      orgId: n8nConfig.orgId,
      organizationName: n8nConfig.org.name,
      n8nInstanceUrl: n8nConfig.n8nInstanceUrl,
      workflowId: n8nConfig.workflowId,
      apiKey: maskedApiKey,
      webhookUrl: n8nConfig.webhookUrl,
      isActive: n8nConfig.isActive,
      metadata: n8nConfig.metadata,
      createdAt: n8nConfig.createdAt,
      updatedAt: n8nConfig.updatedAt,
    });
  } catch (error) {
    console.error("[n8n Config API] Error fetching config:", error);
    return NextResponse.json(
      { error: "Failed to fetch n8n configuration" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/organizations/[orgId]/n8n
 *
 * Create or update n8n configuration for an organization
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = params;

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
    if (!body.n8nInstanceUrl || !body.workflowId || !body.apiKey) {
      return NextResponse.json(
        { error: "Missing required fields: n8nInstanceUrl, workflowId, apiKey" },
        { status: 400 },
      );
    }

    // Encrypt API key
    const encryptedApiKey = encrypt(body.apiKey);

    // Generate webhook secret if not provided
    const webhookSecret = body.webhookSecret || generateSecret(32);

    // Check if config already exists
    const existingConfig = await prisma.organizationN8n.findUnique({
      where: { orgId },
    });

    let n8nConfig;

    if (existingConfig) {
      // Update existing config
      n8nConfig = await prisma.organizationN8n.update({
        where: { orgId },
        data: {
          n8nInstanceUrl: body.n8nInstanceUrl,
          workflowId: body.workflowId,
          apiKey: encryptedApiKey,
          webhookUrl: body.webhookUrl,
          webhookSecret,
          isActive: body.isActive !== undefined ? body.isActive : true,
          metadata: body.metadata,
        },
      });

      console.log(`[n8n Config API] Updated config for org ${orgId}`);
    } else {
      // Create new config
      n8nConfig = await prisma.organizationN8n.create({
        data: {
          orgId,
          n8nInstanceUrl: body.n8nInstanceUrl,
          workflowId: body.workflowId,
          apiKey: encryptedApiKey,
          webhookUrl: body.webhookUrl,
          webhookSecret,
          isActive: body.isActive !== undefined ? body.isActive : true,
          metadata: body.metadata,
        },
      });

      console.log(`[n8n Config API] Created config for org ${orgId}`);
    }

    return NextResponse.json({
      id: n8nConfig.id,
      orgId: n8nConfig.orgId,
      n8nInstanceUrl: n8nConfig.n8nInstanceUrl,
      workflowId: n8nConfig.workflowId,
      webhookUrl: n8nConfig.webhookUrl,
      webhookSecret,
      isActive: n8nConfig.isActive,
      metadata: n8nConfig.metadata,
      message: existingConfig
        ? "n8n configuration updated successfully"
        : "n8n configuration created successfully",
    });
  } catch (error) {
    console.error("[n8n Config API] Error saving config:", error);
    return NextResponse.json(
      { error: "Failed to save n8n configuration" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/organizations/[orgId]/n8n
 *
 * Delete n8n configuration for an organization
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = params;

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

    // Delete n8n config
    await prisma.organizationN8n.delete({
      where: { orgId },
    });

    console.log(`[n8n Config API] Deleted config for org ${orgId}`);

    return NextResponse.json({
      message: "n8n configuration deleted successfully",
    });
  } catch (error) {
    console.error("[n8n Config API] Error deleting config:", error);
    return NextResponse.json(
      { error: "Failed to delete n8n configuration" },
      { status: 500 },
    );
  }
}
