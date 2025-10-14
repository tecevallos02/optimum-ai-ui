const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function linkUsersToCompanies() {
  try {
    console.log('Linking users to companies...');
    
    // Get all companies
    const companies = await prisma.company.findMany();
    console.log(`Found ${companies.length} companies:`, companies.map(c => c.name));
    
    if (companies.length === 0) {
      console.log('No companies found. Creating test companies...');
      
      const acmeCorp = await prisma.company.create({
        data: {
          id: 'acme-corp',
          name: 'Acme Corporation'
        }
      });
      
      const techStartup = await prisma.company.create({
        data: {
          id: 'tech-startup',
          name: 'Tech Startup Inc'
        }
      });
      
      console.log('Created companies:', [acmeCorp.name, techStartup.name]);
    }
    
    // Get users without companies
    const usersWithoutCompanies = await prisma.user.findMany({
      where: {
        companyId: null
      }
    });
    
    console.log(`Found ${usersWithoutCompanies.length} users without companies`);
    
    // Link users to companies
    const allCompanies = await prisma.company.findMany();
    
    for (let i = 0; i < usersWithoutCompanies.length; i++) {
      const user = usersWithoutCompanies[i];
      const company = allCompanies[i % allCompanies.length]; // Distribute users across companies
      
      await prisma.user.update({
        where: { id: user.id },
        data: { companyId: company.id }
      });
      
      console.log(`Linked ${user.email} to ${company.name}`);
    }
    
    console.log('✅ All users linked to companies!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkUsersToCompanies();
