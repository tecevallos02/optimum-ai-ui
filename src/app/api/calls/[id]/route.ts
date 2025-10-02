import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { mockDb } from '@/lib/mockDb';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;
  const call = mockDb.calls.find(c => c.id === id && c.orgId === user.orgId);
  if (!call) return new NextResponse('Not found', { status: 404 });
  return NextResponse.json(call);
}
