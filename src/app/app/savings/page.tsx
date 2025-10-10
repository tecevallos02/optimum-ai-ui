'use client';
import { useState, useEffect } from 'react';
import { SavingsSeries } from '@/lib/types';
import { fetcher } from '@/lib/fetcher';
import { generateSavingsPdf } from '@/lib/utils/pdf';
import PageTitle from '@/components/PageTitle';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  CartesianGrid, 
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface SavingsData {
  month: number;
  timeSaved: number;
  costSaved: number;
  planCost: number;
  roi: number;
  cumulativeSavings: number;
  monthName: string;
}

export default function SavingsPage() {
  const [series, setSeries] = useState<SavingsSeries>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  
  useEffect(() => {
    fetcher<SavingsSeries>('/api/savings').then((data) => {
      if (data) setSeries(data);
      setLoading(false);
    });
  }, []);

  const downloadPdf = async () => {
    const blob = await generateSavingsPdf(series);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'savings-report.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Process data for better visualization
  const processedData: SavingsData[] = series.map((item, index) => {
    const roi = ((item.costSaved - item.planCost) / item.planCost) * 100;
    const cumulativeSavings = series.slice(0, index + 1).reduce((sum, curr) => sum + curr.costSaved, 0);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      ...item,
      roi: Math.round(roi * 10) / 10,
      cumulativeSavings,
      monthName: monthNames[item.month - 1] || `M${item.month}`
    };
  });

  // Calculate summary metrics
  const totalTimeSaved = series.reduce((sum, item) => sum + item.timeSaved, 0);
  const totalCostSaved = series.reduce((sum, item) => sum + item.costSaved, 0);
  const totalPlanCost = series.reduce((sum, item) => sum + item.planCost, 0);
  const averageROI = series.length > 0 ? ((totalCostSaved - totalPlanCost) / totalPlanCost) * 100 : 0;
  const currentMonth = processedData[processedData.length - 1];

  // Custom tooltip for line charts
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
              <span className="text-sm text-gray-600 dark:text-gray-400">{entry.dataKey}:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {entry.dataKey === 'roi' ? `${entry.value}%` : 
                 entry.dataKey === 'costSaved' || entry.dataKey === 'cumulativeSavings' ? `$${entry.value.toLocaleString()}` :
                 entry.dataKey === 'timeSaved' ? `${entry.value} hours` : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // ROI data for pie chart
  const roiData = [
    { name: 'Cost Saved', value: totalCostSaved, color: '#10b981' },
    { name: 'Plan Cost', value: totalPlanCost, color: '#ef4444' }
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <PageTitle title="Savings & ROI" subtitle="Loading..." />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageTitle title="Savings & ROI" subtitle="Analyzing your cost savings and return on investment" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-card border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Time Saved</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalTimeSaved}h</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-card border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Cost Saved</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">${totalCostSaved.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-card border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average ROI</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{Math.round(averageROI)}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-card border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Month ROI</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{currentMonth?.roi || 0}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Cost Savings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-card border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-50 dark:border-gray-700 pb-2">Monthly Cost Savings</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
              <XAxis 
                dataKey="monthName" 
                stroke="#6b7280"
                className="dark:stroke-gray-400"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                className="dark:stroke-gray-400"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="costSaved" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ROI Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-card border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-50 dark:border-gray-700 pb-2">ROI Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
              <XAxis 
                dataKey="monthName" 
                stroke="#6b7280"
                className="dark:stroke-gray-400"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                className="dark:stroke-gray-400"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="roi" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Time Saved vs Cost Saved */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-card border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-50 dark:border-gray-700 pb-2">Time vs Cost Efficiency</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
              <XAxis 
                dataKey="monthName" 
                stroke="#6b7280"
                className="dark:stroke-gray-400"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                className="dark:stroke-gray-400"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={false}
              />
              <Bar 
                dataKey="timeSaved" 
                fill="#3b82f6" 
                radius={[2, 2, 0, 0]}
                stroke="#3b82f6"
                strokeWidth={2}
                onMouseEnter={(data) => setHoveredMonth(data.monthName)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`timeSaved-${index}`}
                    fill="#3b82f6"
                    stroke="#3b82f6"
                    strokeWidth={hoveredMonth === entry.monthName ? 3 : 2}
                    style={{
                      filter: hoveredMonth === entry.monthName 
                        ? 'brightness(1.2) saturate(1.3) drop-shadow(0 6px 12px rgba(59, 130, 246, 0.4))' 
                        : 'brightness(1) saturate(1) drop-shadow(0 2px 4px rgba(59, 130, 246, 0.1))',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Bar>
              <Bar 
                dataKey="costSaved" 
                fill="#10b981" 
                radius={[2, 2, 0, 0]}
                stroke="#10b981"
                strokeWidth={2}
                onMouseEnter={(data) => setHoveredMonth(data.monthName)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`costSaved-${index}`}
                    fill="#10b981"
                    stroke="#10b981"
                    strokeWidth={hoveredMonth === entry.monthName ? 3 : 2}
                    style={{
                      filter: hoveredMonth === entry.monthName 
                        ? 'brightness(1.2) saturate(1.3) drop-shadow(0 6px 12px rgba(16, 185, 129, 0.4))' 
                        : 'brightness(1) saturate(1) drop-shadow(0 2px 4px rgba(16, 185, 129, 0.1))',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Savings vs Investment */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-card border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-50 dark:border-gray-700 pb-2">Savings vs Investment</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roiData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {roiData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                content={<CustomTooltip />}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cumulative Savings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-card border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-50 dark:border-gray-700 pb-2">Cumulative Savings Over Time</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
            <XAxis 
              dataKey="monthName" 
              stroke="#6b7280"
              className="dark:stroke-gray-400"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              className="dark:stroke-gray-400"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="cumulativeSavings" 
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={downloadPdf}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Full Report
        </button>
      </div>
    </div>
  );
}
