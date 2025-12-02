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
        <div className="bg-white dark:bg-dark-card px-3 py-2 rounded-md shadow-lg border border-gray-200 dark:border-dark-border">
          <p className="text-xs font-medium text-gray-900 dark:text-white mb-1 capitalize">
            {label}
          </p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-600 dark:text-dark-text-secondary">
              {data.count} calls
            </span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              {data.percentage}%
            </span>
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
        return "#10b981";
      case "info":
      case "information":
        return "#3b82f6";
      case "quote":
        return "#f59e0b";
      case "complaint":
        return "#ef4444";
      case "other":
        return "#6b7280";
      default:
        return "#8b5cf6";
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
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            className="dark:stroke-gray-800"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="#9ca3af"
            className="dark:stroke-gray-500"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ style: { textTransform: "capitalize" } }}
          />
          <YAxis
            stroke="#9ca3af"
            className="dark:stroke-gray-500"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
          <Bar
            dataKey="count"
            radius={[6, 6, 0, 0]}
            onMouseEnter={(_, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {processedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.4}
                style={{
                  transition: "opacity 0.2s ease",
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
