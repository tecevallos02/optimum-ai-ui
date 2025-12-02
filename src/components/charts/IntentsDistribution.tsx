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

  const getBarGradient = (name: string) => {
    switch (name.toLowerCase()) {
      case "book":
      case "booking":
        return "url(#bookingGradient)";
      case "info":
      case "information":
        return "url(#informationGradient)";
      case "quote":
        return "url(#quoteGradient)";
      case "complaint":
        return "url(#complaintGradient)";
      default:
        return "url(#bookingGradient)";
    }
  };

  // Filter out "other" from the data
  const filteredData = data.filter(
    (item) => item.name.toLowerCase() !== "other"
  );

  const processedData = filteredData.map((item) => ({
    ...item,
    gradientId: getBarGradient(item.name),
    percentage: Math.round(
      (item.count / filteredData.reduce((sum, d) => sum + d.count, 0)) * 100,
    ),
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E6A8" stopOpacity="1" />
              <stop offset="100%" stopColor="#33F0C0" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="informationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4DA6FF" stopOpacity="1" />
              <stop offset="100%" stopColor="#80C0FF" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="quoteGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD447" stopOpacity="1" />
              <stop offset="100%" stopColor="#FFE380" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="complaintGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF4D9A" stopOpacity="1" />
              <stop offset="100%" stopColor="#FF80B8" stopOpacity="1" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            stroke="#d1d5db"
            className="dark:stroke-gray-700"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ style: { textTransform: "capitalize" } }}
          />
          <YAxis
            stroke="#d1d5db"
            className="dark:stroke-gray-700"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
            onMouseEnter={(_, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {processedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.gradientId}
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
