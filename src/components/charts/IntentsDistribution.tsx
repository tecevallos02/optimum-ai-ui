// path: src/components/charts/IntentsDistribution.tsx  (Client Component)
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function IntentsDistribution({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#00bfa6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
