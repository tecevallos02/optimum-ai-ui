import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { mockDb } from '@/lib/mockDb';

export async function GET() {
  const user = await requireUser();
  const contacts = mockDb.contacts.filter(c => c.orgId === user.orgId);
  return NextResponse.json(contacts);
}

export async function POST(req: Request) {
  const user = await requireUser();
  const contact = await req.json();
  const newContact = { id: `contact_${Date.now()}`, orgId: user.orgId, ...contact };
  mockDb.contacts.push(newContact);
  return NextResponse.json(newContact);
}
