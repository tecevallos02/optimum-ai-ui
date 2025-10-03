import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { requireUser, getCurrentOrgId } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

const prisma = new PrismaClient()

// GET /api/contacts - List contacts for current organization
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
    const search = searchParams.get('search') || ''
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: Record<string, unknown> = { orgId: currentOrgId }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ])
    
    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    )
  }
}

// POST /api/contacts - Create new contact
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
    
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }
    
    const contact = await prisma.contact.create({
      data: {
        orgId: currentOrgId,
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        tags: JSON.stringify(body.tags || []),
        notes: body.notes?.trim() || null,
      },
    })
    
    // Log audit event
    await logAudit('contact:created', user.id, currentOrgId, contact.id)
    
    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    )
  }
}
