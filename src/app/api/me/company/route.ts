import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireUser();
    
    // Get the user's specific company
    if (!user.companyId) {
      return NextResponse.json(
        { error: 'User not linked to any company' },
        { status: 404 }
      );
    }

    const company = await prisma.company.findUnique({
      where: {
        id: user.companyId
      },
      include: {
        phones: true
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'No company found for this user' },
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
