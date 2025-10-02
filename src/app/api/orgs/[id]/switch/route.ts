import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { requireUser } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { cookies } from "next/headers"

const prisma = new PrismaClient()

// POST /api/orgs/[id]/switch - Switch current organization
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id: orgId } = await params
    
    // Verify user is a member of this organization
    const membership = await prisma.membership.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: orgId,
        },
      },
      include: { org: true },
    })
    
    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this organization" },
        { status: 403 }
      )
    }
    
    // Set the current org cookie
    const cookieStore = await cookies()
    cookieStore.set('currentOrgId', orgId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    
    // Log audit event
    await logAudit('org:switch', user.id, orgId, orgId)
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error switching organization:', error)
    return NextResponse.json(
      { error: "Failed to switch organization" },
      { status: 500 }
    )
  }
}
