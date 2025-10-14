const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUserCompanies() {
  try {
    console.log('Fixing user-company associations...');
    
    // Get all users
    const users = await prisma.user.findMany();
    const companies = await prisma.company.findMany();
    
    console.log(`Found ${users.length} users and ${companies.length} companies`);
    
    // Create a mapping of emails to specific companies
    const emailToCompany = {
      'tecevallos@hotmail.com': 'acme-corp',
      'tecevallos@gmail.com': 'tech-solutions',
      'tylerdiscala@yahoo.com': 'global-services',
      'dcohen0403@gmail.com': 'acme-corp',
      'tylerdiscala@gmail.com': 'tech-solutions',
      'fernando@sorealusa.com': 'global-services',
      'test@example.com': 'acme-corp'
    };
    
    // Update each user to their specific company
    for (const user of users) {
      const targetCompany = emailToCompany[user.email];
      if (targetCompany) {
        await prisma.user.update({
          where: { id: user.id },
          data: { companyId: targetCompany }
        });
        console.log(`✅ ${user.email} → ${targetCompany}`);
      } else {
        console.log(`⚠️  No company mapping for ${user.email}`);
      }
    }
    
    // Verify the updates
    console.log('\n📊 Updated user-company associations:');
    const updatedUsers = await prisma.user.findMany();
    for (const user of updatedUsers) {
      const company = await prisma.company.findUnique({
        where: { id: user.companyId }
      });
      console.log(`   ${user.email} → ${company?.name || 'Unknown'}`);
    }
    
    console.log('\n🎉 User-company associations updated!');
    console.log('\nNow each email should see different data:');
    console.log('- tecevallos@hotmail.com → Acme Corporation (ACME-001, etc.)');
    console.log('- tecevallos@gmail.com → Tech Solutions (TECH-001, etc.)');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserCompanies();
