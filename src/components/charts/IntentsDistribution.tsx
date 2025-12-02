// path: src/components/charts/IntentsDistribution.tsx  (Client Component)
"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

interface IntentData {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export default function IntentsDistribution({ data }: { data: IntentData[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-lg border border-gray-200 dark:border-dark-border">
          <p className="font-semibold text-gray-900 dark:text-white mb-2 capitalize">
            {label}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: data.color }}
              />
              <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                Count:
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {data.count}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                Percentage:
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {data.percentage}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (name: string) => {
    switch (name.toLowerCase()) {
      case "book":
      case "booking":
        return "#10b981"; // Green for bookings
      case "info":
      case "information":
        return "#3b82f6"; // Blue for information
      case "cancel":
      case "cancellation":
        return "#ef4444"; // Red for cancellations
      case "escalate":
      case "escalation":
        return "#f59e0b"; // Orange for escalations
      case "complaint":
      case "complaints":
        return "#8b5cf6"; // Purple for complaints
      default:
        return "#6b7280"; // Gray for others
    }
  };

  const processedData = data.map((item) => ({
    ...item,
    color: getBarColor(item.name),
    percentage: Math.round(
      (item.count / data.reduce((sum, d) => sum + d.count, 0)) * 100,
    ),
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            className="dark:stroke-gray-700"
          />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ style: { textTransform: "capitalize" } }}
          />
          <YAxis
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            strokeWidth={2}
            onMouseEnter={(data, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {processedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke={entry.color}
                strokeWidth={hoveredIndex === index ? 3 : 2}
                style={{
                  filter:
                    hoveredIndex === index
                      ? `brightness(1.2) saturate(1.3) drop-shadow(0 6px 12px ${entry.color}40)`
                      : `brightness(1) saturate(1) drop-shadow(0 2px 4px ${entry.color}20)`,
                  transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  cursor: "pointer",
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
