"use client";

import { useState } from "react";
import type { Appointment } from "@/lib/types";
import { getStatusColor, getSourceColor } from "@/lib/calendar/colors";
import CancelAppointmentModal from "./CancelAppointmentModal";
import RequestRescheduleModal from "./RequestRescheduleModal";
import DeleteAppointmentModal from "./DeleteAppointmentModal";

interface AppointmentDetailsDrawerProps {
  appointment: Appointment;
  onClose: () => void;
  onUpdate: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  onAddContact?: (appointment: Appointment) => void;
}

export default function AppointmentDetailsDrawer({
  appointment,
  onClose,
  onUpdate,
  onDelete,
  onAddContact,
}: AppointmentDetailsDrawerProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const statusColor = getStatusColor(appointment.status);
  const sourceColor = appointment.source
    ? getSourceColor(appointment.source)
    : null;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = () => {
    const start = new Date(appointment.startsAt);
    const end = new Date(appointment.endsAt);
    const durationMs = end.getTime() - start.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor(
      (durationMs % (1000 * 60 * 60)) / (1000 * 60),
    );

    if (durationHours > 0) {
      return `${durationHours}h ${durationMinutes}m`;
    }
    return `${durationMinutes}m`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-dark-card shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Appointment Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Title and Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {appointment.title}
                </h3>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColor.dot}`} />
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor.bg} ${statusColor.text}`}
                  >
                    {appointment.status}
                  </span>
                  {appointment.source && sourceColor && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${sourceColor.bg} ${sourceColor.text}`}
                    >
                      {sourceColor.icon} {appointment.source}
                    </span>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide mb-3">
                  Customer Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                      Name:
                    </span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">
                      {appointment.customerName}
                    </span>
                  </div>
                  {appointment.customerPhone && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                        Phone:
                      </span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {appointment.customerPhone}
                      </span>
                    </div>
                  )}
                  {appointment.customerEmail && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                        Email:
                      </span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {appointment.customerEmail}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Date and Time */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide mb-3">
                  Schedule
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                      Start:
                    </span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">
                      {formatDateTime(appointment.startsAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                      End:
                    </span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">
                      {formatDateTime(appointment.endsAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                      Duration:
                    </span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">
                      {formatDuration()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {appointment.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide mb-3">
                    Description
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-hover p-3 rounded-lg">
                    {appointment.description}
                  </p>
                </div>
              )}

              {/* Notes */}
              {appointment.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide mb-3">
                    Notes
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-hover p-3 rounded-lg">
                    {appointment.notes}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide mb-3">
                  Details
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-dark-text-secondary">
                  <div>
                    Created:{" "}
                    {new Date(appointment.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    Last updated:{" "}
                    {new Date(appointment.updatedAt).toLocaleDateString()}
                  </div>
                  {appointment.googleEventId && (
                    <div>Google Event ID: {appointment.googleEventId}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 dark:border-dark-border p-6">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => onAddContact?.(appointment)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Add Contact
              </button>

              {appointment.status !== "canceled" &&
                appointment.status !== "completed" && (
                  <>
                    <button
                      onClick={() => setShowRescheduleModal(true)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Request Reschedule
                    </button>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Cancel Appointment
                    </button>
                  </>
                )}

              {appointment.status === "canceled" && (
                <div className="space-y-3">
                  <div className="text-center text-sm text-gray-500 py-2">
                    This appointment has been canceled
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete Appointment
                  </button>
                </div>
              )}

              {appointment.status === "completed" && (
                <div className="text-center text-sm text-gray-500 py-2">
                  This appointment has been completed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCancelModal && (
        <CancelAppointmentModal
          appointment={appointment}
          onClose={() => setShowCancelModal(false)}
          onConfirm={(updatedAppointment) => {
            onUpdate(updatedAppointment);
            setShowCancelModal(false);
            onClose();
          }}
        />
      )}

      {showRescheduleModal && (
        <RequestRescheduleModal
          appointment={appointment}
          onClose={() => setShowRescheduleModal(false)}
          onConfirm={() => {
            // Update appointment status to indicate reschedule requested
            onUpdate({
              ...appointment,
              status: "scheduled",
              notes: appointment.notes
                ? `${appointment.notes}\n\nReschedule requested.`
                : "Reschedule requested.",
            });
            setShowRescheduleModal(false);
            onClose();
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteAppointmentModal
          appointment={appointment}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            onDelete(appointment.id);
            setShowDeleteModal(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
