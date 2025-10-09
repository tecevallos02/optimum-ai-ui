'use client';

import { LEGEND_ITEMS } from '@/lib/calendar/colors';

interface LegendProps {
  className?: string;
}

export default function Legend({ className = '' }: LegendProps) {
  const statusItems = LEGEND_ITEMS.filter(item => item.type === 'status');
  const sourceItems = LEGEND_ITEMS.filter(item => item.type === 'source');

  return (
    <div className={`flex flex-wrap gap-4 text-sm ${className}`}>
      {/* Status Legend */}
      <div className="flex flex-wrap gap-2">
        <span className="font-medium text-gray-700">Status:</span>
        {statusItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-1"
            title={`${item.label} appointments`}
          >
            <div className={`w-3 h-3 rounded-full ${item.color.dot}`} />
            <span className="text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Source Legend */}
      <div className="flex flex-wrap gap-2">
        <span className="font-medium text-gray-700">Source:</span>
        {sourceItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-1"
            title={`${item.label} appointments`}
          >
            <span className="text-xs">{item.color.icon}</span>
            <span className="text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
