const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateWithRealSheetId() {
  try {
    console.log('Updating database with real Google Sheet ID...');
    
    // You need to replace this with your actual Google Sheet ID
    const realSpreadsheetId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'; // Replace with your actual sheet ID
    
    // Update all companies to use the real spreadsheet ID
    const companies = await prisma.company.findMany();
    
    for (const company of companies) {
      await prisma.companySheet.updateMany({
        where: { companyId: company.id },
        data: { spreadsheetId: realSpreadsheetId }
      });
      
      console.log(`✅ Updated ${company.name} to use real spreadsheet ID`);
    }
    
    console.log('\n🎉 Database updated with real Google Sheet ID!');
    console.log('\nNext steps:');
    console.log('1. Make sure the Google Sheet is shared with your service account');
    console.log('2. Add sample data to the sheet in the correct format');
    console.log('3. Test the API endpoints');
    
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateWithRealSheetId();
