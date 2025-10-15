const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function updateClientCredentials() {
  try {
    console.log('🔧 Update Client Credentials\n');

    // 1. List all clients
    console.log('📋 Available clients:');
    const companies = await prisma.company.findMany({
      include: {
        users: { select: { email: true } },
        sheets: true,
        phones: true,
        retell: true
      }
    });

    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name} (${company.id})`);
      console.log(`   👤 User: ${company.users[0]?.email || 'No user'}`);
      console.log(`   📞 Phone: ${company.phones[0]?.e164 || 'No phone'}`);
      console.log(`   📊 Sheet: ${company.sheets[0]?.spreadsheetId || 'No sheet'}`);
      console.log(`   🤖 Retell: ${company.retell[0]?.workflowId || 'No retell'}`);
      console.log('');
    });

    // 2. Select client to update
    const clientIndex = await askQuestion('Select client number to update: ');
    const selectedCompany = companies[parseInt(clientIndex) - 1];

    if (!selectedCompany) {
      console.log('❌ Invalid selection');
      return;
    }

    console.log(`\n🔧 Updating ${selectedCompany.name}...\n`);

    // 3. Update Google Sheets
    const updateSheets = await askQuestion('Update Google Sheets? (y/n): ');
    if (updateSheets.toLowerCase() === 'y') {
      const newSheetId = await askQuestion('New Google Sheet ID: ');
      
      await prisma.companySheet.upsert({
        where: { companyId: selectedCompany.id },
        update: { spreadsheetId: newSheetId },
        create: {
          companyId: selectedCompany.id,
          spreadsheetId: newSheetId,
          dataRange: 'Calls!A:H'
        }
      });
      console.log(`✅ Google Sheets updated: ${newSheetId}`);
    }

    // 4. Update phone number
    const updatePhone = await askQuestion('Update phone number? (y/n): ');
    if (updatePhone.toLowerCase() === 'y') {
      const newPhone = await askQuestion('New phone number (E.164 format): ');
      
      await prisma.companyPhone.upsert({
        where: {
          companyId_e164: {
            companyId: selectedCompany.id,
            e164: newPhone
          }
        },
        update: { e164: newPhone },
        create: {
          companyId: selectedCompany.id,
          e164: newPhone
        }
      });
      console.log(`✅ Phone number updated: ${newPhone}`);
    }

    // 5. Update Retell credentials
    const updateRetell = await askQuestion('Update Retell credentials? (y/n): ');
    if (updateRetell.toLowerCase() === 'y') {
      const newWorkflowId = await askQuestion('New Retell Workflow ID: ');
      const newApiKey = await askQuestion('New Retell API Key: ');
      
      await prisma.companyRetell.upsert({
        where: { companyId: selectedCompany.id },
        update: {
          workflowId: newWorkflowId,
          apiKey: newApiKey
        },
        create: {
          companyId: selectedCompany.id,
          workflowId: newWorkflowId,
          apiKey: newApiKey,
          webhookUrl: `https://ui.goshawkai.com/api/webhooks/retell/${selectedCompany.id}`
        }
      });
      console.log(`✅ Retell credentials updated`);
    }

    // 6. Display updated configuration
    console.log('\n🎉 Client credentials updated!');
    console.log('\n📋 Updated Configuration:');
    console.log(`   🏢 Company: ${selectedCompany.name}`);
    console.log(`   🆔 Company ID: ${selectedCompany.id}`);
    console.log(`   👤 User: ${selectedCompany.users[0]?.email || 'No user'}`);
    console.log(`   📞 Phone: ${selectedCompany.phones[0]?.e164 || 'No phone'}`);
    console.log(`   📊 Google Sheet: ${selectedCompany.sheets[0]?.spreadsheetId || 'No sheet'}`);
    console.log(`   🤖 Retell Workflow: ${selectedCompany.retell[0]?.workflowId || 'No retell'}`);
    console.log(`   🔗 Retell Webhook: https://ui.goshawkai.com/api/webhooks/retell/${selectedCompany.id}`);

  } catch (error) {
    console.error('❌ Error updating client credentials:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

updateClientCredentials();
