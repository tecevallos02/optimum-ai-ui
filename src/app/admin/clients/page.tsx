"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NewClient {
  companyName: string;
  contactEmail: string;
  contactName: string;
  phone: string;
  address: string;
  googleSheetId: string;
  retellWebhookUrl: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newClient, setNewClient] = useState<NewClient>({
    companyName: "",
    contactEmail: "",
    contactName: "",
    phone: "",
    address: "",
    googleSheetId: "",
    retellWebhookUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newClient),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(
          `Client "${newClient.companyName}" created successfully! User account: ${result.user.email}`,
        );
        setNewClient({
          companyName: "",
          contactEmail: "",
          contactName: "",
          phone: "",
          address: "",
          googleSheetId: "",
          retellWebhookUrl: "",
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create client");
      }
    } catch (error) {
      setError("An error occurred while creating the client");
      console.error("Error creating client:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setNewClient({
      ...newClient,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Client
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Create a new client account and company
              </p>
            </div>
            <Link
              href="/admin"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Company Information
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="companyName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      id="companyName"
                      required
                      value={newClient.companyName}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., P&J Air Conditioning"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contactEmail"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      id="contactEmail"
                      required
                      value={newClient.contactEmail}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="contact@company.com"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Contact Person
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contactName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      id="contactName"
                      required
                      value={newClient.contactName}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={newClient.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <textarea
                    name="address"
                    id="address"
                    rows={3}
                    value={newClient.address}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
              </div>

              {/* Integration Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Integration Settings
                </h3>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="googleSheetId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Google Sheet ID
                    </label>
                    <input
                      type="text"
                      name="googleSheetId"
                      id="googleSheetId"
                      value={newClient.googleSheetId}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      The ID from your Google Sheets URL (the long string
                      between /d/ and /edit)
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="retellWebhookUrl"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Retell Webhook URL
                    </label>
                    <input
                      type="url"
                      name="retellWebhookUrl"
                      id="retellWebhookUrl"
                      value={newClient.retellWebhookUrl}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://ui.goshawkai.com/api/webhooks/retell/COMPANY_ID"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      The webhook URL for this company (will be provided after
                      creation)
                    </p>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Success
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>{success}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md text-sm font-medium"
                >
                  {loading ? "Creating Client..." : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
