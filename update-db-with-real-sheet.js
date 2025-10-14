const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateDatabase() {
  try {
    // Replace this with your actual Google Sheet ID
    const realSpreadsheetId = process.argv[2];
    
    if (!realSpreadsheetId) {
      console.log('❌ Please provide a Google Sheet ID as an argument');
      console.log('Usage: node update-db-with-real-sheet.js YOUR_SPREADSHEET_ID');
      console.log('\nTo get your spreadsheet ID:');
      console.log('1. Open your Google Sheet');
      console.log('2. Copy the ID from the URL (the long string after /d/ and before /edit)');
      console.log('3. Example: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit');
      console.log('   Spreadsheet ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
      return;
    }

    console.log(`Updating database with spreadsheet ID: ${realSpreadsheetId}`);
    
    // Update all companies to use the real spreadsheet ID
    const result = await prisma.companySheet.updateMany({
      data: { spreadsheetId: realSpreadsheetId }
    });
    
    console.log(`✅ Updated ${result.count} company sheets with real Google Sheet ID`);
    
    // Verify the update
    const companies = await prisma.company.findMany({
      include: { sheets: true }
    });
    
    console.log('\n📊 Updated companies:');
    companies.forEach(company => {
      console.log(`   ${company.name}: ${company.sheets[0]?.spreadsheetId}`);
    });
    
    console.log('\n🎉 Database updated successfully!');
    console.log('\nNext steps:');
    console.log('1. Make sure your Google Sheet is shared with: goshawk-sheets-service@optimum-ai-test.iam.gserviceaccount.com');
    console.log('2. Add data to your sheet in the correct format (see setup-real-google-sheet.md)');
    console.log('3. Test your dashboard - it should now show real data!');
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDatabase();
