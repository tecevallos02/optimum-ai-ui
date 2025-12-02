import { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  sublabel?: string;
}

export default function KpiCard({ label, value, sublabel }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl p-4 shadow-card hover:shadow-hover transition-all duration-300 border border-gray-100 dark:border-dark-border hover:border-gray-200 dark:hover:border-gray-600 hover:scale-[1.02] group">
      <p className="text-muted dark:text-dark-text-secondary text-sm border-b border-gray-50 dark:border-dark-border pb-2 group-hover:border-gray-100 dark:group-hover:border-gray-600 transition-colors duration-200">
        {label}
      </p>
      <div className="text-3xl font-semibold mt-2 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-200 text-gray-900 dark:text-white">
        {value}
      </div>
      {sublabel && (
        <p className="text-muted dark:text-dark-text-secondary text-xs mt-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
          {sublabel}
        </p>
      )}
    </div>
  );
}
