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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const response = await fetch("/api/kpis");
        if (response.ok) {
          const data = await response.json();
          setKpis(data);
        } else {
          console.error("Failed to fetch KPIs:", response.status);
        }
      } catch (error) {
        console.error("Error fetching KPIs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKpis();
  }, []);

  // Generate realistic call data for the last 7 days
  const generateCallsData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic call patterns (more calls on weekdays)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseCalls = isWeekend ? 15 : 35;
      const variation = Math.random() * 20 - 10;
      const totalCalls = Math.max(5, Math.round(baseCalls + variation));
      
      const escalatedCalls = Math.round(totalCalls * (0.1 + Math.random() * 0.1)); // 10-20% escalation rate
      const bookedCalls = Math.round(totalCalls * (0.15 + Math.random() * 0.15)); // 15-30% booking rate
      const completedCalls = Math.round(totalCalls * (0.6 + Math.random() * 0.2)); // 60-80% completion rate
      
      days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        totalCalls,
        escalatedCalls,
        bookedCalls,
        completedCalls,
      });
    }
    return days;
  };

  const callsHandledSeries = generateCallsData();

  const intentsSeries = [
    { name: "Booking", count: 120, percentage: 0, color: "" },
    { name: "Information", count: 85, percentage: 0, color: "" },
    { name: "Cancellation", count: 25, percentage: 0, color: "" },
    { name: "Escalation", count: 18, percentage: 0, color: "" },
    { name: "Complaint", count: 8, percentage: 0, color: "" },
  ];

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
        <div className="bg-background dark:bg-gray-800 p-6 rounded-2xl shadow-card border border-border dark:border-gray-700 hover:border-accent/20 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg group">
          <h2 className="text-center font-semibold mb-6 text-foreground">Calls over Time</h2>
          <CallsOverTime data={callsHandledSeries} />
        </div>
        <div className="bg-background dark:bg-gray-800 p-6 rounded-2xl shadow-card border border-border dark:border-gray-700 hover:border-accent/20 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg group">
          <h2 className="text-center font-semibold mb-6 text-foreground">Intents Distribution</h2>
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
