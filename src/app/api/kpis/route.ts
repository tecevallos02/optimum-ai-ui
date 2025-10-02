// path: src/app/api/kpis/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const data = {
    callsHandled: 42,
    bookings: 11,
    avgHandleTime: 73,
    csat: 4.7,
    minutesUsed: 312,
    minutesLimit: 1000,
    estimatedSavings: 1840,
  };
  return NextResponse.json(data, { status: 200 });
}
