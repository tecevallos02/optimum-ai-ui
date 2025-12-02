"use client";

import { useEffect, useState } from "react";
import type { CallRow } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";
import DataTable, { Column } from "@/components/DataTable";
import PageTitle from "@/components/PageTitle";

export default function CallsPage() {
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const data = await fetcher<{ calls: CallRow[] }>("/api/sheets/calls");
        setCalls(data?.calls || []);
        setFilteredCalls(data?.calls || []);
      } catch (error) {
        console.error("Error fetching calls:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  useEffect(() => {
    let filtered = calls;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (call) =>
          call.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          call.phone.includes(searchTerm) ||
          call.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          call.notes.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((call) => {
        const status = call.status.toLowerCase();
        switch (statusFilter) {
          case "booked":
            return status.includes("booked") || status.includes("scheduled");
          case "completed":
            return status.includes("completed");
          case "cancelled":
            return status.includes("cancelled") || status.includes("canceled");
          case "no-show":
            return status.includes("no-show") || status.includes("no_show");
          default:
            return true;
        }
      });
    }

    setFilteredCalls(filtered);
  }, [calls, searchTerm, statusFilter]);

  const columns: Column<CallRow>[] = [
    {
      key: "datetime_iso",
      header: "Date/Time",
      render: (call) => new Date(call.datetime_iso).toLocaleString(),
    },
    {
      key: "name",
      header: "Name",
    },
    {
      key: "phone",
      header: "Phone",
    },
    {
      key: "status",
      header: "Status",
      render: (call) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            call.status.toLowerCase().includes("booked") ||
            call.status.toLowerCase().includes("scheduled")
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : call.status.toLowerCase().includes("completed")
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : call.status.toLowerCase().includes("cancelled") ||
                    call.status.toLowerCase().includes("canceled")
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-gray-100 text-gray-800 dark:bg-dark-hover dark:text-gray-200"
          }`}
        >
          {call.status}
        </span>
      ),
    },
    {
      key: "intent",
      header: "Intent",
      render: (call) => (
        <span className="capitalize">{call.intent || "other"}</span>
      ),
    },
    {
      key: "address",
      header: "Address",
      render: (call) => (
        <div className="max-w-xs truncate" title={call.address}>
          {call.address}
        </div>
      ),
    },
    {
      key: "notes",
      header: "Notes",
      render: (call) => (
        <div className="max-w-xs truncate" title={call.notes}>
          {call.notes}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <PageTitle title="Call Logs" />
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-dark-hover rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-200 dark:bg-dark-hover rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageTitle title="Call Logs" />

      {/* Filters */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, phone, address, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-hover text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-hover text-gray-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="booked">Booked/Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm">
        <DataTable data={filteredCalls} columns={columns} />
      </div>
    </div>
  );
}
