import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      companyName, 
      contactEmail, 
      contactName, 
      phone, 
      address, 
      googleSheetId, 
      retellWebhookUrl 
    } = body;

    // Validate required fields
    if (!companyName || !contactEmail || !contactName) {
      return NextResponse.json(
        { error: 'Company name, contact email, and contact name are required' },
        { status: 400 }
      );
    }

    // Check if company already exists
    const existingCompany = await prisma.company.findFirst({
      where: { name: companyName }
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: 'A company with this name already exists' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: contactEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Create company first
    const company = await prisma.company.create({
      data: {
        name: companyName,
        googleSheetId: googleSheetId || null,
        retellWebhookUrl: retellWebhookUrl || null,
      }
    });

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: contactEmail,
        password: hashedPassword,
        name: contactName,
        firstName: contactName.split(' ')[0] || contactName,
        lastName: contactName.split(' ').slice(1).join(' ') || '',
        phone: phone || null,
        address: address || null,
        emailVerified: new Date(), // Mark as verified
        companyId: company.id,
      }
    });

    // Generate the webhook URL for this company
    const generatedWebhookUrl = `https://ui.goshawkai.com/api/webhooks/retell/${company.id}`;

    // Update company with the generated webhook URL if not provided
    if (!retellWebhookUrl) {
      await prisma.company.update({
        where: { id: company.id },
        data: { retellWebhookUrl: generatedWebhookUrl }
      });
    }

    return NextResponse.json({
      success: true,
      company,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tempPassword: tempPassword
      },
      webhookUrl: retellWebhookUrl || generatedWebhookUrl
    });

  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
