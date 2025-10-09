import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const { fullName, email, phone } = await request.json();

    // Get user's organization
    const userData = await prisma.user.findFirst({
      where: { id: user.id }
    }) as any;
    
    const orgName = userData?.organization || 'Default Organization';
    
    // Ensure organization exists in the database
    let org = await prisma.organization.findFirst({
      where: { name: orgName }
    });
    
    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const orgId = org.id;

    // Build search conditions for duplicates
    const whereConditions: any[] = [];
    const matchFields: string[] = [];

    if (email && email.trim()) {
      whereConditions.push({ email: { equals: email.trim(), mode: 'insensitive' } });
    }

    if (phone && phone.trim()) {
      whereConditions.push({ phone: { equals: phone.trim() } });
    }

    if (fullName && fullName.trim()) {
      whereConditions.push({ 
        name: { 
          equals: fullName.trim(), 
          mode: 'insensitive' 
        } 
      });
    }

    if (whereConditions.length === 0) {
      return NextResponse.json({ matchId: null, matchFields: [] });
    }

    // Find potential duplicates
    const duplicate = await prisma.contact.findFirst({
      where: {
        orgId: orgId,
        OR: whereConditions
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      }
    });

    if (!duplicate) {
      return NextResponse.json({ matchId: null, matchFields: [] });
    }

    // Determine which fields matched
    if (email && duplicate.email && duplicate.email.toLowerCase() === email.toLowerCase()) {
      matchFields.push('email');
    }
    if (phone && duplicate.phone && duplicate.phone === phone) {
      matchFields.push('phone');
    }
    if (fullName && duplicate.name && duplicate.name.toLowerCase() === fullName.toLowerCase()) {
      matchFields.push('name');
    }

    return NextResponse.json({
      matchId: duplicate.id,
      matchFields: matchFields as ('email' | 'phone' | 'name')[]
    });

  } catch (error) {
    console.error('Error checking for duplicate contact:', error);
    return NextResponse.json(
      { error: "Failed to check for duplicates" },
      { status: 500 }
    );
  }
}
