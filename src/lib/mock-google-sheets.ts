import { CallRow } from "./types";
import { subDays } from "date-fns";

// Generate realistic mock data for screenshots
// Total: 156 calls over 30 days, Handled: 142, Booked: 68, Conversion: 47.9%
function generateMockCallData(): CallRow[] {
  const calls: CallRow[] = [];
  const today = new Date();
  const names = [
    "John Smith", "Jane Doe", "Mike Johnson", "Sarah Wilson", "David Brown",
    "Lisa Garcia", "Tom Anderson", "Emma Martinez", "Chris Taylor", "Amy White",
    "Robert Lee", "Jennifer Moore", "Michael Davis", "Patricia Jackson", "James Williams"
  ];

  // Distribution for last 7 days (shown in chart)
  const last7Days = [18, 22, 19, 25, 21, 20, 17]; // Total: 142 calls handled

  // Add calls for last 7 days
  for (let i = 0; i < 7; i++) {
    const dayCallCount = last7Days[i];
    const date = subDays(today, 6 - i);

    for (let j = 0; j < dayCallCount; j++) {
      const isBooked = j < Math.floor(dayCallCount * 0.479); // 47.9% conversion
      const status = isBooked ? "booked" : (j % 5 === 0 ? "escalated" : "completed");
      const intent = isBooked ? "booking" : (j % 3 === 0 ? "quote" : j % 3 === 1 ? "information" : "other");

      calls.push({
        appointment_id: `APPT-${String(calls.length + 1).padStart(4, "0")}`,
        name: names[j % names.length],
        phone: `+1555${String(1000000 + calls.length).slice(1)}`,
        datetime_iso: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9 + (j % 9), (j * 15) % 60).toISOString(),
        window: `${9 + (j % 9)}:00-${10 + (j % 9)}:00 ${j % 9 < 3 ? 'AM' : 'PM'}`,
        status,
        address: `${100 + j} Main St, New York, NY 10001`,
        notes: isBooked ? "Successfully booked appointment" : "Handled inquiry professionally",
        intent,
      });
    }
  }

  // Add older calls for 30-day period (14 more calls to reach 156 total)
  for (let i = 7; i < 30; i++) {
    const dayCallCount = i % 3 === 0 ? 1 : 0; // Sparse older data
    if (dayCallCount > 0) {
      const date = subDays(today, 30 - i);
      calls.push({
        appointment_id: `APPT-${String(calls.length + 1).padStart(4, "0")}`,
        name: names[i % names.length],
        phone: `+1555${String(1000000 + calls.length).slice(1)}`,
        datetime_iso: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0).toISOString(),
        window: "10:00-11:00 AM",
        status: i % 2 === 0 ? "booked" : "completed",
        address: `${100 + i} Oak Ave, Brooklyn, NY 11201`,
        notes: "Customer inquiry handled",
        intent: i % 2 === 0 ? "booking" : "information",
      });
    }
  }

  return calls;
}

// Mock data for testing the UI without real Google Sheets
const baseMockData: CallRow[] = generateMockCallData();

// Generate company-specific mock data
function getCompanyMockData(companyId: string): CallRow[] {
  const companyData = {
    "acme-corp": {
      prefix: "ACME",
      phone: "+15551112222",
      customers: [
        "John Smith",
        "Jane Doe",
        "Mike Johnson",
        "Sarah Wilson",
        "David Brown",
      ],
    },
    "tech-solutions": {
      prefix: "TECH",
      phone: "+15553334444",
      customers: [
        "Alice Johnson",
        "Bob Wilson",
        "Carol Davis",
        "David Miller",
        "Eva Garcia",
      ],
    },
    "global-services": {
      prefix: "GLOBAL",
      phone: "+15555556666",
      customers: [
        "Frank Smith",
        "Grace Lee",
        "Henry Chen",
        "Ivy Rodriguez",
        "Jack Taylor",
      ],
    },
  };

  const company =
    companyData[companyId as keyof typeof companyData] ||
    companyData["acme-corp"];

  return baseMockData.map((call, index) => ({
    ...call,
    appointment_id: `${company.prefix}-${String(index + 1).padStart(3, "0")}`,
    phone: company.phone,
    name:
      company.customers[index % company.customers.length] ||
      `Customer ${index + 1}`,
    address: call.address.replace(
      "New York, NY",
      companyId === "acme-corp"
        ? "New York, NY"
        : companyId === "tech-solutions"
          ? "San Francisco, CA"
          : "London, UK",
    ),
    notes: `${call.notes} (${company.prefix} customer)`,
  }));
}

// Mock function to simulate Google Sheets API
export async function mockReadSheetData({
  spreadsheetId,
  range,
  phoneFilter,
  from,
  to,
  statusFilter,
  companyId,
}: {
  spreadsheetId: string;
  range: string;
  phoneFilter?: string;
  from?: string;
  to?: string;
  statusFilter?: string;
  companyId?: string;
}): Promise<CallRow[]> {
  // Check if this is a mock sheet ID (created by admin panel)
  let actualCompanyId = companyId;
  if (spreadsheetId.startsWith("mock-sheet-")) {
    actualCompanyId = spreadsheetId.replace("mock-sheet-", "");
  }

  // Get company-specific mock data
  const companyData = actualCompanyId
    ? getCompanyMockData(actualCompanyId)
    : baseMockData;
  let filteredData = [...companyData];

  // Apply phone filter
  if (phoneFilter) {
    filteredData = filteredData.filter((call) => call.phone === phoneFilter);
  }

  // Apply date filters
  if (from || to) {
    filteredData = filteredData.filter((call) => {
      const callDate = new Date(call.datetime_iso);
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;
      return (
        (!fromDate || callDate >= fromDate) && (!toDate || callDate <= toDate)
      );
    });
  }

  // Apply status filter
  if (statusFilter) {
    filteredData = filteredData.filter((call) =>
      call.status.toLowerCase().includes(statusFilter.toLowerCase()),
    );
  }

  return filteredData;
}

// Mock function to simulate sheet metadata
export async function mockGetSheetMetadata(
  spreadsheetId: string,
  dataRange: string,
) {
  return {
    rowCount: baseMockData.length,
    lastModified: new Date().toISOString(),
  };
}
