// path: src/app/app/DashboardClient.tsx  (Client Component)
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import KpiCard from "@/components/KpiCard";
import CallsOverTime from "@/components/charts/CallsOverTime";
import IntentsDistribution from "@/components/charts/IntentsDistribution";
import UpcomingAppointments from "@/components/UpcomingAppointments";
import PageTitle from "@/components/PageTitle";
import type { KPI } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const phone = searchParams.get('phone');
  
  const [kpis, setKpis] = useState<KPI>({
    callsHandled: 0,
    bookings: 0,
    avgHandleTime: 0,
    conversionRate: 0,
    callsEscalated: 0,
    estimatedSavings: 0,
  });
  const [callsOverTimeData, setCallsOverTimeData] = useState<any[]>([]);
  const [intentsData, setIntentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Build query parameters
        const params = new URLSearchParams({ companyId });
        if (phone) params.set('phone', phone);

        // Fetch all dashboard data in parallel
        const [kpisData, callsOverTimeData, intentsData] = await Promise.all([
          fetcher(`/api/kpis?${params.toString()}`),
          fetcher(`/api/analytics/calls-over-time?${params.toString()}&days=7`),
          fetcher(`/api/analytics/intents-distribution?${params.toString()}&days=30`)
        ]);

        setKpis(kpisData as KPI || {
          callsHandled: 0,
          bookings: 0,
          avgHandleTime: 0,
          conversionRate: 0,
          callsEscalated: 0,
          estimatedSavings: 0,
        });
        setCallsOverTimeData((callsOverTimeData as any)?.data || []);
        setIntentsData((intentsData as any)?.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [companyId, phone]);

  // Use real data or fallback to empty arrays
  const callsHandledSeries = callsOverTimeData.length > 0 ? callsOverTimeData : [];
  const intentsSeries = intentsData.length > 0 ? intentsData : [];

  if (loading) {
    return (
      <div className="space-y-8">
        <PageTitle title="Dashboard" subtitle="Loading..." />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="space-y-8">
        <PageTitle title="Dashboard" subtitle="Select a company to view data" />
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            Please select a company from the dropdown above to view dashboard data.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <PageTitle title="Dashboard" subtitle="Welcome back! Here's what's happening today." />

      {/* Upcoming Appointments - Main Feature */}
      <UpcomingAppointments />

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-card border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg group">
          <h2 className="text-center font-semibold mb-6 text-gray-900 dark:text-gray-100">Calls over Time</h2>
          <CallsOverTime data={callsHandledSeries} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-card border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg group">
          <h2 className="text-center font-semibold mb-6 text-gray-900 dark:text-gray-100">Intents Distribution</h2>
          <IntentsDistribution data={intentsSeries} />
        </div>
      </div>

      {/* KPI Cards - Moved Below Charts */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard label="Calls Handled" value={kpis.callsHandled} />
        <KpiCard label="Appointments" value={kpis.bookings} />
        <KpiCard label="Avg Handle Time (s)" value={kpis.avgHandleTime} />
        <KpiCard label="Conversion Rate" value={`${kpis.conversionRate}%`} />
        <KpiCard label="Calls Escalated" value={kpis.callsEscalated} />
        <KpiCard label="Estimated Savings ($)" value={`$${kpis.estimatedSavings}`} />
      </div>
    </div>
  );
}
