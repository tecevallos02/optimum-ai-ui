"use client";

import { useEffect, useState } from "react";
import type { Contact } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";
import DataTable, { type Column } from "@/components/DataTable";

export default function ContactsPage() {
  const [rows, setRows] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetcher<Contact[]>("/api/contacts")
      .then((res) => {
        if (!mounted) return;
        setRows(res ?? []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const columns: Column<Contact>[] = [
    { key: "name", header: "Name" },
    { key: "phone", header: "Phone" },
    { key: "email", header: "Email" },
    {
      key: "tags",
      header: "Tags",
      render: (r) => (r.tags ?? []).join(", "),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Contacts</h1>
      {loading ? (
        <div className="text-sm text-muted">Loading…</div>
      ) : (
        <DataTable<Contact> data={rows} columns={columns} pageSize={10} />
      )}
    </div>
  );
}
