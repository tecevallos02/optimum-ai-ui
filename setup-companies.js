const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupCompanies() {
  try {
    console.log('Setting up companies and Google Sheets configurations...');

    // Create sample companies
    const companies = [
      {
        id: 'acme-corp',
        name: 'Acme Corporation',
        sheets: {
          spreadsheetId: 'YOUR_ACME_SPREADSHEET_ID_HERE',
          dataRange: 'Calls!A:H'
        },
        phones: [
          '+15551234567',
          '+15551234568'
        ]
      },
      {
        id: 'tech-solutions',
        name: 'Tech Solutions LLC',
        sheets: {
          spreadsheetId: 'YOUR_TECH_SOLUTIONS_SPREADSHEET_ID_HERE',
          dataRange: 'Calls!A:H'
        },
        phones: [
          '+15559876543'
        ]
      },
      {
        id: 'global-services',
        name: 'Global Services Inc',
        sheets: {
          spreadsheetId: 'YOUR_GLOBAL_SERVICES_SPREADSHEET_ID_HERE',
          dataRange: 'Calls!A:H'
        },
        phones: [
          '+15555555555',
          '+15555555556',
          '+15555555557'
        ]
      }
    ];

    for (const companyData of companies) {
      // Create company
      const company = await prisma.company.upsert({
        where: { id: companyData.id },
        update: {},
        create: {
          id: companyData.id,
          name: companyData.name
        }
      });

      console.log(`Created company: ${company.name}`);

      // Create company sheet configuration
      await prisma.companySheet.upsert({
        where: { companyId: company.id },
        update: {
          spreadsheetId: companyData.sheets.spreadsheetId,
          dataRange: companyData.sheets.dataRange
        },
        create: {
          companyId: company.id,
          spreadsheetId: companyData.sheets.spreadsheetId,
          dataRange: companyData.sheets.dataRange
        }
      });

      console.log(`Created sheet config for ${company.name}`);

      // Create company phones
      for (const phone of companyData.phones) {
        await prisma.companyPhone.upsert({
          where: {
            companyId_e164: {
              companyId: company.id,
              e164: phone
            }
          },
          update: {},
          create: {
            companyId: company.id,
            e164: phone
          }
        });
      }

      console.log(`Created ${companyData.phones.length} phones for ${company.name}`);
    }

    console.log('✅ Company setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Replace the spreadsheet IDs with your actual Google Sheet IDs');
    console.log('2. Set up your Google Sheets with the correct format');
    console.log('3. Configure your Google Sheets API credentials');
    console.log('4. Test the integration');

  } catch (error) {
    console.error('Error setting up companies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupCompanies();
