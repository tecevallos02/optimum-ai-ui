// path: src/app/app/DashboardClient.tsx  (Client Component)
"use client";

import KpiCard from "@/components/KpiCard";
import CallsOverTime from "@/components/charts/CallsOverTime";
import IntentsDistribution from "@/components/charts/IntentsDistribution";
import UpcomingAppointments from "@/components/UpcomingAppointments";
import type { KPI } from "@/lib/types";

type Props = {
  kpis: KPI;
  callsHandledSeries: { name: string; calls: number }[];
  intentsSeries: { name: string; count: number }[];
};

export default function DashboardClient({
  kpis,
  callsHandledSeries,
  intentsSeries,
}: Props) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Upcoming Appointments - Main Feature */}
      <UpcomingAppointments />

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-card">
          <h2 className="font-semibold mb-2">Calls over Time</h2>
          <CallsOverTime data={callsHandledSeries} />
        </div>
        <div className="bg-white p-4 rounded-xl shadow-card">
          <h2 className="font-semibold mb-2">Intents Distribution</h2>
          <IntentsDistribution data={intentsSeries} />
        </div>
      </div>

      {/* KPI Cards - Moved Below Charts */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard label="Calls Handled" value={kpis.callsHandled} />
        <KpiCard label="Bookings" value={kpis.bookings} />
        <KpiCard label="Avg Handle Time (s)" value={kpis.avgHandleTime} />
        <KpiCard label="Conversion Rate" value={`${kpis.conversionRate}%`} />
        <KpiCard label="Complaints" value={kpis.complaints} />
        <KpiCard label="Estimated Savings ($)" value={`$${kpis.estimatedSavings}`} />
      </div>
    </div>
  );
}
