// path: src/components/charts/CallsOverTime.tsx  (Client Component)
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CallData {
  name: string;
  totalCalls: number;
  escalatedCalls: number;
  bookedCalls: number;
  completedCalls: number;
  quoteCalls?: number;
  otherCalls?: number;
}

export default function CallsOverTime({ data }: { data: CallData[] }) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-card px-3 py-2 rounded-md shadow-lg border border-gray-200 dark:border-dark-border">
          <p className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary mb-1.5">
            {label}
          </p>
          <div className="space-y-0.5">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="text-xs text-gray-600 dark:text-dark-text-secondary">
                  {entry.name}
                </span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="totalGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00E6A8" stopOpacity="1" />
              <stop offset="100%" stopColor="#33F0C0" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="bookedGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4DA6FF" stopOpacity="1" />
              <stop offset="100%" stopColor="#80C0FF" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="completedGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B17BFF" stopOpacity="1" />
              <stop offset="100%" stopColor="#D0A8FF" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="escalatedGradient" x1="0" y1="0" x2="1" y2="0">
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
          />
          <YAxis
            stroke="#d1d5db"
            className="dark:stroke-gray-700"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Legend
            wrapperStyle={{ paddingTop: "16px", fontSize: "12px" }}
            iconType="line"
            iconSize={16}
          />
          <Line
            type="monotone"
            dataKey="totalCalls"
            stroke="url(#totalGradient)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            name="Total"
          />
          <Line
            type="monotone"
            dataKey="bookedCalls"
            stroke="url(#bookedGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            name="Booked"
          />
          <Line
            type="monotone"
            dataKey="completedCalls"
            stroke="url(#completedGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            name="Completed"
          />
          <Line
            type="monotone"
            dataKey="escalatedCalls"
            stroke="url(#escalatedGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            name="Escalated"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
