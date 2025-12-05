"use client";

import { useState } from "react";
import type { Appointment } from "@/lib/types";
import { useToast } from "@/components/Toast";

interface CancelAppointmentModalProps {
  appointment: Appointment;
  onClose: () => void;
  onConfirm: (updatedAppointment: Appointment) => void;
}

export default function CancelAppointmentModal({
  appointment,
  onClose,
  onConfirm,
}: CancelAppointmentModalProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // Call API to cancel appointment
      const response = await fetch(
        `/api/appointments/${appointment.id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "canceled",
            notes: appointment.notes
              ? `${appointment.notes}\n\nAppointment canceled.`
              : "Appointment canceled.",
          }),
        },
      );

      if (response.ok) {
        const updatedAppointment = await response.json();
        onConfirm(updatedAppointment);
      } else {
        throw new Error("Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
      showToast("Failed to cancel appointment. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Cancel Appointment
              </h3>
              <p className="text-sm text-gray-500">
                This action cannot be undone
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to cancel this appointment?
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {appointment.title}
              </h4>
              <p className="text-sm text-gray-600">
                {appointment.customerName} •{" "}
                {new Date(appointment.startsAt).toLocaleString()}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Important Notice
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    <strong>
                      This will notify the customer by SMS about the
                      cancellation.
                    </strong>
                    Make sure this is what you want to do before proceeding.
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
              Keep Appointment
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? "Canceling..." : "Cancel Appointment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
