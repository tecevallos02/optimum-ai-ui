import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: {
        users: {
          some: {} // Only include companies that have at least one user
        }
      },
      select: {
        id: true,
        name: true,
        googleSheetId: true,
        retellWebhookUrl: true,
        users: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
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