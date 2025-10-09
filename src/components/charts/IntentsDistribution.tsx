// path: src/components/charts/IntentsDistribution.tsx  (Client Component)
"use client";

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

export default function IntentsDistribution({
  data,
}: {
  data: IntentData[];
}) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2 capitalize">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: data.color }}
              />
              <span className="text-sm text-gray-600">Count:</span>
              <span className="text-sm font-medium text-gray-900">{data.count}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Percentage:</span>
              <span className="text-sm font-medium text-gray-900">{data.percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'book':
      case 'booking':
        return '#10b981'; // Green for bookings
      case 'info':
      case 'information':
        return '#3b82f6'; // Blue for information
      case 'cancel':
      case 'cancellation':
        return '#ef4444'; // Red for cancellations
      case 'escalate':
      case 'escalation':
        return '#f59e0b'; // Orange for escalations
      case 'complaint':
      case 'complaints':
        return '#8b5cf6'; // Purple for complaints
      default:
        return '#6b7280'; // Gray for others
    }
  };

  const processedData = data.map(item => ({
    ...item,
    color: getBarColor(item.name),
    percentage: Math.round((item.count / data.reduce((sum, d) => sum + d.count, 0)) * 100)
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={processedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ style: { textTransform: 'capitalize' } }}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            radius={[4, 4, 0, 0]}
            strokeWidth={0}
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
