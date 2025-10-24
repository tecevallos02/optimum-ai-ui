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
  const phone = searchParams.get("phone");

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
        // Build query parameters for phone
        const params = new URLSearchParams();
        if (phone) params.set("phone", phone);

        // Fetch all dashboard data in parallel
        const [kpisData, callsOverTimeData, intentsData] = await Promise.all([
          fetcher(`/api/kpis?${params.toString()}`),
          fetcher(`/api/analytics/calls-over-time?${params.toString()}&days=7`),
          fetcher(
            `/api/analytics/intents-distribution?${params.toString()}&days=30`,
          ),
        ]);

        setKpis(
          (kpisData as KPI) || {
            callsHandled: 0,
            bookings: 0,
            avgHandleTime: 0,
            conversionRate: 0,
            callsEscalated: 0,
            estimatedSavings: 0,
          },
        );
        setCallsOverTimeData((callsOverTimeData as any)?.data || []);
        setIntentsData((intentsData as any)?.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [phone]); // Re-fetch when phone changes

  if (loading) {
    return (
      <div className="p-6">
        <PageTitle title="Dashboard" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageTitle title="Dashboard" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          label="Calls Handled"
          value={kpis.callsHandled}
          sublabel="+12% from last week"
        />
        <KpiCard
          label="Bookings"
          value={kpis.bookings}
          sublabel="+8% from last week"
        />
        <KpiCard
          label="Avg Handle Time"
          value={`${Math.round(kpis.avgHandleTime / 60)}m`}
          sublabel="-5% from last week"
        />
        <KpiCard
          label="Conversion Rate"
          value={`${kpis.conversionRate}%`}
          sublabel="+3% from last week"
        />
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Upcoming Appointments
        </h3>
        <UpcomingAppointments />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Calls Over Time
          </h3>
          <CallsOverTime data={callsOverTimeData} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Intents Distribution
          </h3>
          <IntentsDistribution data={intentsData} />
        </div>
      </div>
    </div>
  );
}
