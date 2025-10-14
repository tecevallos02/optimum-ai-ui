import { CompanyRetell } from '@prisma/client';

export interface RetellCallData {
  callId: string;
  workflowId: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  status: 'completed' | 'failed' | 'cancelled';
  timeSaved: number; // in seconds
  cost: number; // in dollars
  transcript?: string;
  summary?: string;
}

export interface RetellAnalytics {
  totalCalls: number;
  totalTimeSaved: number; // in seconds
  totalCost: number; // in dollars
  averageCallDuration: number; // in seconds
  averageTimeSaved: number; // in seconds
  callsByStatus: {
    completed: number;
    failed: number;
    cancelled: number;
  };
  callsOverTime: Array<{
    date: string;
    calls: number;
    timeSaved: number;
  }>;
}

// Get Retell client for a specific company
export function getRetellClient(companyRetell: CompanyRetell) {
  return {
    apiKey: companyRetell.apiKey,
    workflowId: companyRetell.workflowId,
    baseUrl: 'https://api.retellai.com/v2', // Retell API base URL
  };
}

// Fetch call data from Retell API
export async function fetchRetellCalls(
  companyRetell: CompanyRetell,
  options: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}
): Promise<RetellCallData[]> {
  const client = getRetellClient(companyRetell);
  
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (options.startDate) params.set('start_date', options.startDate);
    if (options.endDate) params.set('end_date', options.endDate);
    if (options.limit) params.set('limit', options.limit.toString());
    
    const response = await fetch(`${client.baseUrl}/calls?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${client.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Retell API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform Retell API response to our format
    return data.calls?.map((call: any) => ({
      callId: call.call_id,
      workflowId: call.workflow_id,
      customerPhone: call.customer_phone,
      startTime: call.start_time,
      endTime: call.end_time,
      duration: call.duration || 0,
      status: call.status || 'completed',
      timeSaved: call.time_saved || 0,
      cost: call.cost || 0,
      transcript: call.transcript,
      summary: call.summary,
    })) || [];
  } catch (error) {
    console.error('Error fetching Retell calls:', error);
    return [];
  }
}

// Calculate analytics from Retell call data
export function calculateRetellAnalytics(calls: RetellCallData[]): RetellAnalytics {
  const totalCalls = calls.length;
  const totalTimeSaved = calls.reduce((sum, call) => sum + call.timeSaved, 0);
  const totalCost = calls.reduce((sum, call) => sum + call.cost, 0);
  const averageCallDuration = totalCalls > 0 ? calls.reduce((sum, call) => sum + call.duration, 0) / totalCalls : 0;
  const averageTimeSaved = totalCalls > 0 ? totalTimeSaved / totalCalls : 0;

  const callsByStatus = calls.reduce((acc, call) => {
    acc[call.status] = (acc[call.status] || 0) + 1;
    return acc;
  }, { completed: 0, failed: 0, cancelled: 0 } as Record<string, number>);

  // Group calls by date for time series
  const callsByDate = calls.reduce((acc, call) => {
    const date = new Date(call.startTime).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { calls: 0, timeSaved: 0 };
    }
    acc[date].calls += 1;
    acc[date].timeSaved += call.timeSaved;
    return acc;
  }, {} as Record<string, { calls: number; timeSaved: number }>);

  const callsOverTime = Object.entries(callsByDate)
    .map(([date, data]) => ({
      date,
      calls: data.calls,
      timeSaved: data.timeSaved,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    totalCalls,
    totalTimeSaved,
    totalCost,
    averageCallDuration,
    averageTimeSaved,
    callsByStatus,
    callsOverTime,
  };
}

// Mock data for development/testing
export function getMockRetellData(): RetellCallData[] {
  const now = new Date();
  const mockCalls: RetellCallData[] = [];
  
  // Generate mock data for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const callsPerDay = Math.floor(Math.random() * 5) + 1; // 1-5 calls per day
    
    for (let j = 0; j < callsPerDay; j++) {
      const startTime = new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 300) + 60; // 1-6 minutes
      const endTime = new Date(startTime.getTime() + duration * 1000);
      const timeSaved = Math.floor(duration * 0.7); // Assume 70% time saved
      const cost = duration * 0.02; // $0.02 per second
      
      mockCalls.push({
        callId: `mock-call-${i}-${j}`,
        workflowId: 'mock-workflow',
        customerPhone: `+1555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        status: Math.random() > 0.1 ? 'completed' : 'failed',
        timeSaved,
        cost,
        transcript: `Mock transcript for call ${i}-${j}`,
        summary: `Mock summary for call ${i}-${j}`,
      });
    }
  }
  
  return mockCalls.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}
