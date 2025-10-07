// path: src/app/app/page.tsx
import DashboardClient from "./DashboardClient";
import type { KPI } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";
import { mockDb } from "@/lib/mockDb";

export default async function DashboardPage() {
  // Safe server-side fetch; returns KPI | null (no throw)
  const kpis =
    (await fetcher<KPI>("/api/kpis", undefined, { cache: "no-store" })) ?? {
      callsHandled: 0,
      bookings: 0,
      avgHandleTime: 0,
      conversionRate: 0,
      complaints: 0,
      estimatedSavings: 0,
    };

  // Build series data (safe if mockDb.savings is missing)
  const savingsData = mockDb.savings || [];
  const callsHandledSeries = savingsData.map((d) => ({
    name: `M${d.month}`,
    calls: d.timeSaved,
  }));

  const intentsSeries = [
    { name: "book", count: 120 },
    { name: "info", count: 80 },
    { name: "cancel", count: 15 },
  ];

  return (
    <DashboardClient
      kpis={kpis}
      callsHandledSeries={callsHandledSeries}
      intentsSeries={intentsSeries}
    />
  );
}

