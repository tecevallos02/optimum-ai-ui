import { google } from 'googleapis';
import { CallRow } from './types';

// Initialize Google Sheets API
function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

// Derive intent from status/notes
export function deriveIntent(status: string, notes: string): string {
  const text = `${status} ${notes}`.toLowerCase();
  
  if (text.includes('book') || text.includes('schedule')) {
    return 'booking';
  }
  if (text.includes('reschedule')) {
    return 'reschedule';
  }
  if (text.includes('cancel')) {
    return 'cancellation';
  }
  if (text.includes('quote') || text.includes('estimate')) {
    return 'quote';
  }
  
  return 'other';
}

// Normalize phone number to E.164 format
export function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 1 and is 11 digits, it's already E.164
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // If it's 10 digits, assume US number and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If it already starts with +, return as is
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Default: add +1 for US numbers
  return `+1${digits}`;
}

// Read and normalize data from Google Sheets
export async function readSheetData(
  spreadsheetId: string,
  dataRange: string,
  phoneFilter?: string
): Promise<CallRow[]> {
  try {
    const sheets = getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: dataRange,
    });

    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return [];
    }

    // Skip header row and normalize data
    const dataRows = rows.slice(1);
    
    const callRows: CallRow[] = dataRows
      .map((row, index) => {
        // Ensure we have at least 8 columns (A:H)
        const normalizedRow = Array.from({ length: 8 }, (_, i) => row[i] || '');
        
        const [
          appointment_id,
          name,
          phone,
          datetime_iso,
          window,
          status,
          address,
          notes
        ] = normalizedRow;

        // Skip empty rows
        if (!appointment_id && !name && !phone) {
          return null;
        }

        const normalizedPhone = normalizePhone(phone);
        
        // Apply phone filter if provided
        if (phoneFilter && normalizedPhone !== phoneFilter) {
          return null;
        }

        // Derive intent if not provided
        const intent = deriveIntent(status, notes);

        return {
          appointment_id: appointment_id.trim(),
          name: name.trim(),
          phone: normalizedPhone,
          datetime_iso: datetime_iso.trim(),
          window: window.trim(),
          status: status.trim(),
          address: address.trim(),
          notes: notes.trim(),
          intent: intent || 'other'
        };
      })
      .filter((row) => row !== null) as CallRow[];

    return callRows;
  } catch (error) {
    console.error('Error reading Google Sheets data:', error);
    throw new Error('Failed to read sheet data');
  }
}

// Get sheet metadata for caching
export async function getSheetMetadata(spreadsheetId: string, dataRange: string) {
  try {
    const sheets = getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: dataRange,
    });

    const rows = response.data.values || [];
    return {
      rowCount: rows.length - 1, // Exclude header
      lastModified: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting sheet metadata:', error);
    throw new Error('Failed to get sheet metadata');
  }
}
