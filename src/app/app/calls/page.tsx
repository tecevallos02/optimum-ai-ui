// path: src/app/app/calls/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { Call } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";
import DataTable, { Column } from "@/components/DataTable";

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    let mounted = true;
    fetcher<Call[]>("/api/calls")
      .then((res) => {
        if (!mounted) return;
        setCalls(res ?? []);
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
      header: "Start",
      render: (r) => new Date(r.startedAt).toLocaleString(),
    },
    { key: "durationSec", header: "Duration (s)" },
    { key: "status", header: "Status" },
    { key: "disposition", header: "Disposition" },
    {
      key: "escalated",
      header: "Escalated",
      render: (r) => r.escalated ? "Yes" : "No",
    },
    {
      key: "tags",
      header: "Tags",
      render: (r) => (r.tags ?? []).join(", "),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Calls</h1>
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
