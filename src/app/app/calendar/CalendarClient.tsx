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
