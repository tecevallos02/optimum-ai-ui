import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { requireUser, getCurrentOrgId } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

const prisma = new PrismaClient()

// PATCH /api/complaints/[id] - Update complaint
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const currentOrgId = await getCurrentOrgId()
    const { id } = await params
    
    if (!currentOrgId) {
      return NextResponse.json(
        { error: "No organization selected" },
        { status: 400 }
      )
    }
    
    // Verify complaint belongs to current organization
    const existingComplaint = await prisma.complaint.findFirst({
      where: {
        id,
        orgId: currentOrgId,
      },
    })
    
    if (!existingComplaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      )
    }
    
    const body = await request.json()
    
    const updateData: Record<string, unknown> = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.description !== undefined) updateData.description = body.description?.trim() || null
    
    const complaint = await prisma.complaint.update({
      where: { id },
      data: updateData,
    })
    
    // Log audit event
    await logAudit('complaint:updated', user.id, currentOrgId, id)
    
    return NextResponse.json(complaint)
  } catch (error) {
    console.error('Error updating complaint:', error)
    return NextResponse.json(
      { error: "Failed to update complaint" },
      { status: 500 }
    )
  }
}

// DELETE /api/complaints/[id] - Delete complaint
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const currentOrgId = await getCurrentOrgId()
    const { id } = await params
    
    if (!currentOrgId) {
      return NextResponse.json(
        { error: "No organization selected" },
        { status: 400 }
      )
    }
    
    // Verify complaint belongs to current organization
    const existingComplaint = await prisma.complaint.findFirst({
      where: {
        id,
        orgId: currentOrgId,
      },
    })
    
    if (!existingComplaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      )
    }
    
    await prisma.complaint.delete({
      where: { id },
    })
    
    // Log audit event
    await logAudit('complaint:deleted', user.id, currentOrgId, id)
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting complaint:', error)
    return NextResponse.json(
      { error: "Failed to delete complaint" },
      { status: 500 }
    )
  }
}
