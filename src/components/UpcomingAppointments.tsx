'use client'

import { useState, useEffect } from 'react'
import { Appointment } from '@/lib/types'

interface UpcomingAppointmentsProps {
  className?: string
}

export default function UpcomingAppointments({ className = '' }: UpcomingAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingAppointments()
  }, [])

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      if (response.ok) {
        const data = await response.json()
        
        // Filter appointments for the next 2 weeks
        const now = new Date()
        const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
        
        const upcomingAppointments = data.filter((appointment: Appointment) => {
          const appointmentDate = new Date(appointment.startsAt)
          return appointmentDate >= now && appointmentDate <= twoWeeksFromNow
        }).sort((a: Appointment, b: Appointment) => 
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
        )
        
        setAppointments(upcomingAppointments)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      case 'no_show':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-white p-6 rounded-xl shadow-card ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-card border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg group ${className}`}>
      <div className="flex items-center justify-between mb-6 border-b border-gray-50 dark:border-gray-700 pb-4 group-hover:border-gray-100 dark:group-hover:border-gray-600 transition-colors duration-200">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-200">Upcoming Appointments</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
          Next 2 weeks ({appointments.length} appointments)
        </span>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No upcoming appointments in the next 2 weeks</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.slice(0, 6).map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm group"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {appointment.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {appointment.customerName}
                  </p>
                  {appointment.customerPhone && (
                    <p className="text-sm text-gray-500">
                      {appointment.customerPhone}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(appointment.startsAt)}
                </div>
                <div className="text-sm text-gray-600">
                  {formatTime(appointment.startsAt)} - {formatTime(appointment.endsAt)}
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border transition-all duration-200 group-hover:scale-105 ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
          
          {appointments.length > 6 && (
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                And {appointments.length - 6} more appointments...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
