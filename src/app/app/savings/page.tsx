'use client';
import { useState, useEffect } from 'react';
import { SavingsSeries } from '@/lib/types';
import { fetcher } from '@/lib/fetcher';
import { generateSavingsPdf } from '@/lib/utils/pdf';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SavingsPage() {
  const [series, setSeries] = useState<SavingsSeries>([]);
  useEffect(() => {
    fetcher<SavingsSeries>('/api/savings').then((data) => {
      if (data) setSeries(data);
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

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Savings & ROI</h1>
      <div className="bg-white p-4 rounded-xl shadow-card mb-4">
        <h2 className="font-semibold mb-2">Monthly Savings (Time)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={series}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="timeSaved" stroke="#6c63ff" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <button
        onClick={downloadPdf}
        className="bg-primary text-white px-4 py-2 rounded-full shadow hover:shadow-lg"
      >
        Download PDF
      </button>
    </div>
  );
}
