'use client';

import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/fetcher';

interface PhoneSelectorProps {
  onPhoneChange: (phone: string | null) => void;
}

export default function PhoneSelector({ onPhoneChange }: PhoneSelectorProps) {
  const [phones, setPhones] = useState<string[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPhones = async () => {
      try {
        const data = await fetcher<{ phones: string[] }>('/api/me/company');
        setPhones(data?.phones || []);
        
        // Auto-select if only one phone
        if (data?.phones && data.phones.length === 1) {
          setSelectedPhone(data.phones[0]);
          onPhoneChange(data.phones[0]);
        }
      } catch (error) {
        console.error('Error fetching phones:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPhones();
  }, [onPhoneChange]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const phone = e.target.value === 'all' ? null : e.target.value;
    setSelectedPhone(phone);
    onPhoneChange(phone);
  };

  if (isLoading) {
    return (
      <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    );
  }

  // Don't show selector if only one phone or no phones
  if (phones.length <= 1) {
    return null;
  }

  return (
    <select
      value={selectedPhone || 'all'}
      onChange={handlePhoneChange}
      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
    >
      <option value="all">All Phones</option>
      {phones.map(phone => (
        <option key={phone} value={phone}>
          {phone}
        </option>
      ))}
    </select>
  );
}
