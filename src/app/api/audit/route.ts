import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { mockDb } from "@/lib/mockDb";

export async function GET(req: Request) {
  const user = await requireUser();
  const page = parseInt(new URL(req.url).searchParams.get("page") || "0", 10);
  const pageSize = 10;
  const logs = mockDb.audit.filter((a) => a.orgId === user.companyId);
  const paged = logs.slice(page * pageSize, page * pageSize + pageSize);
  return NextResponse.json({ data: paged, total: logs.length });
}
