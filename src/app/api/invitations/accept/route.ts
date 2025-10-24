import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const prisma = new PrismaClient();

// POST /api/invitations/accept - Accept invitation
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();

    if (!body.token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find valid invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token: body.token },
      include: { org: true },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 400 },
      );
    }

    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "Invitation already accepted" },
        { status: 400 },
      );
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 },
      );
    }

    if (invitation.email !== user.email) {
      return NextResponse.json(
        { error: "Invitation email does not match your account" },
        { status: 400 },
      );
    }

    // Check if user is already a member
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: invitation.orgId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "You are already a member of this organization" },
        { status: 400 },
      );
    }

    // Accept invitation in a transaction
    await prisma.$transaction(async (tx) => {
      // Create membership
      await tx.membership.create({
        data: {
          userId: user.id,
          orgId: invitation.orgId,
          role: invitation.role,
        },
      });

      // Mark invitation as accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });

      return null;
    });

    // Log audit event
    await logAudit("invite:accepted", user.id, invitation.orgId, invitation.id);

    return NextResponse.json({
      orgId: invitation.orgId,
      orgName: invitation.org.name,
      role: invitation.role,
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 },
    );
  }
}
