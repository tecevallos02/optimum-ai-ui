import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - List all companies
export async function GET() {
  try {
    const user = await requireUser();
    
    // For now, allow any authenticated user to see companies
    // You might want to add admin role checking here
    
    const companies = await prisma.company.findMany({
      include: {
        users: { select: { email: true } },
        phones: true,
        sheets: true,
        retell: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

// POST - Add new company
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    
    const body = await request.json();
    const {
      companyName,
      userEmail,
      userPassword,
      userFirstName,
      userLastName,
      phoneNumber,
      googleSheetId,
      retellWorkflowId,
      retellApiKey
    } = body;

    // Generate company ID from name
    const companyId = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // 1. Create company
    const company = await prisma.company.create({
      data: {
        id: companyId,
        name: companyName
      }
    });

    // 2. Create user account for the company
    const { hashPassword } = await import('@/lib/password');
    const hashedPassword = await hashPassword(userPassword);

    const newUser = await prisma.user.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        firstName: userFirstName,
        lastName: userLastName,
        name: `${userFirstName} ${userLastName}`,
        companyId: companyId,
        emailVerified: new Date(), // Auto-verify admin-created accounts
      }
    });

    // 3. Create Google Sheets configuration
    if (googleSheetId) {
      await prisma.companySheet.create({
        data: {
          companyId: companyId,
          spreadsheetId: googleSheetId === 'mock' ? `mock-${companyId}-sheet` : googleSheetId,
          dataRange: 'Calls!A:H'
        }
      });
    }

    // 4. Create phone number
    if (phoneNumber) {
      await prisma.companyPhone.create({
        data: {
          companyId: companyId,
          e164: phoneNumber
        }
      });
    }

    // 5. Create Retell configuration
    if (retellWorkflowId && retellApiKey) {
      await prisma.companyRetell.create({
        data: {
          companyId: companyId,
          workflowId: retellWorkflowId === 'mock' ? `retell-workflow-${companyId}` : retellWorkflowId,
          apiKey: retellApiKey === 'mock' ? `retell-api-key-${companyId}` : retellApiKey,
          webhookUrl: `https://ui.goshawkai.com/api/webhooks/retell/${companyId}`
        }
      });
    }

    // Return the created company with all relations
    const createdCompany = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: { select: { email: true } },
        phones: true,
        sheets: true,
        retell: true
      }
    });

    return NextResponse.json(createdCompany, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
