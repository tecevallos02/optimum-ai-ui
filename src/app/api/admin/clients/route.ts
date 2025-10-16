import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateMockDataForCompany, generateMockRetellDataForCompany } from '@/lib/mock-data-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      companyName, 
      contactEmail, 
      contactName, 
      phone, 
      address, 
      password,
      googleSheetId, 
      retellWebhookUrl 
    } = body;

    // Validate required fields
    if (!companyName || !contactEmail || !contactName || !password) {
      return NextResponse.json(
        { error: 'Company name, contact email, contact name, and password are required' },
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

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: contactEmail,
        password: hashedPassword,
        name: contactName,
        firstName: contactName.split(' ')[0] || contactName,
        lastName: contactName.split(' ').slice(1).join(' ') || '',
        emailVerified: new Date(), // Mark as verified
        companyId: company.id,
      }
    });

    // Generate and store mock data for the new company
    const mockCallData = generateMockDataForCompany(company.id, companyName);
    const mockRetellData = generateMockRetellDataForCompany(company.id);

    // Store mock data in the database
    try {
      // Create CompanySheet entry for Google Sheets integration
      await prisma.companySheet.create({
        data: {
          companyId: company.id,
          spreadsheetId: `mock-sheet-${company.id}`,
          dataRange: 'Calls!A:H'
        }
      });

      // Create CompanyRetell entry for Retell integration
      await prisma.companyRetell.create({
        data: {
          companyId: company.id,
          workflowId: `workflow-${company.id}`,
          apiKey: `mock-api-key-${company.id}`,
          webhookUrl: `https://ui.goshawkai.com/api/webhooks/retell/${company.id}`
        }
      });

      // Store mock call data in SheetCache for analytics
      await prisma.sheetCache.create({
        data: {
          companyId: company.id,
          lastSynced: new Date(),
          rowCount: mockCallData.length
        }
      });

      console.log(`Generated and stored mock data for company ${companyName}:`, {
        callData: mockCallData.length,
        retellData: mockRetellData
      });
    } catch (error) {
      console.error('Error storing mock data:', error);
      // Don't fail the client creation if mock data storage fails
    }

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
        password: password
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
