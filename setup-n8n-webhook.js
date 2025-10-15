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

async function setupN8nWebhook() {
  try {
    console.log('🔗 Setup n8n Webhook for Client\n');

    // 1. List all clients
    console.log('📋 Available clients:');
    const companies = await prisma.company.findMany({
      include: {
        users: { select: { email: true } },
        retell: true
      }
    });

    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name} (${company.id})`);
      console.log(`   👤 User: ${company.users[0]?.email || 'No user'}`);
      console.log(`   🤖 Retell: ${company.retell[0]?.workflowId || 'No retell'}`);
      console.log(`   🔗 Current n8n: ${company.retell[0]?.webhookUrl || 'Not set'}`);
      console.log('');
    });

    // 2. Select client
    const clientIndex = await askQuestion('Select client number: ');
    const selectedCompany = companies[parseInt(clientIndex) - 1];

    if (!selectedCompany) {
      console.log('❌ Invalid selection');
      return;
    }

    console.log(`\n🔧 Setting up n8n for ${selectedCompany.name}...\n`);

    // 3. Get n8n webhook URL
    const n8nWebhookUrl = await askQuestion('n8n Webhook URL for this client: ');
    
    // 4. Update Retell configuration with n8n webhook
    await prisma.companyRetell.upsert({
      where: { companyId: selectedCompany.id },
      update: {
        webhookUrl: n8nWebhookUrl
      },
      create: {
        companyId: selectedCompany.id,
        workflowId: `retell-workflow-${selectedCompany.id}`,
        apiKey: `retell-api-key-${selectedCompany.id}`,
        webhookUrl: n8nWebhookUrl
      }
    });

    console.log(`✅ n8n webhook configured for ${selectedCompany.name}`);
    console.log(`🔗 n8n URL: ${n8nWebhookUrl}`);

    // 5. Display webhook flow
    console.log('\n🔄 Data Flow:');
    console.log('1. Client makes phone call');
    console.log('2. Retell AI handles the call');
    console.log('3. Retell sends data to: https://ui.goshawkai.com/api/webhooks/retell/' + selectedCompany.id);
    console.log('4. Your UI processes and displays the data');
    console.log('5. Your UI forwards data to n8n: ' + n8nWebhookUrl);
    console.log('6. n8n updates the client\'s Google Sheet');

    console.log('\n🎉 n8n integration complete!');

  } catch (error) {
    console.error('❌ Error setting up n8n webhook:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

setupN8nWebhook();
