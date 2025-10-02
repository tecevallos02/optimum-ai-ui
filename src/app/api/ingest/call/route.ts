import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/mockDb';

export async function POST(req: Request) {
  const payload = await req.json();
  // Append new call to mock DB for org
  mockDb.calls.push({ ...payload });
  return NextResponse.json({ success: true });
}
