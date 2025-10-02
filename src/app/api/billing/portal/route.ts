import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';

export async function GET() {
  await requireUser();
  // Return a mock Stripe customer portal URL
  return NextResponse.json({ url: 'https://billing.stripe.com/p/login/test_customer_portal' });
}
