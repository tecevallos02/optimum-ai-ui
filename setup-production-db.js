const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function setupProductionDatabase() {
  try {
    console.log('Setting up production database...');
    
    // 1. Create companies
    console.log('Creating companies...');
    const companies = await Promise.all([
      prisma.company.upsert({
        where: { id: 'acme-corp' },
        update: {},
        create: {
          id: 'acme-corp',
          name: 'Acme Corporation'
        }
      }),
      prisma.company.upsert({
        where: { id: 'tech-solutions' },
        update: {},
        create: {
          id: 'tech-solutions',
          name: 'Tech Solutions LLC'
        }
      }),
      prisma.company.upsert({
        where: { id: 'global-services' },
        update: {},
        create: {
          id: 'global-services',
          name: 'Global Services Inc'
        }
      })
    ]);
    
    console.log('✅ Companies created:', companies.map(c => c.name));
    
    // 2. Create company sheets (with mock spreadsheet IDs for now)
    console.log('Creating company sheets...');
    
    // First, delete any existing sheets to avoid conflicts
    await prisma.companySheet.deleteMany({});
    
    const sheets = await Promise.all([
      prisma.companySheet.create({
        data: {
          companyId: 'acme-corp',
          spreadsheetId: 'mock-acme-sheet',
          dataRange: 'Calls!A:H'
        }
      }),
      prisma.companySheet.create({
        data: {
          companyId: 'tech-solutions',
          spreadsheetId: 'mock-tech-sheet',
          dataRange: 'Calls!A:H'
        }
      }),
      prisma.companySheet.create({
        data: {
          companyId: 'global-services',
          spreadsheetId: 'mock-global-sheet',
          dataRange: 'Calls!A:H'
        }
      })
    ]);
    
    console.log('✅ Company sheets created');
    
    // 3. Create company phones
    console.log('Creating company phones...');
    
    // First, delete any existing phones to avoid conflicts
    await prisma.companyPhone.deleteMany({});
    
    const phones = await Promise.all([
      prisma.companyPhone.create({
        data: {
          companyId: 'acme-corp',
          e164: '+15551112222'
        }
      }),
      prisma.companyPhone.create({
        data: {
          companyId: 'tech-solutions',
          e164: '+15553334444'
        }
      }),
      prisma.companyPhone.create({
        data: {
          companyId: 'global-services',
          e164: '+15555556666'
        }
      })
    ]);
    
    console.log('✅ Company phones created');
    
    // 4. Link existing users to companies
    console.log('Linking users to companies...');
    const users = await prisma.user.findMany();
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const company = companies[i % companies.length];
      
      await prisma.user.update({
        where: { id: user.id },
        data: { companyId: company.id }
      });
      
      console.log(`✅ Linked ${user.email} to ${company.name}`);
    }
    
    console.log('\n🎉 Production database setup complete!');
    console.log('\nNow when you log in, you should see:');
    console.log('- Mock data in the dashboard');
    console.log('- Company isolation working');
    console.log('- All tabs functional');
    
  } catch (error) {
    console.error('Error setting up production database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupProductionDatabase();
