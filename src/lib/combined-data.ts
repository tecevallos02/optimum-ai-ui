import { readSheetData } from './google-sheets';
import { fetchRetellCalls, calculateRetellAnalytics, getMockRetellData, RetellCallData, RetellAnalytics } from './retell';
import { CallRow } from './types';

export interface CombinedKPIs {
  // From Google Sheets (appointments)
  callsHandled: number;
  bookings: number;
  avgHandleTime: number;
  conversionRate: number;
  callsEscalated: number;
  estimatedSavings: number;
  
  // From Retell (call analytics)
  totalCalls: number;
  totalTimeSaved: number; // in seconds
  totalCost: number; // in dollars
  averageCallDuration: number; // in seconds
  averageTimeSaved: number; // in seconds
}

export interface CombinedCallData {
  // Google Sheets data (appointments)
  appointments: CallRow[];
  
  // Retell data (call logs)
  callLogs: RetellCallData[];
  
  // Combined analytics
  kpis: CombinedKPIs;
  retellAnalytics: RetellAnalytics;
}

export async function getCombinedData(
  companyId: string,
  options: {
    phone?: string;
    startDate?: string;
    endDate?: string;
    useMockRetell?: boolean;
  } = {}
): Promise<CombinedCallData> {
  try {
    // Import Prisma client
    const { prisma } = await import('./prisma');
    
    // Get company configuration
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        sheets: true,
        phones: true,
        retell: true,
      }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    // Get Google Sheets data
    const companySheet = company.sheets[0];
    let appointments: CallRow[] = [];
    
    if (companySheet) {
      appointments = await readSheetData({
        spreadsheetId: companySheet.spreadsheetId,
        range: companySheet.dataRange,
        phoneFilter: options.phone,
        from: options.startDate,
        to: options.endDate,
      });
    }

    // Get Retell data
    let callLogs: RetellCallData[] = [];
    let retellAnalytics: RetellAnalytics;
    
    if (company.retell && company.retell.length > 0) {
      const companyRetell = company.retell[0];
      
      if (options.useMockRetell) {
        // Use mock data for development
        callLogs = getMockRetellData();
      } else {
        // Fetch real data from Retell API
        callLogs = await fetchRetellCalls(companyRetell, {
          startDate: options.startDate,
          endDate: options.endDate,
        });
      }
      
      retellAnalytics = calculateRetellAnalytics(callLogs);
    } else {
      // No Retell configuration, use empty data
      callLogs = [];
      retellAnalytics = {
        totalCalls: 0,
        totalTimeSaved: 0,
        totalCost: 0,
        averageCallDuration: 0,
        averageTimeSaved: 0,
        callsByStatus: { completed: 0, failed: 0, cancelled: 0 },
        callsOverTime: [],
      };
    }

    // Calculate combined KPIs
    const kpis = calculateCombinedKPIs(appointments, retellAnalytics);

    return {
      appointments,
      callLogs,
      kpis,
      retellAnalytics,
    };
  } catch (error) {
    console.error('Error getting combined data:', error);
    throw error;
  }
}

function calculateCombinedKPIs(appointments: CallRow[], retellAnalytics: RetellAnalytics): CombinedKPIs {
  // Use Retell data for the main KPIs
  const callsHandled = retellAnalytics.totalCalls;
  const bookings = appointments.filter(app => 
    app.status.toLowerCase() === 'booked' || 
    app.status.toLowerCase() === 'scheduled' ||
    app.status.toLowerCase() === 'confirmed'
  ).length;
  const conversionRate = callsHandled > 0 ? Math.round((bookings / callsHandled) * 10000) / 100 : 0;
  const callsEscalated = retellAnalytics.callsByStatus.failed; // Use failed calls as escalated
  
  // Use Retell data for handle time and savings
  const avgHandleTime = retellAnalytics.averageCallDuration;
  const estimatedSavings = retellAnalytics.totalTimeSaved * 0.05; // $0.05 per second saved

  return {
    // Main KPIs from Retell data
    callsHandled,
    bookings,
    avgHandleTime,
    conversionRate,
    callsEscalated,
    estimatedSavings,
    
    // Retell data (for reference, but not displayed)
    totalCalls: retellAnalytics.totalCalls,
    totalTimeSaved: retellAnalytics.totalTimeSaved,
    totalCost: retellAnalytics.totalCost,
    averageCallDuration: retellAnalytics.averageCallDuration,
    averageTimeSaved: retellAnalytics.averageTimeSaved,
  };
}
