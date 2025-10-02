// path: src/app/api/me/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  // 200 with null keeps client hooks from going into "error" state
  return NextResponse.json(user ?? null, { status: 200 });
}
