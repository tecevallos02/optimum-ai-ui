'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import type { Appointment } from '@/lib/types';
import CalendarSection from '@/components/calendar/CalendarSection';

interface CalendarClientProps {
  initialAppointments: Appointment[];
  calendarStatus: any;
}

export default function CalendarClient({ 
  initialAppointments, 
  calendarStatus 
}: CalendarClientProps) {
  // Use SWR to fetch appointments with automatic revalidation
  const { data: appointments = initialAppointments, mutate } = useSWR<Appointment[]>(
    '/api/appointments',
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      return response.json();
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true, // Refresh when window regains focus
      revalidateOnReconnect: true, // Refresh when network reconnects
      fallbackData: initialAppointments, // Use initial data as fallback
    }
  );

  const handleAppointmentUpdate = (updatedAppointment: Appointment) => {
    // Update local state immediately for better UX
    mutate(
      (current) => current?.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt),
      false // Don't revalidate immediately, let SWR handle it
    );
  };

  const handleAppointmentDelete = (id: string) => {
    // Update local state immediately for better UX
    mutate(
      (current) => current?.filter(apt => apt.id !== id),
      false // Don't revalidate immediately, let SWR handle it
    );
  };

  const handleAppointmentCreate = (newAppointment: Appointment) => {
    // Update local state immediately for better UX
    mutate(
      (current) => current ? [...current, newAppointment] : [newAppointment],
      false // Don't revalidate immediately, let SWR handle it
    );
  };

  // Refresh data when the page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        mutate(); // Refresh data when page becomes visible
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [mutate]);

  return (
    <div>
      {/* Calendar Status Banner */}
      {calendarStatus?.connected ? (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-2xl">
          <p className="text-green-800 dark:text-green-200">
            ✅ Calendar connected ({calendarStatus.provider}) • 
            {calendarStatus.eventsCount} events synced
            {calendarStatus.lastSync && ` • Last sync: ${new Date(calendarStatus.lastSync).toLocaleString()}`}
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-2xl">
          <p className="text-yellow-800 dark:text-yellow-200">
            📅 Connect your calendar to view and manage appointments
          </p>
        </div>
      )}

      {/* Main Calendar Section */}
      <CalendarSection
        appointments={appointments}
        onAppointmentUpdate={handleAppointmentUpdate}
        onAppointmentDelete={handleAppointmentDelete}
        onAppointmentCreate={handleAppointmentCreate}
        onRefresh={() => mutate()}
      />
    </div>
  );
}
