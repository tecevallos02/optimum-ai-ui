"use client";

import { useState } from "react";
import type { Appointment } from "@/lib/types";

interface DuplicateContactModalProps {
  appointment: Appointment;
  matchId: string;
  matchFields: ("email" | "phone" | "name")[];
  onClose: () => void;
  onAddContact: (contactData: any) => void;
  onReplaceContact: (contactId: string, contactData: any) => void;
}

export default function DuplicateContactModal({
  appointment,
  matchId,
  matchFields,
  onClose,
  onAddContact,
  onReplaceContact,
}: DuplicateContactModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<"add" | "replace" | null>(null);

  const contactData = {
    fullName: appointment.customerName,
    email: appointment.customerEmail || undefined,
    phone: appointment.customerPhone || undefined,
    notes: appointment.description || undefined,
    source: "calendar",
  };

  const getMatchDescription = () => {
    const descriptions = [];
    if (matchFields.includes("email")) descriptions.push("email");
    if (matchFields.includes("phone")) descriptions.push("phone");
    if (matchFields.includes("name")) descriptions.push("name");

    if (descriptions.length === 1) {
      return `same ${descriptions[0]}`;
    } else if (descriptions.length === 2) {
      return `same ${descriptions[0]} and ${descriptions[1]}`;
    } else {
      return `same ${descriptions[0]}, ${descriptions[1]}, and ${descriptions[2]}`;
    }
  };

  const handleAddContact = async () => {
    setAction("add");
    setIsLoading(true);
    try {
      await onAddContact(contactData);
      onClose();
    } catch (error) {
      console.error("Error adding contact:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplaceContact = async () => {
    setAction("replace");
    setIsLoading(true);
    try {
      await onReplaceContact(matchId, contactData);
      onClose();
    } catch (error) {
      console.error("Error replacing contact:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Possible Duplicate Contact
              </h3>
              <p className="text-sm text-gray-500">
                We found an existing contact with the {getMatchDescription()}.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-2">
                New Contact Details
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>
                  <strong>Name:</strong> {appointment.customerName}
                </div>
                {appointment.customerEmail && (
                  <div>
                    <strong>Email:</strong> {appointment.customerEmail}
                  </div>
                )}
                {appointment.customerPhone && (
                  <div>
                    <strong>Phone:</strong> {appointment.customerPhone}
                  </div>
                )}
                {appointment.description && (
                  <div>
                    <strong>Notes:</strong> {appointment.description}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">
                    What would you like to do?
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    You can add this as a new contact, or replace the existing
                    one with these updated details.
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
              onClick={handleAddContact}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading && action === "add" ? "Adding..." : "Add Contact"}
            </button>
            <button
              onClick={handleReplaceContact}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading && action === "replace"
                ? "Replacing..."
                : "Replace Contact"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
