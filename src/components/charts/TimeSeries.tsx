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
          <Tooltip />
          <Line type="monotone" dataKey="y" stroke="#6c63ff" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
