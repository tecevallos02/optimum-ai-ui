'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetcher } from '@/lib/fetcher';

interface Company {
  companyId: string;
  name: string;
  phones: string[];
}

export default function CompanyPhoneSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedPhone, setSelectedPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    // Initialize from URL params
    const companyId = searchParams.get('companyId');
    const phone = searchParams.get('phone');
    
    if (companyId) {
      setSelectedCompanyId(companyId);
    }
    if (phone) {
      setSelectedPhone(phone);
    }
  }, [searchParams]);

  const fetchCompanies = async () => {
    try {
      const data = await fetcher<{ companies: Company[] }>('/api/tenants');
      setCompanies(data?.companies || []);
      
      // Set default selection if none in URL
      if (!searchParams.get('companyId') && data?.companies && data.companies.length > 0) {
        setSelectedCompanyId(data.companies[0].companyId);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedPhone(''); // Reset phone when company changes
    
    // Update URL
    const params = new URLSearchParams(searchParams);
    params.set('companyId', companyId);
    params.delete('phone'); // Remove phone when company changes
    router.push(`?${params.toString()}`);
  };

  const handlePhoneChange = (phone: string) => {
    setSelectedPhone(phone);
    
    // Update URL
    const params = new URLSearchParams(searchParams);
    if (phone) {
      params.set('phone', phone);
    } else {
      params.delete('phone');
    }
    router.push(`?${params.toString()}`);
  };

  const selectedCompany = companies.find(c => c.companyId === selectedCompanyId);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Company Selector */}
      <div className="flex items-center space-x-2">
        <label htmlFor="company-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Company:
        </label>
        <select
          id="company-select"
          value={selectedCompanyId}
          onChange={(e) => handleCompanyChange(e.target.value)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {companies.map((company) => (
            <option key={company.companyId} value={company.companyId}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {/* Phone Selector */}
      {selectedCompany && selectedCompany.phones.length > 0 && (
        <div className="flex items-center space-x-2">
          <label htmlFor="phone-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone:
          </label>
          <select
            id="phone-select"
            value={selectedPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Phones</option>
            {selectedCompany.phones.map((phone) => (
              <option key={phone} value={phone}>
                {phone}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
