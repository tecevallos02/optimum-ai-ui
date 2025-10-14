import { subMinutes, subDays, formatISO } from 'date-fns';
import { CallRow, Appointment, Contact, KPI, SavingsSeries, AuditLog } from './types';

export function seedCalls(): CallRow[] {
  return Array.from({ length: 25 }).map((_, i) => {
    const start = subDays(new Date(), Math.floor(i / 3));
    const callId = `call_${i + 1}`;
    const statuses = ['booked', 'scheduled', 'confirmed', 'canceled', 'escalated'];
    const intents = ['booking', 'cancellation', 'reschedule', 'quote', 'other'];
    
    return {
      appointment_id: callId,
      name: `Customer ${i + 1}`,
      phone: `+1555${String(i).padStart(7, '0')}`,
      datetime_iso: formatISO(subMinutes(start, 30)),
      window: '30 minutes',
      status: statuses[i % statuses.length],
      address: `123 Main St, City ${i + 1}`,
      notes: `Call notes for ${callId}`,
      intent: intents[i % intents.length]
    };
  });
}

export function seedAppointments(): Appointment[] {
  return Array.from({ length: 10 }).map((_, i) => ({
    id: `appt_${i + 1}`,
    orgId: 'org_1',
    googleEventId: `gcal_evt_${i + 1}`,
    title: `Appointment ${i + 1}`,
    customerName: `Customer ${i + 1}`,
    customerPhone: '1234567890',
    customerEmail: `customer${i + 1}@demo.com`,
    startsAt: formatISO(subDays(new Date(), i), { representation: 'complete' }),
    endsAt: formatISO(subDays(new Date(), i), { representation: 'complete' }),
    status: 'confirmed' as const,
    source: 'agent' as const,
    notes: `Notes for appointment ${i + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    notes: `Notes for contact ${i + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
}

export function seedKpis(): KPI {
  const callsHandled = 320;
  const bookings = 45;
  const conversionRate = callsHandled > 0 ? (bookings / callsHandled) * 100 : 0;
  
  return {
    callsHandled,
    bookings,
    avgHandleTime: 220,
    conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal place
    callsEscalated: 8,
    estimatedSavings: 920,
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
