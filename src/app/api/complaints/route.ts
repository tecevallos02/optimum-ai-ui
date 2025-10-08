import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { requireUser, getCurrentOrgId } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

const prisma = new PrismaClient()

// GET /api/complaints - List complaints for current user's organization
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser()
    
    // Get user's organization and ensure it exists in the database
    const userData = await prisma.user.findFirst({
      where: { id: user.id }
    }) as any;
    
    const orgName = userData?.organization || 'Default Organization'
    
    // Ensure organization exists in the database
    let org = await prisma.organization.findFirst({
      where: { name: orgName }
    })
    
    if (!org) {
      console.log('Creating organization for complaints GET:', orgName);
      org = await prisma.organization.create({
        data: {
          name: orgName,
        }
      })
    }
    
    const orgId = org.id
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') || ''
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: Record<string, unknown> = { orgId: orgId }
    
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
    
    // Get user's organization and ensure it exists in the database
    const userData = await prisma.user.findFirst({
      where: { id: user.id }
    }) as any;
    
    const orgName = userData?.organization || 'Default Organization'
    
    // Ensure organization exists in the database
    let org = await prisma.organization.findFirst({
      where: { name: orgName }
    })
    
    if (!org) {
      console.log('Creating organization for complaints POST:', orgName);
      org = await prisma.organization.create({
        data: {
          name: orgName,
        }
      })
    }
    
    const orgId = org.id
    
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
        orgId: orgId,
        phoneNumber: body.phoneNumber.trim(),
        callTimestamp: new Date(body.callTimestamp),
        description: body.description?.trim() || null,
        status: 'OPEN',
      },
    })
    
    // Log audit event (disabled for now due to orgId mismatch)
    // await logAudit('complaint:created', user.id, orgId, complaint.id)
    
    return NextResponse.json(complaint, { status: 201 })
  } catch (error) {
    console.error('Error creating complaint:', error)
    return NextResponse.json(
      { error: "Failed to create complaint" },
      { status: 500 }
    )
  }
}
