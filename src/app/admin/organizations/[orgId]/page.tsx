"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface Organization {
  id: string;
  name: string;
  logo: string | null;
  timezone: string;
  businessHours: any;
  createdAt: string;
}

interface RetellConfig {
  id: string;
  retellAgentId: string;
  retellPhoneNumber: string | null;
  apiKey: string; // masked
  voiceId: string | null;
  language: string;
  customPrompt: string | null;
  isActive: boolean;
}

interface N8nConfig {
  id: string;
  n8nInstanceUrl: string;
  workflowId: string;
  apiKey: string; // masked
  webhookUrl: string | null;
  isActive: boolean;
}

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [retellConfig, setRetellConfig] = useState<RetellConfig | null>(null);
  const [n8nConfig, setN8nConfig] = useState<N8nConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "retell" | "n8n" | "calls">("overview");

  // Retell form state
  const [retellForm, setRetellForm] = useState({
    retellAgentId: "",
    retellPhoneNumber: "",
    apiKey: "",
    voiceId: "",
    language: "en-US",
    customPrompt: "",
    isActive: true,
  });

  // n8n form state
  const [n8nForm, setN8nForm] = useState({
    n8nInstanceUrl: "",
    workflowId: "",
    apiKey: "",
    webhookUrl: "",
    isActive: true,
  });

  useEffect(() => {
    loadOrganization();
    loadRetellConfig();
    loadN8nConfig();
  }, [orgId]);

  const loadOrganization = async () => {
    try {
      // For now, we'll fetch from the organizations API
      // In production, create a specific endpoint for single org
      const response = await fetch("/api/admin/organizations");
      if (response.ok) {
        const data = await response.json();
        const org = data.organizations.find((o: any) => o.id === orgId);
        if (org) {
          setOrganization(org);
        }
      }
    } catch (error) {
      console.error("Error loading organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRetellConfig = async () => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/retell`);
      if (response.ok) {
        const data = await response.json();
        setRetellConfig(data);
        setRetellForm({
          retellAgentId: data.retellAgentId || "",
          retellPhoneNumber: data.retellPhoneNumber || "",
          apiKey: "",
          voiceId: data.voiceId || "",
          language: data.language || "en-US",
          customPrompt: data.customPrompt || "",
          isActive: data.isActive,
        });
      }
    } catch (error) {
      console.error("Error loading Retell config:", error);
    }
  };

  const loadN8nConfig = async () => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/n8n`);
      if (response.ok) {
        const data = await response.json();
        setN8nConfig(data);
        setN8nForm({
          n8nInstanceUrl: data.n8nInstanceUrl || "",
          workflowId: data.workflowId || "",
          apiKey: "",
          webhookUrl: data.webhookUrl || "",
          isActive: data.isActive,
        });
      }
    } catch (error) {
      console.error("Error loading n8n config:", error);
    }
  };

  const saveRetellConfig = async () => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/retell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(retellForm),
      });

      if (response.ok) {
        alert("Retell configuration saved successfully!");
        loadRetellConfig();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to save Retell configuration");
    }
  };

  const saveN8nConfig = async () => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/n8n`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nForm),
      });

      if (response.ok) {
        alert("n8n configuration saved successfully!");
        loadN8nConfig();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to save n8n configuration");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organization...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Organization not found</p>
          <button
            onClick={() => router.push("/admin/organizations")}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Organizations
          </button>
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
              <div className="flex items-center space-x-4">
                {organization.logo ? (
                  <img src={organization.logo} alt={organization.name} className="h-16 w-16 rounded-lg" />
                ) : (
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {organization.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    {organization.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Timezone: {organization.timezone} • Created: {new Date(organization.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={() => router.push("/admin/organizations")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {["overview", "retell", "n8n", "calls"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`
                  ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                `}
              >
                {tab === "n8n" ? "n8n Automation" : tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Overview</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Organization ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{organization.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Timezone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{organization.timezone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Retell Status</dt>
                  <dd className="mt-1">
                    {retellConfig ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {retellConfig.isActive ? "Active" : "Inactive"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not Configured
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">n8n Status</dt>
                  <dd className="mt-1">
                    {n8nConfig ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {n8nConfig.isActive ? "Active" : "Inactive"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not Configured
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === "retell" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Retell AI Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Agent ID</label>
                <input
                  type="text"
                  value={retellForm.retellAgentId}
                  onChange={(e) => setRetellForm({ ...retellForm, retellAgentId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="agent_abc123..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number (E.164 format)</label>
                <input
                  type="text"
                  value={retellForm.retellPhoneNumber}
                  onChange={(e) => setRetellForm({ ...retellForm, retellPhoneNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="+15551234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">API Key</label>
                <input
                  type="password"
                  value={retellForm.apiKey}
                  onChange={(e) => setRetellForm({ ...retellForm, apiKey: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter new API key to update"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Voice ID</label>
                <input
                  type="text"
                  value={retellForm.voiceId}
                  onChange={(e) => setRetellForm({ ...retellForm, voiceId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="11labs-Adrian"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <select
                  value={retellForm.language}
                  onChange={(e) => setRetellForm({ ...retellForm, language: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Custom Prompt</label>
                <textarea
                  value={retellForm.customPrompt}
                  onChange={(e) => setRetellForm({ ...retellForm, customPrompt: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="You are a receptionist for..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={retellForm.isActive}
                  onChange={(e) => setRetellForm({ ...retellForm, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Active</label>
              </div>
              <button
                onClick={saveRetellConfig}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save Retell Configuration
              </button>
            </div>
          </div>
        )}

        {activeTab === "n8n" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">n8n Automation Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">n8n Instance URL</label>
                <input
                  type="text"
                  value={n8nForm.n8nInstanceUrl}
                  onChange={(e) => setN8nForm({ ...n8nForm, n8nInstanceUrl: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://n8n.example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Workflow ID</label>
                <input
                  type="text"
                  value={n8nForm.workflowId}
                  onChange={(e) => setN8nForm({ ...n8nForm, workflowId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="workflow_123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">API Key</label>
                <input
                  type="password"
                  value={n8nForm.apiKey}
                  onChange={(e) => setN8nForm({ ...n8nForm, apiKey: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter new API key to update"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
                <input
                  type="text"
                  value={n8nForm.webhookUrl}
                  onChange={(e) => setN8nForm({ ...n8nForm, webhookUrl: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://n8n.example.com/webhook/..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={n8nForm.isActive}
                  onChange={(e) => setN8nForm({ ...n8nForm, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Active</label>
              </div>
              <button
                onClick={saveN8nConfig}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save n8n Configuration
              </button>
            </div>
          </div>
        )}

        {activeTab === "calls" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Call Logs</h3>
            <p className="text-gray-600">Call logs will be displayed here...</p>
            <p className="text-sm text-gray-500 mt-2">
              API Endpoint: <code className="bg-gray-100 px-2 py-1 rounded">/api/organizations/{orgId}/calls</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
