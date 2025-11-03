# Migration Guide: From Company-Based to Organization-Based

## Overview

Your current system uses `Company` model for Google Sheets integration. The new system uses `Organization` model for multi-tenant AI Receptionist features. This guide helps you migrate existing data.

---

## Current vs New Architecture

### Before (Company-Based)
```
Company
├── Users
├── CompanySheet (Google Sheets)
├── CompanyPhone
└── CompanyRetell (old structure)
```

### After (Organization-Based)
```
Organization
├── Memberships → Users
├── Appointments
├── Contacts
├── CallLogs
├── OrganizationRetell (new)
└── OrganizationN8n (new)
```

---

## Migration Steps

### Step 1: Run the Migration (Already Done)

The Prisma schema has been updated. Apply to database:

```bash
# Development
npx prisma migrate dev --name add_ai_receptionist_models

# Production (when ready)
npx prisma migrate deploy
```

### Step 2: Decide on Architecture

You have 2 options:

#### Option A: Keep Both (Recommended)
- Keep `Company` for legacy Google Sheets integration
- Use `Organization` for new AI Receptionist features
- Users can belong to both

**Pros:**
- No breaking changes
- Gradual migration
- Both systems work simultaneously

**Cons:**
- Two parallel structures
- Need to sync data if needed

#### Option B: Consolidate Everything to Organization
- Migrate all `Company` data to `Organization`
- Deprecate `Company` model
- Single source of truth

**Pros:**
- Cleaner architecture
- Single data model

**Cons:**
- Requires migration script
- Potential breaking changes

---

## Recommended: Option A (Parallel Systems)

Keep both systems running. Here's how:

### 1. Map Companies to Organizations

Create a migration script:

```typescript
// scripts/migrate-companies-to-orgs.ts
import { prisma } from '../src/lib/prisma';

async function migrateCompaniesToOrganizations() {
  const companies = await prisma.company.findMany({
    include: {
      users: true,
    },
  });

  for (const company of companies) {
    // Check if organization already exists
    const existingOrg = await prisma.organization.findFirst({
      where: {
        name: company.name,
      },
    });

    let org;
    if (existingOrg) {
      org = existingOrg;
      console.log(`✅ Organization already exists: ${company.name}`);
    } else {
      // Create organization
      org = await prisma.organization.create({
        data: {
          name: company.name,
          timezone: 'UTC', // Default, can be updated
          createdAt: company.createdAt,
        },
      });
      console.log(`✅ Created organization: ${company.name}`);
    }

    // Create memberships for all users
    for (const user of company.users) {
      const existingMembership = await prisma.membership.findFirst({
        where: {
          userId: user.id,
          orgId: org.id,
        },
      });

      if (!existingMembership) {
        await prisma.membership.create({
          data: {
            userId: user.id,
            orgId: org.id,
            role: 'OWNER', // First user is owner, adjust as needed
          },
        });
        console.log(`  ✅ Added ${user.email} to ${org.name}`);
      }
    }
  }

  console.log('🎉 Migration complete!');
}

migrateCompaniesToOrganizations()
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
```

Run it:
```bash
npx tsx scripts/migrate-companies-to-orgs.ts
```

### 2. Add Link Between Company and Organization (Optional)

If you want to link them:

```prisma
// In prisma/schema.prisma
model Company {
  id String @id @default(cuid())
  name String @unique
  organizationId String? // Add this
  organization Organization? @relation(fields: [organizationId], references: [id])
  // ... rest of fields
}

model Organization {
  // ... existing fields
  legacyCompanies Company[]
}
```

---

## Data Flow Examples

### Example 1: User Has Both Company and Organization

```typescript
// User belongs to Company (for Google Sheets)
const company = await prisma.company.findUnique({
  where: { id: user.companyId },
  include: { sheets: true }
});

// User belongs to Organization (for AI Receptionist)
const membership = await prisma.membership.findFirst({
  where: { userId: user.id },
  include: {
    org: {
      include: {
        retellConfig: true,
        n8nConfig: true,
        callLogs: true
      }
    }
  }
});

// Use company for old features
const googleSheetsData = await fetchFromGoogleSheets(company.sheets[0].spreadsheetId);

// Use organization for new features
const recentCalls = await prisma.callLog.findMany({
  where: { orgId: membership.orgId },
  take: 10
});
```

### Example 2: Unified User Experience

In your API routes:

```typescript
// src/app/api/dashboard/route.ts
export async function GET(request: NextRequest) {
  const session = await getServerSession();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: {
        include: { sheets: true }
      },
      memberships: {
        include: {
          org: {
            include: {
              retellConfig: true,
              callLogs: {
                take: 10,
                orderBy: { createdAt: 'desc' }
              }
            }
          }
        }
      }
    }
  });

  // Combine data from both sources
  return NextResponse.json({
    // Old Google Sheets data
    googleSheetsCalls: user.company ? await fetchGoogleSheetsCalls(user.company) : [],

    // New AI Receptionist data
    aiReceptionistCalls: user.memberships[0]?.org.callLogs || [],
    retellConfig: user.memberships[0]?.org.retellConfig,
  });
}
```

---

## Gradual Migration Path

### Phase 1: Setup (Week 1)
- [x] Add new Prisma models
- [x] Create APIs for Retell and n8n
- [x] Build admin UI
- [ ] Test with 1-2 pilot organizations

### Phase 2: Parallel Operation (Week 2-4)
- [ ] Run migration script to create organizations from companies
- [ ] Both systems operate independently
- [ ] New features (AI Receptionist) use Organization
- [ ] Old features (Google Sheets) use Company

### Phase 3: Consolidation (Month 2-3, Optional)
- [ ] Move Google Sheets integration to Organization model
- [ ] Deprecate Company model
- [ ] Update all APIs to use Organization only

---

## Testing the Migration

### Test 1: Verify Organizations Created

```sql
-- Check organizations were created
SELECT
  o.id,
  o.name,
  COUNT(m.id) as member_count
FROM "Organization" o
LEFT JOIN "Membership" m ON m."orgId" = o.id
GROUP BY o.id, o.name;
```

### Test 2: Verify User Memberships

```sql
-- Check users have memberships
SELECT
  u.email,
  u."companyId",
  m."orgId",
  m.role
FROM "User" u
LEFT JOIN "Membership" m ON m."userId" = u.id
WHERE u."companyId" IS NOT NULL;
```

### Test 3: Verify No Data Loss

```sql
-- Count companies
SELECT COUNT(*) FROM "Company";

-- Count organizations
SELECT COUNT(*) FROM "Organization";

-- They should be equal (or orgs >= companies if manual orgs created)
```

---

## Rollback Plan

If something goes wrong:

### 1. Rollback Database Migration

```bash
# Find the migration to rollback to
npx prisma migrate status

# Rollback (use with caution)
# Option A: Manually remove from _prisma_migrations table
# Option B: Restore from database backup
```

### 2. Keep Backup Before Migration

```bash
# Backup database before migration
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore if needed
psql $DATABASE_URL < backup_20250103.sql
```

---

## FAQ

### Q: Do I need to migrate immediately?
**A:** No! The new models are additive. Your existing Company-based system continues to work.

### Q: Can I use both Company and Organization?
**A:** Yes! That's the recommended approach initially. Gradually migrate features to Organization.

### Q: What if I have users without companies?
**A:** The migration script handles this. Create a default organization or skip those users.

### Q: Will this break my existing Google Sheets integration?
**A:** No! Company model is untouched. Google Sheets integration continues to work.

### Q: How do I handle users in multiple organizations?
**A:** The Membership model supports this. A user can be in multiple orgs with different roles.

```typescript
// User in multiple organizations
const memberships = await prisma.membership.findMany({
  where: { userId: user.id },
  include: { org: true }
});

// Switch between organizations
const currentOrg = memberships.find(m => m.orgId === selectedOrgId)?.org;
```

---

## Support

If you encounter issues during migration:

1. **Check Logs:**
   ```bash
   npx prisma studio  # Visual database browser
   ```

2. **Verify Data:**
   Run the test queries above

3. **Rollback:**
   Use database backup if needed

4. **Ask for Help:**
   Check the setup guide or reach out

---

## Next Steps

After successful migration:

1. ✅ Test with pilot organization
2. ✅ Configure Retell AI agent
3. ✅ Setup n8n workflow
4. ✅ Make test calls
5. ✅ Verify call logs appear
6. ✅ Check billing calculations
7. 🚀 Scale to all organizations!
