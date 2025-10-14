// path: src/app/app/DashboardClient.tsx  (Client Component)
"use client";

import { useState, useEffect } from "react";
import KpiCard from "@/components/KpiCard";
import CallsOverTime from "@/components/charts/CallsOverTime";
import IntentsDistribution from "@/components/charts/IntentsDistribution";
import UpcomingAppointments from "@/components/UpcomingAppointments";
import PageTitle from "@/components/PageTitle";
import type { KPI } from "@/lib/types";
import { mockDb } from "@/lib/mockDb";

export default function DashboardClient() {
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
    const fetchDashboardData = async () => {
      try {
        // Fetch all dashboard data in parallel
        const [kpisResponse, callsOverTimeResponse, intentsResponse] = await Promise.all([
          fetch("/api/kpis"),
          fetch("/api/analytics/calls-over-time?days=7"),
          fetch("/api/analytics/intents-distribution?days=30")
        ]);

        if (kpisResponse.ok) {
          const kpisData = await kpisResponse.json();
          setKpis(kpisData);
        }

        if (callsOverTimeResponse.ok) {
          const callsData = await callsOverTimeResponse.json();
          setCallsOverTimeData(callsData.data || []);
        }

        if (intentsResponse.ok) {
          const intentsData = await intentsResponse.json();
          setIntentsData(intentsData.data || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
