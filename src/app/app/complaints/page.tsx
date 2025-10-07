'use client'

import { useState, useEffect } from 'react'
import { fetcher } from '@/lib/fetcher'
import DataTable from '@/components/DataTable'
import type { Complaint } from '@/lib/types'
import type { Column } from '@/components/DataTable'

interface ComplaintsResponse {
  complaints: Complaint[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function ComplaintsPage() {
  const [data, setData] = useState<ComplaintsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null)

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const response = await fetcher<ComplaintsResponse>("/api/complaints")
      if (response) {
        setData(response)
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  const handleAddComplaint = async (complaintData: Omit<Complaint, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaintData),
      })
      
      if (response.ok) {
        await fetchComplaints()
        setShowAddModal(false)
      }
    } catch (error) {
      console.error("Failed to add complaint:", error)
    }
  }

  const handleEditComplaint = async (id: string, complaintData: Partial<Complaint>) => {
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaintData),
      })
      
      if (response.ok) {
        await fetchComplaints()
        setEditingComplaint(null)
      }
    } catch (error) {
      console.error("Failed to edit complaint:", error)
    }
  }

  const handleDeleteComplaint = async (id: string) => {
    if (!confirm("Are you sure you want to delete this complaint?")) return
    
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        await fetchComplaints()
      }
    } catch (error) {
      console.error("Failed to delete complaint:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      OPEN: 'bg-red-100 text-red-800',
      RESOLVED: 'bg-yellow-100 text-yellow-800',
      CLOSED: 'bg-green-100 text-green-800',
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const columns: Column<Complaint & { actions?: never }>[] = [
    { key: "phoneNumber", header: "Phone Number" },
    { 
      key: "callTimestamp", 
      header: "Call Timestamp",
      render: (row) => new Date(row.callTimestamp as string).toLocaleString()
    },
    { key: "description", header: "Description" },
    { 
      key: "status", 
      header: "Status",
      render: (row) => getStatusBadge(row.status as string)
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingComplaint(row)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteComplaint(row.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Complaints</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Complaint
        </button>
      </div>
      
      {loading ? (
        <div className="text-sm text-muted">Loading…</div>
      ) : (
        <DataTable<Complaint> data={data?.complaints || []} columns={columns} pageSize={10} />
      )}

      {showAddModal && (
        <AddComplaintModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddComplaint}
        />
      )}

      {editingComplaint && (
        <EditComplaintModal
          complaint={editingComplaint}
          onClose={() => setEditingComplaint(null)}
          onSave={(data) => handleEditComplaint(editingComplaint.id, data)}
        />
      )}
    </div>
  )
}

// Add Complaint Modal Component
function AddComplaintModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (data: Omit<Complaint, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>) => void
}) {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    callTimestamp: "",
    description: "",
    status: "OPEN" as const,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Complaint</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="+1234567890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Call Timestamp *</label>
            <input
              type="datetime-local"
              required
              value={formData.callTimestamp}
              onChange={(e) => setFormData({ ...formData, callTimestamp: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              rows={3}
              placeholder="Describe the complaint..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Complaint Modal Component
function EditComplaintModal({ complaint, onClose, onSave }: {
  complaint: Complaint
  onClose: () => void
  onSave: (data: Partial<Complaint>) => void
}) {
  const [formData, setFormData] = useState({
    status: complaint.status,
    description: complaint.description || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Complaint</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="text"
              value={complaint.phoneNumber}
              disabled
              className="w-full border rounded-md px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Call Timestamp</label>
            <input
              type="text"
              value={new Date(complaint.callTimestamp).toLocaleString()}
              disabled
              className="w-full border rounded-md px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="OPEN">Open</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
