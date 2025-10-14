import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireUser();
    
    // For now, get the first company (in a real app, you'd link users to companies)
    const company = await prisma.company.findFirst({
      include: {
        phones: true
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'No company found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name
      },
      phones: company.phones.map(p => p.e164)
    });
  } catch (error) {
    console.error('Error fetching user company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company info' },
      { status: 500 }
    );
  }
}
