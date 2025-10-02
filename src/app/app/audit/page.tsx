'use client';
import { useEffect, useState } from 'react';
import { AuditLog } from '@/lib/types';
import { fetcher } from '@/lib/fetcher';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  useEffect(() => {
    fetcher<{ data: AuditLog[] }>('/api/audit').then(res => setLogs(res.data));
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Audit Log</h1>
      <ul className="space-y-2">
        {logs.map(log => (
          <li key={log.id} className="bg-white p-4 rounded shadow-card">
            <p><strong>{log.actor}</strong> – {log.action}</p>
            <p className="text-muted text-sm">{log.timestamp}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

