"use client";

import { useEffect, useState } from "react";
import type { Appointment } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";

interface CalendarStatus {
  connected: boolean;
  provider: string;
  lastSync: string | null;
  eventsCount: number;
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appts, status] = await Promise.all([
          fetcher<Appointment[]>("/api/appointments"),
          fetcher<CalendarStatus>("/api/calendar/connect")
        ]);
        
        setAppointments(appts ?? []);
        setCalendarStatus(status);
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleConnectCalendar = async () => {
    try {
      const response = await fetch("/api/calendar/connect", {
        method: "POST",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.connectUrl) {
          // In a real implementation, redirect to OAuth URL
          alert("Calendar connection initiated! (Mock implementation)");
        }
      }
    } catch (error) {
      console.error("Failed to connect calendar:", error);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-4">Calendar</h1>
        <div className="text-sm text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Calendar</h1>
        {calendarStatus && !calendarStatus.connected && (
          <button
            onClick={handleConnectCalendar}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Connect Calendar
          </button>
        )}
      </div>

      {calendarStatus?.connected ? (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">
            ✅ Calendar connected ({calendarStatus.provider}) • 
            {calendarStatus.eventsCount} events synced
            {calendarStatus.lastSync && ` • Last sync: ${new Date(calendarStatus.lastSync).toLocaleString()}`}
          </p>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            📅 Connect your calendar to view and manage appointments
          </p>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Upcoming Appointments</h2>
        
        {appointments.length === 0 ? (
          <div className="text-sm text-muted">No appointments scheduled.</div>
        ) : (
          <div className="space-y-2">
            {appointments.map((appt) => (
              <div key={appt.id} className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{appt.attendee.name}</h3>
                    <p className="text-sm text-gray-600">{appt.attendee.email}</p>
                    <p className="text-sm text-gray-600">{appt.attendee.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Date(appt.start).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(appt.start).toLocaleTimeString()} - {new Date(appt.end).toLocaleTimeString()}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      appt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
