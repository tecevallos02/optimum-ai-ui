"use client";
import { useEffect, useState } from "react";
import { AuditLog } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetcher<{ data: AuditLog[] }>("/api/audit")
      .then((res) => {
        if (res && res.data) {
          setLogs(res.data);
        } else {
          setError("No audit logs available");
        }
      })
      .catch((err) => {
        console.error("Failed to load audit logs", err);
        setError("Failed to load audit logs");
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Audit Log</h1>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <ul className="space-y-2">
        {logs.map((log) => (
          <li key={log.id} className="bg-white p-4 rounded shadow-card">
            <p>
              <strong>{log.actor}</strong> – {log.action}
            </p>
            <p className="text-muted text-sm">{log.timestamp}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
