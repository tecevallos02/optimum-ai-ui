// path: src/lib/types/index.ts
import { Decimal } from '@prisma/client/runtime/library';
import { JsonValue } from '@prisma/client/runtime/library';

export type Call = {
  id: string;
  orgId: string;
  phoneNumberId?: string | null;
  externalId?: string | null;
  fromNumber: string;
  toNumber: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: 'RINGING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'BUSY' | 'NO_ANSWER' | 'CANCELLED';
  duration: number;
  recordingUrl?: string | null;
  transcript?: string | null;
  transcriptUrl?: string | null;
  intent: string[];
  disposition?: string | null;
  escalated: boolean;
  escalatedTo?: string | null;
  cost?: Decimal | null;
  tags: string[];
  metadata?: JsonValue;
  startedAt: string;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
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

export type PhoneNumber = {
  id: string;
  orgId: string;
  phoneNumber: string;
  friendlyName?: string;
  provider: string;
  providerId?: string;
  isActive: boolean;
  isPrimary: boolean;
  capabilities: string[];
  webhookUrl?: string;
  retellAgentId?: string;
  retellApiKey?: string;
  n8nWorkflowId?: string;
  n8nWebhookSecret?: string;
  createdAt: string;
  updatedAt: string;
};

export type AiReceptionistConfig = {
  id: string;
  orgId: string;
  name: string;
  isActive: boolean;
  retellAgentId?: string;
  retellApiKey?: string;
  voiceSettings?: {
    voice_id: string;
    speed: number;
    temperature: number;
  };
  greetingMessage?: string;
  businessHoursMessage?: string;
  escalationRules?: {
    keywords: string[];
    maxAttempts: number;
    escalationMessage: string;
  };
  appointmentSettings?: {
    enabled: boolean;
    bookingWindow: number;
    bufferTime: number;
    confirmationMessage: string;
  };
  n8nWorkflowId?: string;
  n8nWebhookUrl?: string;
  createdAt: string;
  updatedAt: string;
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
