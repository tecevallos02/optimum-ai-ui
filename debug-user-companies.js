const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUserCompanies() {
  try {
    console.log('🔍 Debugging user-company associations...\n');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        companyId: true,
        organization: true
      }
    });

    console.log('👥 All users:');
    users.forEach(user => {
      console.log(`  📧 ${user.email}`);
      console.log(`     🆔 User ID: ${user.id}`);
      console.log(`     🏢 Company ID: ${user.companyId || 'NULL'}`);
      console.log(`     🏛️  Organization: ${user.organization || 'NULL'}`);
      console.log('');
    });

    // Get all companies
    const companies = await prisma.company.findMany({
      include: {
        users: {
          select: {
            email: true
          }
        }
      }
    });

    console.log('🏢 All companies:');
    companies.forEach(company => {
      console.log(`  🏢 ${company.name} (ID: ${company.id})`);
      console.log(`     👥 Users: ${company.users.map(u => u.email).join(', ') || 'None'}`);
      console.log('');
    });

    // Check if users are properly linked
    const unlinkedUsers = users.filter(u => !u.companyId);
    if (unlinkedUsers.length > 0) {
      console.log('❌ Users without company associations:');
      unlinkedUsers.forEach(user => {
        console.log(`  📧 ${user.email} (ID: ${user.id})`);
      });
    } else {
      console.log('✅ All users have company associations');
    }

  } catch (error) {
    console.error('❌ Error debugging user companies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUserCompanies();
