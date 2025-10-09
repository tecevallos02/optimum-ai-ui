import { Suspense } from 'react';
import CalendarClient from '@/app/app/calendar/CalendarClient';
import { fetcher } from '@/lib/fetcher';
import type { Appointment } from '@/lib/types';

interface CalendarStatus {
  connected: boolean;
  provider: string;
  lastSync: string | null;
  eventsCount: number;
}

export default async function CalendarPage() {
  // Fetch initial data server-side
  const [appointments, calendarStatus] = await Promise.all([
    fetcher<Appointment[]>("/api/appointments"),
    fetcher<CalendarStatus>("/api/calendar/connect")
  ]);

  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    }>
      <CalendarClient 
        initialAppointments={appointments ?? []} 
        calendarStatus={calendarStatus}
      />
    </Suspense>
  );
}
