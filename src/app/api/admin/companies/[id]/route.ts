import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { googleSheetId, retellWebhookUrl } = body;

    const company = await prisma.company.update({
      where: { id },
      data: {
        googleSheetId: googleSheetId || null,
        retellWebhookUrl: retellWebhookUrl || null,
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
      }
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}
