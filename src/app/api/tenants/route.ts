import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        phones: {
          select: {
            e164: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const result = companies.map(company => ({
      companyId: company.id,
      name: company.name,
      phones: company.phones.map(phone => phone.e164)
    }));

    return NextResponse.json({ companies: result });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
}
