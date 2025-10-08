import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { requireUser, getCurrentOrgId } from "@/lib/auth"
// import { logAudit } from "@/lib/audit"

const prisma = new PrismaClient()

// GET /api/contacts - List contacts for current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    
    const skip = (page - 1) * limit
    
    // Get user's organization and ensure it exists in the database
    const userData = await prisma.user.findFirst({
      where: { id: user.id }
    })
    
    const orgName = (userData as any)?.organization || 'Default Organization'
    
    // Ensure organization exists in the database
    let org = await prisma.organization.findFirst({
      where: { name: orgName }
    })
    
    if (!org) {
      console.log('Creating organization for GET:', orgName);
      org = await prisma.organization.create({
        data: {
          name: orgName,
        }
      })
    }
    
    const orgId = org.id
    
    // Build where clause
    const where: Record<string, unknown> = { orgId }
    
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
  console.log('POST /api/contacts called');
  try {
    const user = await requireUser()
    console.log('User authenticated:', user.email);
    
    // Get user's organization to create orgId
    const userData = await prisma.user.findFirst({
      where: { id: user.id }
    })
    
    const orgName = (userData as any)?.organization || 'Default Organization'
    const orgSlug = `org-${orgName.toLowerCase().replace(/\s+/g, '-')}`
    
    // Ensure organization exists in the database
    let org = await prisma.organization.findFirst({
      where: { name: orgName }
    })
    
    if (!org) {
      console.log('Creating organization:', orgName);
      org = await prisma.organization.create({
        data: {
          name: orgName,
        }
      })
    }
    
    const orgId = org.id
    console.log('Using orgId:', orgId);
    
    const body = await request.json()
    console.log('Request body:', body);
    
    if (!body.name || typeof body.name !== 'string') {
      console.log('Validation failed: Name is required');
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }
    
    console.log('Creating contact with orgId:', orgId);
    const contact = await prisma.contact.create({
      data: {
        orgId: orgId,
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        tags: body.tags || [],
        notes: body.notes?.trim() || null,
      },
    })
    
    console.log('Contact created successfully:', contact);
    
    // Log audit event (disabled for now due to orgId mismatch)
    // await logAudit('contact:created', user.id, orgId, contact.id)
    
    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    )
  }
}
