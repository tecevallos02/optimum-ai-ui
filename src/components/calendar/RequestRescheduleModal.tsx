'use client';

import { useState } from 'react';
import type { Appointment } from '@/lib/types';

interface RequestRescheduleModalProps {
  appointment: Appointment;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RequestRescheduleModal({
  appointment,
  onClose,
  onConfirm
}: RequestRescheduleModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // Call API to request reschedule
      const response = await fetch(`/api/appointments/${appointment.id}/request-reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: appointment.notes ? `${appointment.notes}\n\nReschedule requested.` : 'Reschedule requested.'
        }),
      });

      if (response.ok) {
        onConfirm();
      } else {
        throw new Error('Failed to request reschedule');
      }
    } catch (error) {
      console.error('Error requesting reschedule:', error);
      alert('Failed to request reschedule. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Request Reschedule</h3>
              <p className="text-sm text-gray-500">Ask customer to pick a new time</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Request the customer to reschedule this appointment to a different time?
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-2">{appointment.title}</h4>
              <p className="text-sm text-gray-600">
                {appointment.customerName} • {new Date(appointment.startsAt).toLocaleString()}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">What happens next?</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>We'll send an SMS asking the customer to pick a new time.</strong> 
                    The customer will receive a link to reschedule the appointment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reschedule Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
