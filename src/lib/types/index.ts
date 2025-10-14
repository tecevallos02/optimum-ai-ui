// path: src/lib/types/index.ts
import { Decimal } from '@prisma/client/runtime/library';
import { JsonValue } from '@prisma/client/runtime/library';

export type CallRow = {
  appointment_id: string;
  name: string;
  phone: string;        // E.164
  datetime_iso: string; // ISO 8601
  window: string;
  status: string;
  address: string;
  notes: string;
  intent?: string;      // derive if missing
};

export type Appointment = {
  id: string;
  orgId: string;
  googleEventId?: string;
  title: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  startsAt: string;
  endsAt: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'canceled' | 'no_show';
  source?: 'web' | 'phone' | 'agent' | 'imported' | 'AI_RECEPTIONIST';
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Company = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CompanySheet = {
  id: string;
  companyId: string;
  spreadsheetId: string;
  dataRange: string;
  createdAt: string;
  updatedAt: string;
};

export type CompanyPhone = {
  id: string;
  companyId: string;
  e164: string;
  createdAt: string;
};

export type Contact = {
  id: string;
  orgId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  tags: string[];
  notes?: string | null;
  source?: string | null;
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
  callsEscalated: number; // number of calls escalated to human
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
