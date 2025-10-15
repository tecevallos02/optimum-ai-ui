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

async function addNewClient() {
  try {
    console.log('🏢 Adding New Client to Optimum AI System\n');
    console.log('This will set up a new company with Google Sheets and Retell integration.\n');

    // 1. Get company information
    const companyName = await askQuestion('📝 Company Name: ');
    const companyId = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    console.log(`\n🏷️  Generated Company ID: ${companyId}`);

    // 2. Get user email
    const userEmail = await askQuestion('\n👤 User Email (who will access this company): ');
    
    // 3. Get phone number
    const phoneNumber = await askQuestion('\n📞 Phone Number (E.164 format, e.g., +15551234567): ');
    
    // 4. Get Google Sheet information
    const googleSheetId = await askQuestion('\n📊 Google Sheet ID (or "mock" for testing): ');
    
    // 5. Get Retell information
    const retellWorkflowId = await askQuestion('\n🤖 Retell Workflow ID (or "mock" for testing): ');
    const retellApiKey = await askQuestion('🔑 Retell API Key (or "mock" for testing): ');

    console.log('\n🔄 Setting up client...\n');

    // 1. Create company
    console.log('1️⃣ Creating company...');
    const company = await prisma.company.upsert({
      where: { id: companyId },
      update: {},
      create: {
        id: companyId,
        name: companyName
      }
    });
    console.log(`✅ Company created: ${company.name}`);

    // 2. Link user to company
    console.log('\n2️⃣ Linking user to company...');
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.log(`❌ User ${userEmail} not found. Please create the user account first.`);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { companyId: companyId }
    });
    console.log(`✅ User ${userEmail} linked to ${companyName}`);

    // 3. Create Google Sheets configuration
    console.log('\n3️⃣ Setting up Google Sheets...');
    await prisma.companySheet.upsert({
      where: { companyId: companyId },
      update: {},
      create: {
        companyId: companyId,
        spreadsheetId: googleSheetId === 'mock' ? `mock-${companyId}-sheet` : googleSheetId,
        dataRange: 'Calls!A:H'
      }
    });
    console.log(`✅ Google Sheets configured: ${googleSheetId === 'mock' ? `mock-${companyId}-sheet` : googleSheetId}`);

    // 4. Create phone number
    console.log('\n4️⃣ Adding phone number...');
    await prisma.companyPhone.upsert({
      where: {
        companyId_e164: {
          companyId: companyId,
          e164: phoneNumber
        }
      },
      update: {},
      create: {
        companyId: companyId,
        e164: phoneNumber
      }
    });
    console.log(`✅ Phone number added: ${phoneNumber}`);

    // 5. Create Retell configuration
    console.log('\n5️⃣ Setting up Retell...');
    await prisma.companyRetell.upsert({
      where: { companyId: companyId },
      update: {},
      create: {
        companyId: companyId,
        workflowId: retellWorkflowId === 'mock' ? `retell-workflow-${companyId}` : retellWorkflowId,
        apiKey: retellApiKey === 'mock' ? `retell-api-key-${companyId}` : retellApiKey,
        webhookUrl: `https://ui.goshawkai.com/api/webhooks/retell/${companyId}`
      }
    });
    console.log(`✅ Retell configured: ${retellWorkflowId === 'mock' ? `retell-workflow-${companyId}` : retellWorkflowId}`);

    // 6. Display summary
    console.log('\n🎉 Client setup complete!');
    console.log('\n📋 Configuration Summary:');
    console.log(`   🏢 Company: ${companyName}`);
    console.log(`   🆔 Company ID: ${companyId}`);
    console.log(`   👤 User: ${userEmail}`);
    console.log(`   📞 Phone: ${phoneNumber}`);
    console.log(`   📊 Google Sheet: ${googleSheetId === 'mock' ? `mock-${companyId}-sheet` : googleSheetId}`);
    console.log(`   🤖 Retell Workflow: ${retellWorkflowId === 'mock' ? `retell-workflow-${companyId}` : retellWorkflowId}`);
    console.log(`   🔗 Retell Webhook: https://ui.goshawkai.com/api/webhooks/retell/${companyId}`);
    
    console.log('\n🔧 Next Steps:');
    if (googleSheetId === 'mock') {
      console.log('1. Create a Google Sheet for this client');
      console.log('2. Update the spreadsheetId in the database with the real Google Sheet ID');
    }
    if (retellWorkflowId === 'mock') {
      console.log('3. Set up the Retell workflow for this client');
      console.log('4. Update the workflowId and apiKey in the database');
    }
    console.log('5. Configure the webhook URL in your Retell dashboard');
    console.log('6. Test the integration by making a call');

  } catch (error) {
    console.error('❌ Error setting up client:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

addNewClient();
