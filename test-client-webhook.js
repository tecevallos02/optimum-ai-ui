const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');
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

async function testClientWebhook() {
  try {
    console.log('🧪 Test Client Webhook\n');

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
      console.log('');
    });

    // 2. Select client
    const clientIndex = await askQuestion('Select client number to test: ');
    const selectedCompany = companies[parseInt(clientIndex) - 1];

    if (!selectedCompany) {
      console.log('❌ Invalid selection');
      return;
    }

    console.log(`\n🧪 Testing webhook for ${selectedCompany.name}...\n`);

    // 3. Create test payload
    const testPayload = {
      call_id: `test-call-${Date.now()}`,
      workflow_id: selectedCompany.retell[0]?.workflowId || 'test-workflow',
      customer_phone: '+15551234567',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 300000).toISOString(), // 5 minutes later
      duration: 300, // 5 minutes
      status: 'completed',
      time_saved: 180, // 3 minutes saved
      cost: 0.15,
      transcript: `Test call for ${selectedCompany.name} - customer called to book an appointment`,
      summary: `Customer wants to schedule a consultation for next week with ${selectedCompany.name}`,
      metadata: {
        intent: 'booking',
        customer_name: 'Test Customer',
        appointment_requested: true,
        company: selectedCompany.name
      }
    };

    // 4. Send test webhook
    const webhookUrl = `https://ui.goshawkai.com/api/webhooks/retell/${selectedCompany.id}`;
    console.log(`📞 Sending test webhook to: ${webhookUrl}`);
    console.log('📋 Test payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ Webhook test successful!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
      
      if (result.forwardedToN8n) {
        console.log('✅ Data was forwarded to n8n successfully');
      } else {
        console.log('⚠️  Data was not forwarded to n8n (n8n webhook not configured)');
      }
    } else {
      console.log('\n❌ Webhook test failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Error testing webhook:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

testClientWebhook();
