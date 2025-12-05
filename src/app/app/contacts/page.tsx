"use client";

import { useEffect, useState } from "react";
import type { Contact } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";
import DataTable, { type Column } from "@/components/DataTable";
import PageTitle from "@/components/PageTitle";
import { useToast } from "@/components/Toast";

interface ContactsResponse {
  contacts: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ContactsPage() {
  const { showToast, showConfirm } = useToast();
  const [data, setData] = useState<ContactsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetcher<ContactsResponse>("/api/contacts");
      if (response) {
        setData(response);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddContact = async (
    contactData: Omit<Contact, "id" | "orgId" | "createdAt" | "updatedAt">,
  ) => {
    console.log("handleAddContact called with:", contactData);
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      console.log("API response status:", response.status);
      console.log("API response ok:", response.ok);

      if (response.ok) {
        console.log("Contact added successfully, refreshing list...");
        showToast("Contact added successfully!", "success");
        await fetchContacts();
        setShowAddModal(false);
      } else {
        const errorData = await response.text();
        console.error("API error response:", errorData);
        showToast("Failed to add contact. Please try again.", "error");
      }
    } catch (error) {
      console.error("Failed to add contact:", error);
      showToast("Failed to add contact. Please try again.", "error");
    }
  };

  const handleEditContact = async (
    id: string,
    contactData: Partial<Contact>,
  ) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        showToast("Contact updated successfully!", "success");
        await fetchContacts();
        setEditingContact(null);
      } else {
        showToast("Failed to update contact. Please try again.", "error");
      }
    } catch (error) {
      console.error("Failed to edit contact:", error);
      showToast("Failed to update contact. Please try again.", "error");
    }
  };

  const handleDeleteContact = async (id: string) => {
    showConfirm("Are you sure you want to delete this contact?", async () => {
      try {
        const response = await fetch(`/api/contacts/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          showToast("Contact deleted successfully!", "success");
          await fetchContacts();
        } else {
          showToast("Failed to delete contact. Please try again.", "error");
        }
      } catch (error) {
        console.error("Failed to delete contact:", error);
        showToast("Failed to delete contact. Please try again.", "error");
      }
    });
  };

  const columns: Column<Contact & { actions?: never }>[] = [
    { key: "name", header: "Name" },
    { key: "phone", header: "Phone" },
    { key: "email", header: "Email" },
    {
      key: "tags",
      header: "Tags",
      render: (r) => (r.tags ?? []).join(", "),
    },
    {
      key: "actions" as keyof (Contact & { actions?: never }),
      header: "Actions",
      render: (r) => (
        <div className="space-x-2">
          <button
            onClick={() => setEditingContact(r)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteContact(r.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageTitle title="Contacts" />

      <div className="flex justify-end items-center">
        <button
          onClick={() => {
            console.log("Opening add contact modal");
            setShowAddModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Contact
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-muted dark:text-dark-text-secondary">Loading…</div>
      ) : (
        <DataTable<Contact>
          data={data?.contacts || []}
          columns={columns}
          pageSize={10}
        />
      )}

      {showAddModal && (
        <AddContactModal
          onClose={() => {
            console.log("Closing add contact modal");
            setShowAddModal(false);
          }}
          onSave={handleAddContact}
        />
      )}

      {editingContact && (
        <EditContactModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onSave={(data) => handleEditContact(editingContact.id, data)}
        />
      )}
    </div>
  );
}

// Add Contact Modal Component
function AddContactModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (
    data: Omit<Contact, "id" | "orgId" | "createdAt" | "updatedAt">,
  ) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tags: [] as string[],
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("AddContactModal: Form submitted with data:", formData);
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-card rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Add Contact
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-dark-text-secondary">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-dark-border rounded-md px-3 py-2 bg-white dark:bg-dark-hover text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-dark-text-secondary">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-dark-border rounded-md px-3 py-2 bg-white dark:bg-dark-hover text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-dark-text-secondary">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-dark-border rounded-md px-3 py-2 bg-white dark:bg-dark-hover text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-dark-text-secondary">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-dark-border rounded-md px-3 py-2 bg-white dark:bg-dark-hover text-gray-900 dark:text-white"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-dark-hover text-gray-700 dark:text-dark-text-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={(e) => {
                console.log("Add Contact button clicked");
                e.preventDefault();
                handleSubmit(e);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Contact Modal Component
function EditContactModal({
  contact,
  onClose,
  onSave,
}: {
  contact: Contact;
  onClose: () => void;
  onSave: (data: Partial<Contact>) => void;
}) {
  const [formData, setFormData] = useState({
    name: contact.name,
    email: contact.email || "",
    phone: contact.phone || "",
    tags: contact.tags,
    notes: contact.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-card rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Edit Contact
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-dark-text-secondary">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-dark-border rounded-md px-3 py-2 bg-white dark:bg-dark-hover text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-dark-border rounded-md px-3 py-2 bg-white dark:bg-dark-hover text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-dark-text-secondary">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-dark-border rounded-md px-3 py-2 bg-white dark:bg-dark-hover text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-dark-text-secondary">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-dark-border rounded-md px-3 py-2 bg-white dark:bg-dark-hover text-gray-900 dark:text-white"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-dark-hover text-gray-700 dark:text-dark-text-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
