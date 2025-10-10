'use client';

import { useState, useMemo } from 'react';
import type { Appointment } from '@/lib/types';
import { getStatusColor, getSourceColor } from '@/lib/calendar/colors';
import AppointmentDetailsDrawer from './AppointmentDetailsDrawer';

interface CalendarGridProps {
  appointments: Appointment[];
  onAppointmentUpdate: (appointment: Appointment) => void;
  onAppointmentDelete: (id: string) => void;
  onSelectSlot?: (start: Date, end: Date) => void;
  onAddContact?: (appointment: Appointment) => void;
}

type ViewType = 'month' | 'week' | 'day';

export default function CalendarGrid({ 
  appointments, 
  onAppointmentUpdate, 
  onAppointmentDelete,
  onSelectSlot,
  onAddContact
}: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const { days, startDate, endDate } = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (view === 'month') {
      start.setDate(1);
      start.setDate(start.getDate() - start.getDay());
      end.setMonth(end.getMonth() + 1, 0);
      end.setDate(end.getDate() + (6 - end.getDay()));
    } else if (view === 'week') {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      end.setDate(start.getDate() + 6);
    } else {
      // day view
      end.setDate(start.getDate() + 1);
    }

    const days = [];
    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return { days, startDate: start, endDate: end };
  }, [currentDate, view]);

  const appointmentsInRange = useMemo(() => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startsAt);
      return appointmentDate >= startDate && appointmentDate < endDate;
    });
  }, [appointments, startDate, endDate]);

  const getAppointmentsForDay = (date: Date) => {
    return appointmentsInRange.filter(appointment => {
      const appointmentDate = new Date(appointment.startsAt);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Always render the calendar grid, even with no appointments

  return (
    <>
      {/* Calendar Header */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  view === 'month' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  view === 'week' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  view === 'day' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Day
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('prev')}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigate('next')}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {view === 'month' && (
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {days.map((date, index) => {
                const dayAppointments = getAppointmentsForDay(date);
                const isCurrentMonthDay = isCurrentMonth(date);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border border-gray-100 dark:border-gray-700 ${
                      isCurrentMonthDay ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                    } ${isTodayDate ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => onSelectSlot?.(date, new Date(date.getTime() + 24 * 60 * 60 * 1000))}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentMonthDay ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'
                    } ${isTodayDate ? 'text-blue-600' : ''}`}>
                      {date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map((appointment) => {
                        const statusColor = getStatusColor(appointment.status);
                        return (
                          <div
                            key={appointment.id}
                            className={`text-xs p-1 rounded cursor-pointer ${statusColor.bg} ${statusColor.text} hover:${statusColor.hover} transition-colors group relative`}
                            title={`${appointment.title} - ${appointment.customerName}`}
                          >
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppointment(appointment);
                              }}
                              className="flex items-center justify-between"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="truncate font-medium">{appointment.title}</div>
                                <div className="truncate text-xs opacity-75">
                                  {formatTime(appointment.startsAt)} • {appointment.customerName}
                                </div>
                              </div>
                              
                              {appointment.status === 'canceled' && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (confirm('Delete this canceled appointment?')) {
                                      try {
                                        const response = await fetch(`/api/appointments/${appointment.id}`, {
                                          method: 'DELETE',
                                        });
                                        if (response.ok) {
                                          onAppointmentDelete(appointment.id);
                                        } else {
                                          alert('Failed to delete appointment');
                                        }
                                      } catch (error) {
                                        console.error('Error deleting appointment:', error);
                                        alert('Failed to delete appointment');
                                      }
                                    }
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-0.5 hover:bg-red-200 rounded"
                                  title="Delete appointment"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayAppointments.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {(view === 'week' || view === 'day') && (
            <div className="space-y-4">
              {days.map((date, index) => {
                const dayAppointments = getAppointmentsForDay(date);
                const isTodayDate = isToday(date);

                return (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className={`text-lg font-semibold mb-3 ${
                      isTodayDate ? 'text-blue-600' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    
                    {dayAppointments.length === 0 ? (
                      <div className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
                        No appointments scheduled
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dayAppointments.map((appointment) => {
                          const statusColor = getStatusColor(appointment.status);
                          const sourceColor = appointment.source ? getSourceColor(appointment.source) : null;

                          return (
                            <div
                              key={appointment.id}
                              onClick={() => setSelectedAppointment(appointment)}
                              className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-700"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {appointment.title}
                                    </h4>
                                    <div className={`w-2 h-2 rounded-full ${statusColor.dot}`} />
                                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor.bg} ${statusColor.text}`}>
                                      {appointment.status}
                                    </span>
                                    {appointment.source && sourceColor && (
                                      <span className={`text-xs px-2 py-1 rounded-full ${sourceColor.bg} ${sourceColor.text}`}>
                                        {sourceColor.icon} {appointment.source}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {formatTime(appointment.startsAt)} - {formatTime(appointment.endsAt)} • {appointment.customerName}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Empty State Overlay */}
        {appointments.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl">
            <div className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-muted dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No appointments in this view</h3>
              <p className="text-muted-foreground mb-4">Click on any day to create your first appointment.</p>
              <button
                onClick={() => onSelectSlot?.(new Date(), new Date(Date.now() + 60 * 60 * 1000))}
                className="inline-flex items-center px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Appointment
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedAppointment && (
        <AppointmentDetailsDrawer
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={onAppointmentUpdate}
          onDelete={onAppointmentDelete}
          onAddContact={onAddContact}
        />
      )}
    </>
  );
}
