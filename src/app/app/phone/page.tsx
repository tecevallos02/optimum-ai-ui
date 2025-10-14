'use client';

import { useState } from 'react';
import PageTitle from '@/components/PageTitle';
import PhoneNumberManager from '@/components/PhoneNumberManager';
import AiReceptionistManager from '@/components/AiReceptionistManager';

export default function PhonePage() {
  const [activeTab, setActiveTab] = useState<'numbers' | 'ai'>('numbers');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageTitle 
        title="Phone & AI Receptionist" 
        subtitle="Manage phone numbers and AI receptionist configurations for automated call handling"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('numbers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'numbers'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Phone Numbers
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'ai'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              AI Receptionist
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'numbers' && (
            <div>
              <PhoneNumberManager />
            </div>
          )}
          
          {activeTab === 'ai' && (
            <div>
              <AiReceptionistManager />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
