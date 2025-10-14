const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCompanyData() {
  try {
    console.log('Testing company-specific data generation...');
    
    // Test the mock data generation for each company
    const companies = ['acme-corp', 'tech-solutions', 'global-services'];
    
    for (const companyId of companies) {
      console.log(`\n🏢 Testing ${companyId}:`);
      
      // Import the mock data function
      const { getCompanyMockData } = await import('./src/lib/mock-google-sheets.ts');
      
      try {
        const mockData = getCompanyMockData(companyId);
        console.log(`   📊 Generated ${mockData.length} appointments`);
        console.log(`   📞 Sample phone: ${mockData[0]?.phone}`);
        console.log(`   👤 Sample customer: ${mockData[0]?.name}`);
        console.log(`   🆔 Sample appointment ID: ${mockData[0]?.appointment_id}`);
        console.log(`   📍 Sample address: ${mockData[0]?.address}`);
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompanyData();
