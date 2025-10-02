import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { requireRole, getCurrentOrgId } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { randomBytes } from "crypto"

const prisma = new PrismaClient()

// POST /api/invitations - Create invitation (OWNER/MANAGER only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('MANAGER') // MANAGER or OWNER can invite
    const currentOrgId = await getCurrentOrgId()
    
    if (!currentOrgId) {
      return NextResponse.json(
        { error: "No organization selected" },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    if (!body.email || !body.role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      )
    }
    
    if (!['OWNER', 'MANAGER', 'AGENT'].includes(body.role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      )
    }
    
    // Check if user is already a member
    const existingMembership = await prisma.membership.findFirst({
      where: {
        orgId: currentOrgId,
        user: { email: body.email },
      },
    })
    
    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 }
      )
    }
    
    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        orgId: currentOrgId,
        email: body.email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    })
    
    if (existingInvitation) {
      return NextResponse.json(
        { error: "Invitation already sent to this email" },
        { status: 400 }
      )
    }
    
    // Generate secure token
    const token = randomBytes(32).toString('hex')
    
    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        orgId: currentOrgId,
        email: body.email,
        role: body.role,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdBy: user.id,
      },
      include: {
        org: true,
        creator: { select: { name: true, email: true } },
      },
    })
    
    // Log audit event
    await logAudit('invite:created', user.id, currentOrgId, body.email)
    
    // TODO: Send email with invitation link
    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${token}`
    console.log(`Invitation created: ${inviteUrl}`)
    
    return NextResponse.json({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      inviteUrl,
      expiresAt: invitation.expiresAt,
    })
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    )
  }
}



