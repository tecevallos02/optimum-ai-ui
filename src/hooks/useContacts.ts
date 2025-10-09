'use client';

import { useState } from 'react';
import useSWR from 'swr';
import type { Contact } from '@/lib/types';

interface CreateContactData {
  fullName: string;
  email?: string;
  phone?: string;
  notes?: string;
  source?: string;
}

interface DuplicateInfo {
  matchId: string;
  matchFields: ('email' | 'phone' | 'name')[];
}

export function useContacts() {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch contacts with SWR for caching
  const { data: contactsData, mutate } = useSWR<{ contacts: Contact[] }>(
    '/api/contacts',
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      return response.json();
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const contacts = contactsData?.contacts || [];

  const createContact = async (contactData: CreateContactData): Promise<{ success: boolean; duplicate?: DuplicateInfo }> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactData.fullName,
          email: contactData.email,
          phone: contactData.phone,
          notes: contactData.notes,
          source: contactData.source,
        }),
      });

      if (response.status === 409) {
        // Duplicate found
        const errorData = await response.json();
        return {
          success: false,
          duplicate: {
            matchId: errorData.matchId,
            matchFields: ['email', 'phone', 'name'] // We'll determine this from the API response
          }
        };
      }

      if (!response.ok) {
        throw new Error('Failed to create contact');
      }

      const newContact = await response.json();
      
      // Update the cache
      mutate(
        (current) => {
          if (!current) return { contacts: [newContact] };
          return {
            contacts: [...current.contacts, newContact]
          };
        },
        false
      );

      return { success: true };
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateContact = async (contactId: string, contactData: CreateContactData): Promise<Contact> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactData.fullName,
          email: contactData.email,
          phone: contactData.phone,
          notes: contactData.notes,
          source: contactData.source,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update contact');
      }

      const updatedContact = await response.json();
      
      // Update the cache
      mutate(
        (current) => {
          if (!current) return { contacts: [updatedContact] };
          return {
            contacts: current.contacts.map(contact => 
              contact.id === contactId ? updatedContact : contact
            )
          };
        },
        false
      );

      return updatedContact;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkDuplicate = async (contactData: CreateContactData): Promise<DuplicateInfo | null> => {
    try {
      const response = await fetch('/api/contacts/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: contactData.fullName,
          email: contactData.email,
          phone: contactData.phone,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check for duplicates');
      }

      const result = await response.json();
      return result.matchId ? result : null;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return null;
    }
  };

  return {
    contacts,
    isLoading,
    createContact,
    updateContact,
    checkDuplicate,
    mutate
  };
}
