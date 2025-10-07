import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { requireUser, getCurrentOrgId } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

const prisma = new PrismaClient()

// GET /api/complaints - List complaints for current organization
export async function GET(request: NextRequest) {
  try {
    await requireUser()
    const currentOrgId = await getCurrentOrgId()
    
    if (!currentOrgId) {
      return NextResponse.json(
        { error: "No organization selected" },
        { status: 400 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') || ''
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: Record<string, unknown> = { orgId: currentOrgId }
    
    if (status) {
      where.status = status.toUpperCase()
    }
    
    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.complaint.count({ where }),
    ])
    
    return NextResponse.json({
      complaints,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching complaints:', error)
    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 }
    )
  }
}

// POST /api/complaints - Create new complaint
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const currentOrgId = await getCurrentOrgId()
    
    if (!currentOrgId) {
      return NextResponse.json(
        { error: "No organization selected" },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    if (!body.phoneNumber || typeof body.phoneNumber !== 'string') {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      )
    }
    
    if (!body.callTimestamp) {
      return NextResponse.json(
        { error: "Call timestamp is required" },
        { status: 400 }
      )
    }
    
    const complaint = await prisma.complaint.create({
      data: {
        orgId: currentOrgId,
        phoneNumber: body.phoneNumber.trim(),
        callTimestamp: new Date(body.callTimestamp),
        description: body.description?.trim() || null,
        status: 'OPEN',
      },
    })
    
    // Log audit event
    await logAudit('complaint:created', user.id, currentOrgId, complaint.id)
    
    return NextResponse.json(complaint, { status: 201 })
  } catch (error) {
    console.error('Error creating complaint:', error)
    return NextResponse.json(
      { error: "Failed to create complaint" },
      { status: 500 }
    )
  }
}
