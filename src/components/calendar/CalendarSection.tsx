'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Appointment } from '@/lib/types';
import CalendarGrid from './CalendarGrid';
import ListAppointments from './ListAppointments';
import NewAppointmentModal from './NewAppointmentModal';
import Legend from '@/components/ui/Legend';
import DuplicateContactModal from '@/components/contacts/DuplicateContactModal';
import { useContacts } from '@/hooks/useContacts';

interface CalendarSectionProps {
  appointments: Appointment[];
  onAppointmentUpdate: (appointment: Appointment) => void;
  onAppointmentDelete: (id: string) => void;
  onAppointmentCreate: (appointment: Appointment) => void;
  onRefresh?: () => void;
}

type ViewType = 'list' | 'calendar';

export default function CalendarSection({
  appointments,
  onAppointmentUpdate,
  onAppointmentDelete,
  onAppointmentCreate,
  onRefresh
}: CalendarSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewType>('list');
  const [showNewModal, setShowNewModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    search: ''
  });

  // Contact functionality
  const { createContact, updateContact } = useContacts();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    appointment: Appointment;
    matchId: string;
    matchFields: ('email' | 'phone' | 'name')[];
  } | null>(null);

  // Initialize view from URL params
  useEffect(() => {
    const viewParam = searchParams.get('view') as ViewType;
    if (viewParam === 'list' || viewParam === 'calendar') {
      setView(viewParam);
    } else {
      // Check localStorage for saved preference
      const savedView = localStorage.getItem('calendar-view') as ViewType;
      if (savedView === 'list' || savedView === 'calendar') {
        setView(savedView);
      }
    }
  }, [searchParams]);

  // Update URL when view changes
  const handleViewChange = (newView: ViewType) => {
    setView(newView);
    localStorage.setItem('calendar-view', newView);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Filter appointments based on current filters
  const filteredAppointments = appointments.filter(appointment => {
    if (filters.status && appointment.status !== filters.status) return false;
    if (filters.source && appointment.source !== filters.source) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        appointment.title.toLowerCase().includes(searchLower) ||
        appointment.customerName.toLowerCase().includes(searchLower) ||
        appointment.customerPhone?.toLowerCase().includes(searchLower) ||
        appointment.customerEmail?.toLowerCase().includes(searchLower) ||
        appointment.notes?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleNewAppointment = (appointment: Omit<Appointment, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>) => {
    onAppointmentCreate(appointment as Appointment);
    setShowNewModal(false);
  };

  const handleSelectSlot = (start: Date, end: Date) => {
    setShowNewModal(true);
  };

  const handleAddContact = async (appointment: Appointment) => {
    const contactData = {
      fullName: appointment.customerName,
      email: appointment.customerEmail || undefined,
      phone: appointment.customerPhone || undefined,
      notes: appointment.description || undefined,
      source: 'calendar'
    };

    try {
      const result = await createContact(contactData);
      
      if (result.success) {
        // Show success toast
        alert('Contact added successfully!');
      } else if (result.duplicate) {
        // Show duplicate modal
        setDuplicateInfo({
          appointment,
          matchId: result.duplicate.matchId,
          matchFields: result.duplicate.matchFields
        });
        setShowDuplicateModal(true);
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact. Please try again.');
    }
  };

  const handleDuplicateAddContact = async (contactData: any) => {
    try {
      await createContact(contactData);
      alert('Contact added successfully!');
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact. Please try again.');
    }
  };

  const handleDuplicateReplaceContact = async (contactId: string, contactData: any) => {
    try {
      await updateContact(contactId, contactData);
      alert('Contact replaced successfully!');
    } catch (error) {
      console.error('Error replacing contact:', error);
      alert('Failed to replace contact. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with View Toggle and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
          
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewChange('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              List
            </button>
            <button
              onClick={() => handleViewChange('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                view === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
              title="Refresh appointments"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Appointment
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search appointments..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="sm:w-48">
            <select
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sources</option>
              <option value="web">Web</option>
              <option value="phone">Phone</option>
              <option value="agent">Agent</option>
              <option value="imported">Imported</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Legend />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        {view === 'list' ? (
          <ListAppointments
            appointments={filteredAppointments}
            onAppointmentUpdate={onAppointmentUpdate}
            onAppointmentDelete={onAppointmentDelete}
            onAddContact={handleAddContact}
          />
        ) : (
          <CalendarGrid
            appointments={filteredAppointments}
            onAppointmentUpdate={onAppointmentUpdate}
            onAppointmentDelete={onAppointmentDelete}
            onSelectSlot={handleSelectSlot}
            onAddContact={handleAddContact}
          />
        )}
      </div>

      {/* New Appointment Modal */}
      {showNewModal && (
        <NewAppointmentModal
          onClose={() => setShowNewModal(false)}
          onSave={handleNewAppointment}
        />
      )}

      {/* Duplicate Contact Modal */}
      {showDuplicateModal && duplicateInfo && (
        <DuplicateContactModal
          appointment={duplicateInfo.appointment}
          matchId={duplicateInfo.matchId}
          matchFields={duplicateInfo.matchFields}
          onClose={() => setShowDuplicateModal(false)}
          onAddContact={handleDuplicateAddContact}
          onReplaceContact={handleDuplicateReplaceContact}
        />
      )}
    </div>
  );
}
