'use client';

import { useState } from 'react';
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
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  const handleAppointmentUpdate = (updatedAppointment: Appointment) => {
    setAppointments(prev => 
      prev.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt)
    );
  };

  const handleAppointmentDelete = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
  };

  const handleAppointmentCreate = (newAppointment: Appointment) => {
    setAppointments(prev => [...prev, newAppointment]);
  };

  return (
    <div>
      {/* Calendar Status Banner */}
      {calendarStatus?.connected ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <p className="text-green-800">
            ✅ Calendar connected ({calendarStatus.provider}) • 
            {calendarStatus.eventsCount} events synced
            {calendarStatus.lastSync && ` • Last sync: ${new Date(calendarStatus.lastSync).toLocaleString()}`}
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
          <p className="text-yellow-800">
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
      />
    </div>
  );
}
