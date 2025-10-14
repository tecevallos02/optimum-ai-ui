const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkConfigs() {
  try {
    console.log('Checking database configurations...');
    
    const companies = await prisma.company.findMany({
      include: {
        sheets: true,
        retell: true,
        phones: true
      }
    });

    console.log(`Found ${companies.length} companies:`);
    
    for (const company of companies) {
      console.log(`\n${company.name}:`);
      console.log(`  - Sheets: ${company.sheets.length}`);
      console.log(`  - Retell: ${company.retell.length}`);
      console.log(`  - Phones: ${company.phones.length}`);
      
      if (company.sheets.length > 0) {
        console.log(`    Sheet ID: ${company.sheets[0].spreadsheetId}`);
      }
      
      if (company.retell.length > 0) {
        console.log(`    Retell Workflow: ${company.retell[0].workflowId}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConfigs();
