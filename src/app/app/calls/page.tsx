"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CallRow } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";
import DataTable, { Column } from "@/components/DataTable";
import PageTitle from "@/components/PageTitle";

export default function CallsPage() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const phone = searchParams.get('phone');
  
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const params = new URLSearchParams({ companyId });
    if (phone) params.set('phone', phone);
    
    fetcher<{ calls: CallRow[] }>(`/api/sheets/calls?${params.toString()}`)
      .then((res) => {
        if (!mounted) return;
        setCalls(res?.calls ?? []);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [companyId, phone]);

  // Filter calls based on selected filter
  useEffect(() => {
    if (filter === "all") {
      setFilteredCalls(calls);
    } else {
      const filtered = calls.filter((call) => {
        switch (filter) {
          case "booked":
            return call.status.toLowerCase().includes('booked') || 
                   call.status.toLowerCase().includes('scheduled') ||
                   call.status.toLowerCase().includes('confirmed');
          case "canceled":
            return call.status.toLowerCase().includes('canceled');
          case "escalated":
            return call.status.toLowerCase().includes('escalated') ||
                   call.notes.toLowerCase().includes('escalated');
          case "info":
            return call.intent === 'other' || call.intent === 'info';
          default:
            return true;
        }
      });
      setFilteredCalls(filtered);
    }
  }, [calls, filter]);

  const columns: Column<CallRow>[] = [
    {
      key: "datetime_iso",
      header: "Date/Time",
      render: (r) => new Date(r.datetime_iso).toLocaleString(),
    },
    {
      key: "name",
      header: "Name",
      render: (r) => r.name,
    },
    {
      key: "phone",
      header: "Phone",
      render: (r) => r.phone,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          r.status.toLowerCase().includes('booked') || r.status.toLowerCase().includes('scheduled') || r.status.toLowerCase().includes('confirmed') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          r.status.toLowerCase().includes('canceled') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
          r.status.toLowerCase().includes('escalated') ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}>
          {r.status}
        </span>
      ),
    },
    {
      key: "intent",
      header: "Intent",
      render: (r) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          r.intent === 'booking' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          r.intent === 'cancellation' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
          r.intent === 'reschedule' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
          r.intent === 'quote' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}>
          {r.intent || 'other'}
        </span>
      ),
    },
    {
      key: "address",
      header: "Address",
      render: (r) => r.address || '-',
    },
    {
      key: "notes",
      header: "Notes",
      render: (r) => (
        <div className="max-w-xs truncate" title={r.notes}>
          {r.notes || '-'}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <PageTitle title="Call Logs" subtitle="Loading..." />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="space-y-8">
        <PageTitle title="Call Logs" subtitle="Select a company to view call logs" />
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            Please select a company from the dropdown above to view call logs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageTitle title="Call Logs" subtitle="View and manage all call records" />
      
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
            <option value="booked">Booked</option>
            <option value="canceled">Canceled</option>
            <option value="escalated">Escalated</option>
            <option value="info">Info Only</option>
          </select>
        </div>
      </div>

      <DataTable
        data={filteredCalls}
        columns={columns}
      />
    </div>
  );
}