'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  users: { email: string }[];
  phones: { e164: string }[];
  sheets: { spreadsheetId: string }[];
  retell: { workflowId: string; webhookUrl: string }[];
  createdAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({
    companyName: '',
    userEmail: '',
    userPassword: '',
    userFirstName: '',
    userLastName: '',
    phoneNumber: '',
    googleSheetId: '',
    retellWorkflowId: '',
    retellApiKey: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/companies');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });

      if (response.ok) {
        const data = await response.json();
        setClients([...clients, data]);
        setNewClient({
          companyName: '',
          userEmail: '',
          userPassword: '',
          userFirstName: '',
          userLastName: '',
          phoneNumber: '',
          googleSheetId: '',
          retellWorkflowId: '',
          retellApiKey: ''
        });
        setShowAddForm(false);
        alert('Client added successfully!');
      } else {
        alert('Error adding client');
      }
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error adding client');
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.users[0]?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="admin-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin" className="text-blue-600 hover:text-blue-800 mr-4">← Back to Dashboard</Link>
              <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="admin-button-primary"
            >
              {showAddForm ? 'Cancel' : 'Add New Client'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredClients.length} of {clients.length} clients
            </div>
          </div>
        </div>

        {/* Add Client Form */}
        {showAddForm && (
          <div className="admin-card p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New Client</h2>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <input
                    type="text"
                    value={newClient.companyName}
                    onChange={(e) => setNewClient({...newClient, companyName: e.target.value})}
                    className="admin-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">User Email</label>
                  <input
                    type="email"
                    value={newClient.userEmail}
                    onChange={(e) => setNewClient({...newClient, userEmail: e.target.value})}
                    className="admin-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">User Password</label>
                  <input
                    type="password"
                    value={newClient.userPassword}
                    onChange={(e) => setNewClient({...newClient, userPassword: e.target.value})}
                    className="admin-input"
                    placeholder="Temporary password (user should change on first login)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    value={newClient.userFirstName}
                    onChange={(e) => setNewClient({...newClient, userFirstName: e.target.value})}
                    className="admin-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newClient.userLastName}
                    onChange={(e) => setNewClient({...newClient, userLastName: e.target.value})}
                    className="admin-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newClient.phoneNumber}
                    onChange={(e) => setNewClient({...newClient, phoneNumber: e.target.value})}
                    className="admin-input"
                    placeholder="+15551234567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Google Sheet ID</label>
                  <input
                    type="text"
                    value={newClient.googleSheetId}
                    onChange={(e) => setNewClient({...newClient, googleSheetId: e.target.value})}
                    className="admin-input"
                    placeholder="or 'mock' for testing"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Retell Workflow ID</label>
                  <input
                    type="text"
                    value={newClient.retellWorkflowId}
                    onChange={(e) => setNewClient({...newClient, retellWorkflowId: e.target.value})}
                    className="admin-input"
                    placeholder="or 'mock' for testing"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Retell API Key</label>
                  <input
                    type="text"
                    value={newClient.retellApiKey}
                    onChange={(e) => setNewClient({...newClient, retellApiKey: e.target.value})}
                    className="admin-input"
                    placeholder="or 'mock' for testing"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="admin-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-button-primary"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Clients Table */}
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Google Sheet</th>
                  <th>Retell Workflow</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="admin-table td">
                      <div>
                        <div className="font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">ID: {client.id}</div>
                      </div>
                    </td>
                    <td className="admin-table td">
                      {client.users[0]?.email || 'No user'}
                    </td>
                    <td className="admin-table td">
                      {client.phones[0]?.e164 || 'No phone'}
                    </td>
                    <td className="admin-table td">
                      <div className="text-sm">
                        {client.sheets[0]?.spreadsheetId || 'Not configured'}
                      </div>
                    </td>
                    <td className="admin-table td">
                      <div className="text-sm">
                        {client.retell[0]?.workflowId || 'Not configured'}
                      </div>
                    </td>
                    <td className="admin-table td">
                      <span className="status-active">Active</span>
                    </td>
                    <td className="admin-table td">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Edit
                        </button>
                        <button className="text-green-600 hover:text-green-800 text-sm">
                          Test
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No clients found</p>
          </div>
        )}
      </div>
    </div>
  );
}
