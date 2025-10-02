// path: src/lib/reports.ts
import { fetcher } from "@/lib/fetcher";
import type { Report } from "@/lib/types";

export async function getDailyReport(): Promise<Report> {
  // Will throw if non-2xx
  const report = await fetcher<Report>("/api/report", undefined, {
    throwOnError: true,
    cache: "no-store",
  });
  // TS: report can’t be null here due to throwOnError
  return report!;
}
