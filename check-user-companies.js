const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserCompanies() {
  try {
    console.log('Checking user-company associations...');
    
    const users = await prisma.user.findMany({
      include: {
        // Note: companyId is a direct field, not a relation
      }
    });

    console.log(`Found ${users.length} users:`);
    
    for (const user of users) {
      console.log(`\n📧 ${user.email}:`);
      console.log(`   Company ID: ${user.companyId || 'Not linked'}`);
      
      if (user.companyId) {
        const company = await prisma.company.findUnique({
          where: { id: user.companyId }
        });
        console.log(`   Company Name: ${company?.name || 'Unknown'}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserCompanies();
