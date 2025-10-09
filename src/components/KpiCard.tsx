import { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  sublabel?: string;
}

export default function KpiCard({ label, value, sublabel }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-card hover:shadow-hover transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:scale-[1.02] group">
      <p className="text-muted text-sm border-b border-gray-50 pb-2 group-hover:border-gray-100 transition-colors duration-200">{label}</p>
      <div className="text-3xl font-semibold mt-2 group-hover:text-gray-800 transition-colors duration-200">{value}</div>
      {sublabel && <p className="text-muted text-xs mt-1 group-hover:text-gray-600 transition-colors duration-200">{sublabel}</p>}
    </div>
  );
}
