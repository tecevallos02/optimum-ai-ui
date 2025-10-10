"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Point = { x: string; y: number };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Value:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TimeSeries({
  data,
}: {
  data?: Point[];
}) {
  // simple demo data if none is passed
  const demo = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: `D${i + 1}`,
        y: Math.round(20 + Math.random() * 40),
      })),
    []
  );

  const series = data ?? demo;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series}>
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="y" stroke="#6c63ff" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
