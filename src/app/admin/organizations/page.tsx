"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Organization {
  id: string;
  name: string;
  logo: string | null;
  timezone: string;
  createdAt: string;
  _count: {
    memberships: number;
    appointments: number;
    callLogs: number;
  };
  retellConfig: {
    id: string;
    isActive: boolean;
    retellPhoneNumber: string | null;
  } | null;
  n8nConfig: {
    id: string;
    isActive: boolean;
  } | null;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAdminAuth();
    loadOrganizations();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const response = await fetch("/api/admin/session");
      if (!response.ok) {
        router.push("/admin/simple-login");
      }
    } catch (error) {
      router.push("/admin/simple-login");
    }
  };

  const loadOrganizations = async () => {
    try {
      const response = await fetch("/api/admin/organizations");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (org: Organization) => {
    const hasRetell = org.retellConfig?.isActive;
    const hasN8n = org.n8nConfig?.isActive;

    if (hasRetell && hasN8n) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Fully Configured
        </span>
      );
    } else if (hasRetell || hasN8n) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Partially Configured
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Not Configured
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Organizations
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage organizations and their AI Receptionist configurations
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <button
                onClick={() => router.push("/admin/simple")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
              <button
                onClick={() => router.push("/admin/organizations/new")}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Organization
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrgs.map((org) => (
            <div
              key={org.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/admin/organizations/${org.id}`)}
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {org.logo ? (
                      <img src={org.logo} alt={org.name} className="h-10 w-10 rounded-lg" />
                    ) : (
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {org.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{org.name}</h3>
                      <p className="text-sm text-gray-500">{org.timezone}</p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">{getStatusBadge(org)}</div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Members</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {org._count.memberships}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Appointments</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {org._count.appointments}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Calls</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {org._count.callLogs}
                    </p>
                  </div>
                </div>

                {/* Integration Status */}
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        org.retellConfig?.isActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="text-gray-600">Retell</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        org.n8nConfig?.isActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="text-gray-600">n8n</span>
                  </div>
                  {org.retellConfig?.retellPhoneNumber && (
                    <span className="text-xs text-gray-500">
                      📞 {org.retellConfig.retellPhoneNumber}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6">
                <div className="text-sm">
                  <span className="text-gray-500">Created: </span>
                  <span className="text-gray-900 font-medium">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrgs.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No organizations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Try adjusting your search"
                : "Get started by creating a new organization"}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => router.push("/admin/organizations/new")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Organization
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
