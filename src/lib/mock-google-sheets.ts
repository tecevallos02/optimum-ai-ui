import { CallRow } from './types';

// Mock data for testing the UI without real Google Sheets
export const mockCallData: CallRow[] = [
  {
    appointment_id: 'APPT-001',
    name: 'John Smith',
    phone: '+15551234567',
    datetime_iso: '2024-01-15T10:00:00Z',
    window: '9:00-10:00 AM',
    status: 'booked',
    address: '123 Main St, New York, NY',
    notes: 'Customer interested in premium package',
    intent: 'booking'
  },
  {
    appointment_id: 'APPT-002',
    name: 'Jane Doe',
    phone: '+15551234568',
    datetime_iso: '2024-01-15T14:30:00Z',
    window: '2:00-3:00 PM',
    status: 'completed',
    address: '456 Oak Ave, Los Angeles, CA',
    notes: 'Follow up needed for next quarter',
    intent: 'booking'
  },
  {
    appointment_id: 'APPT-003',
    name: 'Mike Johnson',
    phone: '+15551234569',
    datetime_iso: '2024-01-16T09:15:00Z',
    window: '9:00-10:00 AM',
    status: 'cancelled',
    address: '789 Pine St, Chicago, IL',
    notes: 'Customer cancelled due to scheduling conflict',
    intent: 'cancellation'
  },
  {
    appointment_id: 'APPT-004',
    name: 'Sarah Wilson',
    phone: '+15551234570',
    datetime_iso: '2024-01-16T11:00:00Z',
    window: '11:00-12:00 PM',
    status: 'booked',
    address: '321 Elm St, Houston, TX',
    notes: 'Requested quote for enterprise solution',
    intent: 'quote'
  },
  {
    appointment_id: 'APPT-005',
    name: 'David Brown',
    phone: '+15551234571',
    datetime_iso: '2024-01-17T15:45:00Z',
    window: '3:30-4:30 PM',
    status: 'no-show',
    address: '654 Maple Ave, Phoenix, AZ',
    notes: 'Customer did not show up for appointment',
    intent: 'other'
  },
  {
    appointment_id: 'APPT-006',
    name: 'Lisa Garcia',
    phone: '+15551234572',
    datetime_iso: '2024-01-18T10:30:00Z',
    window: '10:00-11:00 AM',
    status: 'booked',
    address: '987 Cedar Blvd, Miami, FL',
    notes: 'Rescheduled from last week',
    intent: 'reschedule'
  }
];

// Mock function to simulate Google Sheets API
export async function mockReadSheetData({
  spreadsheetId,
  range,
  phoneFilter,
  from,
  to,
  statusFilter,
}: {
  spreadsheetId: string;
  range: string;
  phoneFilter?: string;
  from?: string;
  to?: string;
  statusFilter?: string;
}): Promise<CallRow[]> {
  console.log('📊 Using mock Google Sheets data for testing');
  console.log(`📋 Spreadsheet ID: ${spreadsheetId}`);
  console.log(`📊 Range: ${range}`);
  
  let filteredData = [...mockCallData];

  // Apply phone filter
  if (phoneFilter) {
    filteredData = filteredData.filter(call => call.phone === phoneFilter);
  }

  // Apply date filters
  if (from || to) {
    filteredData = filteredData.filter(call => {
      const callDate = new Date(call.datetime_iso);
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;
      return (!fromDate || callDate >= fromDate) && (!toDate || callDate <= toDate);
    });
  }

  // Apply status filter
  if (statusFilter) {
    filteredData = filteredData.filter(call => 
      call.status.toLowerCase().includes(statusFilter.toLowerCase())
    );
  }

  return filteredData;
}

// Mock function to simulate sheet metadata
export async function mockGetSheetMetadata(spreadsheetId: string, dataRange: string) {
  console.log('📊 Using mock sheet metadata');
  return {
    rowCount: mockCallData.length,
    lastModified: new Date().toISOString()
  };
}
