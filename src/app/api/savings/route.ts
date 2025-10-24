import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { mockDb } from "@/lib/mockDb";

export async function GET() {
  await requireUser();
  return NextResponse.json(mockDb.savings);
}
