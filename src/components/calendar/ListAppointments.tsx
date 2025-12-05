"use client";

import { useState } from "react";
import type { Appointment } from "@/lib/types";
import { getStatusColor, getSourceColor } from "@/lib/calendar/colors";
import AppointmentDetailsDrawer from "./AppointmentDetailsDrawer";
import { useToast } from "@/components/Toast";

interface ListAppointmentsProps {
  appointments: Appointment[];
  onAppointmentUpdate: (appointment: Appointment) => void;
  onAppointmentDelete: (id: string) => void;
  onAddContact?: (appointment: Appointment) => void;
}

export default function ListAppointments({
  appointments,
  onAppointmentUpdate,
  onAppointmentDelete,
  onAddContact,
}: ListAppointmentsProps) {
  const { showToast, showConfirm } = useToast();
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-dark-hover rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No appointments scheduled
        </h3>
        <p className="text-gray-500 dark:text-dark-text-secondary mb-4">
          Get started by creating your first appointment.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {appointments.map((appointment) => {
          const statusColor = getStatusColor(appointment.status);
          const sourceColor = appointment.source
            ? getSourceColor(appointment.source)
            : null;

          return (
            <div
              key={appointment.id}
              className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => setSelectedAppointment(appointment)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {appointment.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${statusColor.dot}`}
                      />
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor.bg} ${statusColor.text}`}
                      >
                        {appointment.status}
                      </span>
                      {appointment.source && sourceColor && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${sourceColor.bg} ${sourceColor.text}`}
                        >
                          {sourceColor.icon} {appointment.source}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                      <span className="font-medium">
                        {appointment.customerName}
                      </span>
                      {appointment.customerPhone && (
                        <span className="ml-2 text-gray-500 dark:text-gray-500">
                          • {appointment.customerPhone}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                      {formatDate(appointment.startsAt)} •{" "}
                      {formatTime(appointment.startsAt)} -{" "}
                      {formatTime(appointment.endsAt)}
                    </p>
                    {appointment.notes && (
                      <p className="text-sm text-gray-500 dark:text-dark-text-secondary truncate">
                        {appointment.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0 flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddContact?.(appointment);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg"
                    title="Add to contacts"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAppointment(appointment);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg"
                    title="View details"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>

                  {appointment.status === "canceled" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showConfirm(
                          "Are you sure you want to permanently delete this canceled appointment?",
                          async () => {
                            try {
                              const response = await fetch(
                                `/api/appointments/${appointment.id}`,
                                {
                                  method: "DELETE",
                                },
                              );
                              if (response.ok) {
                                showToast(
                                  "Appointment deleted successfully!",
                                  "success",
                                );
                                onAppointmentDelete(appointment.id);
                              } else {
                                showToast(
                                  "Failed to delete appointment. Please try again.",
                                  "error",
                                );
                              }
                            } catch (error) {
                              console.error("Error deleting appointment:", error);
                              showToast(
                                "Failed to delete appointment. Please try again.",
                                "error",
                              );
                            }
                          },
                        );
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                      title="Delete appointment"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedAppointment && (
        <AppointmentDetailsDrawer
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={onAppointmentUpdate}
          onDelete={onAppointmentDelete}
        />
      )}
    </>
  );
}
