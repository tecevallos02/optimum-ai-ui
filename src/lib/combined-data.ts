import { readSheetData } from "./google-sheets";
import {
  fetchRetellCalls,
  calculateRetellAnalytics,
  getMockRetellData,
  RetellCallData,
  RetellAnalytics,
} from "./retell";
import { CallRow } from "./types";

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
  } = {},
): Promise<CombinedCallData> {
  try {
    // Import Prisma client
    const { prisma } = await import("./prisma");

    // Get company configuration
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        sheets: true,
        phones: true,
        retell: true,
      },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    // Get Google Sheets data
    const companySheet = company.sheets[0];
    let sheetAppointments: CallRow[] = [];

    if (companySheet) {
      sheetAppointments = await readSheetData({
        spreadsheetId: companySheet.spreadsheetId,
        range: companySheet.dataRange,
        phoneFilter: options.phone,
        from: options.startDate,
        to: options.endDate,
        companyId: companyId,
      });
    }

    // Get database appointments
    let dbAppointments: any[] = [];
    try {
      // Get or create organization for this company
      let organization = await prisma.organization.findFirst({
        where: { name: company.name }
      });

      if (!organization) {
        // Create organization if it doesn't exist
        organization = await prisma.organization.create({
          data: {
            name: company.name,
          },
        });
        console.log("✅ Created organization for KPIs:", organization.id);
      }

      // Get appointments from database
      dbAppointments = await prisma.appointment.findMany({
        where: {
          orgId: organization.id,
        },
        orderBy: {
          startsAt: 'asc',
        },
      });

      console.log("🔍 Database appointments for KPIs:", {
        companyId: companyId,
        orgId: organization.id,
        dbAppointmentsCount: dbAppointments.length,
        firstDbAppointmentId: dbAppointments[0]?.id || "none"
      });
    } catch (dbError) {
      console.log("⚠️ Could not read database appointments:", dbError);
    }

    // Convert database appointments to CallRow format
    const dbAppointmentsFormatted = dbAppointments.map((apt) => ({
      appointment_id: apt.id,
      name: apt.customerName,
      phone: apt.customerPhone || "",
      datetime_iso: apt.startsAt.toISOString(),
      window: "1 hour", // Default window for database appointments
      status: apt.status.toLowerCase(),
      address: "Manual Entry", // Default address for database appointments
      notes: apt.notes || apt.description || "",
      intent: "booking", // Default intent for database appointments
    }));

    // Combine database and sheet appointments, removing duplicates
    const allAppointments = [...dbAppointmentsFormatted, ...sheetAppointments];
    const appointments = allAppointments.filter((apt, index, self) => 
      index === self.findIndex(a => a.appointment_id === apt.appointment_id)
    );

    console.log("🔍 Combined appointments for KPIs:", {
      sheetAppointmentsCount: sheetAppointments.length,
      dbAppointmentsCount: dbAppointmentsFormatted.length,
      totalAppointmentsCount: appointments.length,
      firstAppointmentId: appointments[0]?.appointment_id || "none"
    });

    // Get Retell data
    let callLogs: RetellCallData[] = [];
    let retellAnalytics: RetellAnalytics;

    if (company.retell && company.retell.length > 0) {
      const companyRetell = company.retell[0];

      if (options.useMockRetell) {
        // Use mock data for development
        callLogs = getMockRetellData(companyId);
      } else {
        try {
          // Fetch real data from Retell API
          callLogs = await fetchRetellCalls(companyRetell, {
            startDate: options.startDate,
            endDate: options.endDate,
          });
        } catch (retellError) {
          console.log("⚠️ Retell API error, using mock data:", retellError);
          // Fall back to mock data if Retell API fails
          callLogs = getMockRetellData(companyId);
        }
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
    console.error("Error getting combined data:", error);
    throw error;
  }
}

function calculateCombinedKPIs(
  appointments: CallRow[],
  retellAnalytics: RetellAnalytics,
): CombinedKPIs {
  // Use Retell data for the main KPIs
  const callsHandled = retellAnalytics.totalCalls;
  const bookings = appointments.filter(
    (app) =>
      app.status.toLowerCase() === "booked" ||
      app.status.toLowerCase() === "scheduled" ||
      app.status.toLowerCase() === "confirmed",
  ).length;
  const conversionRate =
    callsHandled > 0 ? Math.round((bookings / callsHandled) * 10000) / 100 : 0;
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
