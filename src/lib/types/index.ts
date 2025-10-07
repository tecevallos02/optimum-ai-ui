// path: src/lib/types/index.ts
export type Call = {
  id: string;
  orgId: string;
  startedAt: string;
  durationSec: number;
  status: "completed" | "missed" | "cancelled";
  intent: string[];
  transcriptUrl: string;
  recordingUrl: string;
  createdByAgent: boolean;
  disposition: string;
  contactId: string;
  costSeconds: number;
  tags: string[];
};

export type Appointment = {
  id: string;
  orgId: string;
  googleEventId: string;
  start: string;
  end: string;
  attendee: { name: string; email: string; phone: string };
  status: "confirmed" | "cancelled" | "pending";
};

export type Contact = {
  id: string;
  orgId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  tags: string[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Complaint = {
  id: string;
  orgId: string;
  phoneNumber: string;
  callTimestamp: string;
  description?: string | null;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
};

export type KPI = {
  callsHandled: number;
  bookings: number;
  avgHandleTime: number;
  conversionRate: number; // % of calls that resulted in bookings
  complaints: number; // number of complaints
  estimatedSavings: number;
};

export type SavingsEntry = {
  month: number;
  timeSaved: number;
  costSaved: number;
  planCost: number;
};
export type SavingsSeries = SavingsEntry[];

export type AuditLog = {
  id: string;
  orgId: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
};

/** ✅ Add this so imports like `import type { Report } from "@/lib/types"` work */
export type Report = {
  generatedAt: string; // ISO timestamp
  kpis: KPI;           // snapshot of KPIs
  series: { name: string; value: number }[]; // generic chart series
  notes?: string;
};
