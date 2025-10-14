const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCurrentData() {
  try {
    console.log('Testing current data flow...');
    
    // Get a company with its configurations
    const company = await prisma.company.findFirst({
      include: {
        sheets: true,
        retell: true,
        phones: true
      }
    });

    if (!company) {
      console.log('❌ No companies found');
      return;
    }

    console.log(`\n📊 Testing with company: ${company.name}`);
    console.log(`   Sheet ID: ${company.sheets[0]?.spreadsheetId}`);
    console.log(`   Retell Workflow: ${company.retell[0]?.workflowId}`);
    console.log(`   Phone: ${company.phones[0]?.e164}`);

    // Test the combined data function
    const { getCombinedData } = await import('./src/lib/combined-data.ts');
    
    const combinedData = await getCombinedData(company.id, {
      useMockRetell: false, // Try real data first
    });

    console.log('\n📈 Combined Data Results:');
    console.log(`   Appointments: ${combinedData.appointments.length}`);
    console.log(`   Call Logs: ${combinedData.callLogs.length}`);
    console.log(`   KPIs:`, combinedData.kpis);
    console.log(`   Retell Analytics:`, combinedData.retellAnalytics);

  } catch (error) {
    console.error('❌ Error testing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCurrentData();
