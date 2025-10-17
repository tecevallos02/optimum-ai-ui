"use client";

import { useState } from "react";
import type { Appointment } from "@/lib/types";

interface EmailTemplate {
  id: string;
  appointmentId: string;
  subject: string;
  content: string;
  generatedAt: string;
}

interface EditableEmailDialogProps {
  appointment: Appointment;
  emailTemplate: EmailTemplate;
  onClose: () => void;
  onConfirm: (subject: string, content: string) => void;
}

export default function EditableEmailDialog({
  appointment,
  emailTemplate,
  onClose,
  onConfirm,
}: EditableEmailDialogProps) {
  const [subject, setSubject] = useState(emailTemplate.subject);
  const [content, setContent] = useState(emailTemplate.content);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      onConfirm(subject, content);
      onClose();
    } catch (error) {
      console.error("Error confirming email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Edit Email
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                For: {appointment.customerName} • {appointment.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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

          <div className="space-y-6">
            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Subject Line
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Email subject..."
              />
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Content
              </label>
              <textarea
                id="content"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Email content..."
              />
            </div>

            {/* Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>To:</strong>{" "}
                  {appointment.customerEmail || "No email provided"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Subject:</strong> {subject}
                </div>
                <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {content}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || !subject.trim() || !content.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? "Confirming..." : "Confirm & Insert"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
