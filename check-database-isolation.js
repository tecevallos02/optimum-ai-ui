const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseIsolation() {
  try {
    console.log('🔍 Checking database isolation...');
    
    // Check if companies have different spreadsheet IDs
    const companies = await prisma.company.findMany({
      include: {
        sheets: true,
        retell: true,
        phones: true
      }
    });
    
    console.log('\n📊 Company configurations:');
    companies.forEach(company => {
      console.log(`\n🏢 ${company.name} (${company.id}):`);
      console.log(`   📊 Sheet ID: ${company.sheets[0]?.spreadsheetId}`);
      console.log(`   📞 Phone: ${company.phones[0]?.e164}`);
      console.log(`   🔧 Retell Workflow: ${company.retell[0]?.workflowId}`);
    });
    
    // Check if the issue is that all companies are using the same mock data
    console.log('\n🔍 Checking if companies have unique configurations...');
    
    const sheetIds = companies.map(c => c.sheets[0]?.spreadsheetId);
    const uniqueSheetIds = [...new Set(sheetIds)];
    
    console.log(`   📊 Unique sheet IDs: ${uniqueSheetIds.length}`);
    console.log(`   📊 All sheet IDs: ${sheetIds.join(', ')}`);
    
    if (uniqueSheetIds.length === 1) {
      console.log('   ⚠️  All companies are using the same sheet ID!');
      console.log('   💡 This means they all get the same mock data');
    } else {
      console.log('   ✅ Companies have different sheet IDs');
    }
    
    // Check the mock data generation logic
    console.log('\n🧪 Testing mock data generation logic...');
    
    const testCompanyIds = ['acme-corp', 'tech-solutions', 'global-services'];
    
    testCompanyIds.forEach(companyId => {
      console.log(`\n   🏢 ${companyId}:`);
      
      // Simulate the mock data generation
      const companyData = {
        'acme-corp': {
          prefix: 'ACME',
          phone: '+15551112222',
          customers: ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson', 'David Brown']
        },
        'tech-solutions': {
          prefix: 'TECH',
          phone: '+15553334444', 
          customers: ['Alice Johnson', 'Bob Wilson', 'Carol Davis', 'David Miller', 'Eva Garcia']
        },
        'global-services': {
          prefix: 'GLOBAL',
          phone: '+15555556666',
          customers: ['Frank Smith', 'Grace Lee', 'Henry Chen', 'Ivy Rodriguez', 'Jack Taylor']
        }
      };
      
      const company = companyData[companyId];
      if (company) {
        console.log(`     📞 Phone: ${company.phone}`);
        console.log(`     👤 Customer: ${company.customers[0]}`);
        console.log(`     🆔 Appointment ID: ${company.prefix}-001`);
      }
    });
    
    console.log('\n💡 The issue might be:');
    console.log('1. All companies are using the same spreadsheet ID');
    console.log('2. The mock data generation is not being called with the right companyId');
    console.log('3. The API is not passing the companyId correctly');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseIsolation();
