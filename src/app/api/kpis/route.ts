// path: src/app/api/kpis/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const callsHandled = 42;
  const bookings = 11;
  const conversionRate = callsHandled > 0 ? (bookings / callsHandled) * 100 : 0;
  
  const data = {
    callsHandled,
    bookings,
    avgHandleTime: 73,
    conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal place
    complaints: 3,
    estimatedSavings: 1840,
  };
  return NextResponse.json(data, { status: 200 });
}
