'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  googleSheetId: string | null;
  retellWebhookUrl: string | null;
  users: {
    id: string;
    email: string;
    name: string;
  }[];
}

export default function IntegrationsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    googleSheetId: '',
    retellWebhookUrl: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        setError('Failed to fetch companies');
      }
    } catch (error) {
      setError('An error occurred while fetching companies');
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company.id);
    setEditForm({
      googleSheetId: company.googleSheetId || '',
      retellWebhookUrl: company.retellWebhookUrl || ''
    });
  };

  const handleSave = async (companyId: string) => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await fetchCompanies(); // Refresh the list
        setEditingCompany(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update company');
      }
    } catch (error) {
      setError('An error occurred while updating the company');
      console.error('Error updating company:', error);
    }
  };

  const handleCancel = () => {
    setEditingCompany(null);
    setEditForm({ googleSheetId: '', retellWebhookUrl: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Integration Settings</h1>
              <p className="mt-1 text-sm text-gray-500">Manage Google Sheets and Retell webhook integrations</p>
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Companies List */}
        <div className="space-y-6">
          {companies.map((company) => (
            <div key={company.id} className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{company.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {company.users.length} user{company.users.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEdit(company)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Edit Integrations
                  </button>
                </div>

                {/* Integration Details */}
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Sheet ID
                    </label>
                    {editingCompany === company.id ? (
                      <input
                        type="text"
                        value={editForm.googleSheetId}
                        onChange={(e) => setEditForm({ ...editForm, googleSheetId: e.target.value })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {company.googleSheetId || 'Not configured'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retell Webhook URL
                    </label>
                    {editingCompany === company.id ? (
                      <input
                        type="url"
                        value={editForm.retellWebhookUrl}
                        onChange={(e) => setEditForm({ ...editForm, retellWebhookUrl: e.target.value })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="https://ui.goshawkai.com/api/webhooks/retell/COMPANY_ID"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {company.retellWebhookUrl || 'Not configured'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Webhook URL Display */}
                {company.retellWebhookUrl && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Generated Webhook URL
                    </label>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <code className="text-sm text-gray-800">
                        {company.retellWebhookUrl}
                      </code>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Use this URL in your Retell workflow configuration
                    </p>
                  </div>
                )}

                {/* Edit Actions */}
                {editingCompany === company.id && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={handleCancel}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave(company.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Save Changes
                    </button>
                  </div>
                )}

                {/* Users List */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Users</h4>
                  <div className="space-y-2">
                    {company.users.map((user) => (
                      <div key={user.id} className="flex items-center text-sm text-gray-600">
                        <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{user.name}</span>
                        <span className="mx-2">•</span>
                        <span>{user.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {companies.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new client.</p>
            <div className="mt-6">
              <Link
                href="/admin/add-client"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add New Client
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
