import { Suspense } from "react";
import CalendarClient from "@/app/app/calendar/CalendarClient";
import PageTitle from "@/components/PageTitle";
import { fetcher } from "@/lib/fetcher";
import type { Appointment } from "@/lib/types";

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
    fetcher<CalendarStatus>("/api/calendar/connect"),
  ]);

  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <PageTitle title="Calendar" subtitle="Loading..." />
          <div className="h-96 bg-muted dark:bg-gray-700 rounded-2xl animate-pulse" />
        </div>
      }
    >
      <CalendarClient
        initialAppointments={appointments ?? []}
        calendarStatus={calendarStatus}
      />
    </Suspense>
  );
}
