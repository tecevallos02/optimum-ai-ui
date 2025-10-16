import { CallRow } from './types';

export function generateMockDataForCompany(companyId: string, companyName: string) {
  // Generate consistent dates for the last 7 days
  const today = new Date();
  const baseData: CallRow[] = [
    {
      appointment_id: `${companyId}-001`,
      phone: '+1 (555) 123-4567',
      name: 'John Smith',
      address: '123 Main St, New York, NY 10001',
      datetime_iso: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      window: '10:00 AM - 12:00 PM',
      status: 'booked',
      notes: 'Replaced faulty thermostat, system working perfectly',
      intent: 'booking'
    },
    {
      appointment_id: `${companyId}-002`,
      phone: '+1 (555) 234-5678',
      name: 'Sarah Johnson',
      address: '456 Oak Ave, New York, NY 10002',
      datetime_iso: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      window: '2:00 PM - 4:00 PM',
      status: 'booked',
      notes: 'New central air system installed, customer very satisfied',
      intent: 'booking'
    },
    {
      appointment_id: `${companyId}-003`,
      phone: '+1 (555) 345-6789',
      name: 'Mike Davis',
      address: '789 Pine St, New York, NY 10003',
      datetime_iso: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      window: '9:00 AM - 11:00 AM',
      status: 'escalated',
      notes: 'Furnace not heating properly, needs inspection',
      intent: 'inquiry'
    },
    {
      appointment_id: `${companyId}-004`,
      phone: '+1 (555) 456-7890',
      name: 'Lisa Wilson',
      address: '321 Elm St, New York, NY 10004',
      datetime_iso: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      window: '11:00 AM - 1:00 PM',
      status: 'completed',
      notes: 'Annual maintenance completed, all systems running efficiently',
      intent: 'maintenance'
    },
    {
      appointment_id: `${companyId}-005`,
      phone: '+1 (555) 567-8901',
      name: 'Robert Brown',
      address: '654 Maple Dr, New York, NY 10005',
      datetime_iso: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      window: '3:00 PM - 5:00 PM',
      status: 'completed',
      notes: 'Emergency call - AC unit not cooling, fixed refrigerant leak',
      intent: 'emergency'
    },
    {
      appointment_id: `${companyId}-006`,
      phone: '+1 (555) 678-9012',
      name: 'Jennifer Garcia',
      address: '987 Cedar Ln, New York, NY 10006',
      datetime_iso: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      window: '1:00 PM - 3:00 PM',
      status: 'escalated',
      notes: 'Scheduled for duct cleaning and air quality check',
      intent: 'booking'
    },
    {
      appointment_id: `${companyId}-007`,
      phone: '+1 (555) 789-0123',
      name: 'David Martinez',
      address: '147 Birch St, New York, NY 10007',
      datetime_iso: today.toISOString(),
      window: '8:00 AM - 10:00 AM',
      status: 'completed',
      notes: 'Water heater pilot light issue resolved, hot water restored',
      intent: 'repair'
    },
    {
      appointment_id: `${companyId}-008`,
      phone: '+1 (555) 890-1234',
      name: 'Amanda Taylor',
      address: '258 Spruce Ave, New York, NY 10008',
      datetime_iso: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      window: '4:00 PM - 6:00 PM',
      status: 'completed',
      notes: 'Smart thermostat installed, customer trained on usage',
      intent: 'installation'
    },
    {
      appointment_id: `${companyId}-009`,
      phone: '+1 (555) 901-2345',
      name: 'Christopher Lee',
      address: '369 Walnut St, New York, NY 10009',
      datetime_iso: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      window: '12:00 PM - 2:00 PM',
      status: 'escalated',
      notes: 'Regular maintenance check scheduled',
      intent: 'maintenance'
    },
    {
      appointment_id: `${companyId}-010`,
      phone: '+1 (555) 012-3456',
      name: 'Michelle White',
      address: '741 Ash Blvd, New York, NY 10010',
      datetime_iso: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      window: '10:30 AM - 12:30 PM',
      status: 'completed',
      notes: 'Old furnace replaced with high-efficiency model, significant energy savings expected',
      intent: 'replacement'
    }
  ];

  // Customize data based on company
  return baseData.map((call, index) => ({
    ...call,
    appointment_id: `${companyId}-${String(index + 1).padStart(3, '0')}`,
    phone: `+1 (555) ${String(100 + index).padStart(3, '0')}-${String(4000 + index).padStart(4, '0')}`,
    name: call.name,
    address: call.address.replace('New York, NY', getCompanyLocation(companyName)),
    notes: `${call.notes} (${companyName} customer)`,
    intent: getServiceTypeForCompany(companyName, call.intent || '')
  }));
}

function getCompanyLocation(companyName: string): string {
  const locations: { [key: string]: string } = {
    'P&J Air Conditioning': 'Miami, FL',
    'Tech Solutions': 'San Francisco, CA',
    'ACME Corp': 'New York, NY',
    'Cool Air Systems': 'Los Angeles, CA',
    'Arctic Cooling': 'Chicago, IL'
  };
  return locations[companyName] || 'New York, NY';
}

function getServiceTypeForCompany(companyName: string, defaultService: string): string {
  if (companyName.includes('Air Conditioning') || companyName.includes('Cooling')) {
    return defaultService;
  }
  
  const serviceMappings: { [key: string]: string } = {
    'HVAC Repair': 'System Repair',
    'AC Installation': 'Equipment Installation',
    'Heating Repair': 'Heating System Repair',
    'Maintenance': 'System Maintenance',
    'Emergency Repair': 'Emergency Service',
    'Duct Cleaning': 'Ductwork Service',
    'Water Heater Repair': 'Water System Repair',
    'Thermostat Upgrade': 'Control System Upgrade',
    'AC Maintenance': 'System Maintenance',
    'Furnace Replacement': 'Equipment Replacement'
  };
  
  return serviceMappings[defaultService] || defaultService;
}

export function generateMockRetellDataForCompany(companyId: string) {
  return {
    totalCalls: Math.floor(Math.random() * 50) + 20,
    totalTimeSaved: Math.floor(Math.random() * 200) + 100,
    totalCost: Math.floor(Math.random() * 5000) + 2000,
    averageCallDuration: Math.floor(Math.random() * 300) + 120,
    averageTimeSaved: Math.floor(Math.random() * 10) + 5,
    callsByStatus: {
      completed: Math.floor(Math.random() * 30) + 15,
      failed: Math.floor(Math.random() * 5) + 2,
      cancelled: Math.floor(Math.random() * 3) + 1
    },
    recentCalls: [
      {
        id: `${companyId}-call-001`,
        phone: '+1 (555) 123-4567',
        duration: 180,
        status: 'booked',
        timestamp: new Date().toISOString(),
        workflowId: `workflow-${companyId}`
      },
      {
        id: `${companyId}-call-002`,
        phone: '+1 (555) 234-5678',
        duration: 240,
        status: 'booked',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        workflowId: `workflow-${companyId}`
      }
    ]
  };
}
