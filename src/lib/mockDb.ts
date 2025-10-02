import { Call, Appointment, Contact, KPI, SavingsSeries, AuditLog } from './types';

// Seed functions import
import { seedCalls, seedAppointments, seedContacts, seedKpis, seedSavings, seedAudit } from './seed';

export const mockDb = {
  users: [
    {
      id: 'user_1',
      email: 'owner@demo.com',
      name: 'Demo Owner',
      orgId: 'org_1',
      role: 'OWNER' as const
    },
    {
      id: 'user_2',
      email: 'manager@demo.com',
      name: 'Demo Manager',
      orgId: 'org_1',
      role: 'MANAGER' as const
    },
    {
      id: 'user_3',
      email: 'agent@demo.com',
      name: 'Demo Agent',
      orgId: 'org_1',
      role: 'AGENT' as const
    }
  ],
  orgs: [
    {
      id: 'org_1',
      name: 'Demo Company'
    }
  ],
  calls: seedCalls(),
  appointments: seedAppointments(),
  contacts: seedContacts(),
  kpis: seedKpis(),
  savings: seedSavings(),
  audit: seedAudit()
};
