// path: src/app/app/calls/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { Call } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";
import DataTable, { Column } from "@/components/DataTable";

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

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
      key: "tags",
      header: "Tags",
      render: (r) => (r.tags ?? []).join(", "),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Calls</h1>
      {loading ? (
        <div className="text-sm text-muted">Loading…</div>
      ) : (
        <DataTable<Call> data={calls} columns={columns} pageSize={10} />
      )}
    </div>
  );
}
