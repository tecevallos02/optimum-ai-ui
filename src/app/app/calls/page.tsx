// path: src/app/app/calls/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { Call } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";
import DataTable, { Column } from "@/components/DataTable";
import PageTitle from "@/components/PageTitle";

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    let mounted = true;
    fetcher<{ calls: Call[] }>("/api/calls")
      .then((res) => {
        if (!mounted) return;
        setCalls(res?.calls ?? []);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Filter calls based on selected filter
  useEffect(() => {
    if (filter === "all") {
      setFilteredCalls(calls);
    } else {
      const filtered = calls.filter((call) => {
        switch (filter) {
          case "escalated":
            return call.escalated === true;
          case "booked":
            return call.disposition === "booked";
          case "canceled":
            return call.disposition === "canceled";
          case "info":
            return call.disposition === "info_questioning";
          default:
            return true;
        }
      });
      setFilteredCalls(filtered);
    }
  }, [calls, filter]);

  const columns: Column<Call>[] = [
    {
      key: "startedAt",
      header: "Start Time",
      render: (r) => new Date(r.startedAt).toLocaleString(),
    },
    {
      key: "fromNumber",
      header: "From",
      render: (r) => r.fromNumber,
    },
    {
      key: "toNumber", 
      header: "To",
      render: (r) => r.toNumber,
    },
    {
      key: "duration",
      header: "Duration",
      render: (r) => {
        const minutes = Math.floor(r.duration / 60);
        const seconds = r.duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      },
    },
    { 
      key: "status", 
      header: "Status",
      render: (r) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          r.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          r.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
          r.status === 'FAILED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}>
          {r.status.replace('_', ' ')}
        </span>
      ),
    },
    { 
      key: "disposition", 
      header: "Disposition",
      render: (r) => r.disposition || 'N/A',
    },
    {
      key: "escalated",
      header: "Escalated",
      render: (r) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          r.escalated 
            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}>
          {r.escalated ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "intent",
      header: "Intent",
      render: (r) => (r.intent ?? []).join(", ") || 'N/A',
    },
  ];

  return (
    <div className="space-y-8">
      <PageTitle title="Calls" />
      
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-4">
          <label htmlFor="filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Calls</option>
            <option value="escalated">Calls Escalated</option>
            <option value="booked">Booked</option>
            <option value="canceled">Canceled</option>
            <option value="info">Info Questioning</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="text-sm text-muted dark:text-gray-400">Loading…</div>
      ) : (
        <DataTable<Call> data={filteredCalls} columns={columns} pageSize={10} />
      )}
    </div>
  );
}
