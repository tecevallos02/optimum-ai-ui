const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    
    const users = await prisma.user.findMany({
      include: {
        company: true
      }
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - Company: ${user.company?.name || 'None'}`);
    });
    
    if (users.length === 0) {
      console.log('\nNo users found. Creating test user...');
      
      // First check if companies exist
      const companies = await prisma.company.findMany();
      console.log(`Found ${companies.length} companies`);
      
      if (companies.length === 0) {
        console.log('No companies found. Creating test company...');
        const company = await prisma.company.create({
          data: {
            id: 'acme-corp',
            name: 'Acme Corporation'
          }
        });
        console.log('Created company:', company.name);
      }
      
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          companyId: 'acme-corp'
        }
      });
      
      console.log('Created test user:', user.email);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
