import { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  sublabel?: string;
}

export default function KpiCard({ label, value, sublabel }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-card hover:shadow-hover transition">
      <p className="text-muted text-sm">{label}</p>
      <div className="text-3xl font-semibold">{value}</div>
      {sublabel && <p className="text-muted text-xs">{sublabel}</p>}
    </div>
  );
}
