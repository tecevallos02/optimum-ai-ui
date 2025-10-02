import { subMinutes, subDays, formatISO } from 'date-fns';
import { Call, Appointment, Contact, KPI, SavingsSeries, AuditLog } from './types';

export function seedCalls(): Call[] {
  return Array.from({ length: 25 }).map((_, i) => {
    const start = subDays(new Date(), Math.floor(i / 3));
    const callId = `call_${i + 1}`;
    return {
      id: callId,
      orgId: 'org_1',
      startedAt: formatISO(subMinutes(start, 30)),
      durationSec: 240 + i * 10,
      status: i % 5 === 0 ? 'missed' : 'completed',
      intent: i % 4 === 0 ? ['book'] : ['info'],
      transcriptUrl: `/transcripts/${callId}.txt`,
      recordingUrl: `/recordings/${callId}.mp3`,
      createdByAgent: false,
      disposition: i % 3 === 0 ? 'follow-up' : 'resolved',
      contactId: `contact_${(i % 5) + 1}`,
      costSeconds: 240 + i * 10,
      tags: i % 2 ? ['support'] : ['lead']
    };
  });
}

export function seedAppointments(): Appointment[] {
  return Array.from({ length: 10 }).map((_, i) => ({
    id: `appt_${i + 1}`,
    orgId: 'org_1',
    googleEventId: `gcal_evt_${i + 1}`,
    start: formatISO(subDays(new Date(), i), { representation: 'complete' }),
    end: formatISO(subDays(new Date(), i), { representation: 'complete' }),
    attendee: { name: `Attendee ${i + 1}`, email: `attendee${i + 1}@demo.com`, phone: '1234567890' },
    status: 'confirmed'
  }));
}

export function seedContacts(): Contact[] {
  return Array.from({ length: 5 }).map((_, i) => ({
    id: `contact_${i + 1}`,
    orgId: 'org_1',
    name: `Contact ${i + 1}`,
    phone: `555-000${i}`,
    email: `contact${i + 1}@demo.com`,
    tags: i % 2 ? ['vip'] : [],
    notes: `Notes for contact ${i + 1}`
  }));
}

export function seedKpis(): KPI {
  return {
    callsHandled: 320,
    bookings: 45,
    avgHandleTime: 220,
    csat: 4.5,
    minutesUsed: 1050,
    minutesLimit: 1200,
    estimatedSavings: 920
  };
}

export function seedSavings(): SavingsSeries {
  const series: SavingsSeries = [];
  for (let i = 0; i < 12; i++) {
    series.push({
      month: i + 1,
      timeSaved: 10 + i * 3,
      costSaved: 300 + i * 50,
      planCost: 99
    });
  }
  return series;
}

export function seedAudit(): AuditLog[] {
  return Array.from({ length: 15 }).map((_, i) => ({
    id: `audit_${i + 1}`,
    orgId: 'org_1',
    actor: i % 2 === 0 ? 'owner@demo.com' : 'manager@demo.com',
    action: i % 3 === 0 ? 'Updated Script' : 'Created Appointment',
    target: i % 3 === 0 ? 'config' : 'appointment',
    timestamp: formatISO(subDays(new Date(), i))
  }));
}
