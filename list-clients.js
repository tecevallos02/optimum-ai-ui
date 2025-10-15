const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listClients() {
  try {
    console.log('📋 All Clients in Optimum AI System\n');

    const companies = await prisma.company.findMany({
      include: {
        users: { select: { email: true } },
        sheets: true,
        phones: true,
        retell: true
      },
      orderBy: { name: 'asc' }
    });

    if (companies.length === 0) {
      console.log('❌ No clients found');
      return;
    }

    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name}`);
      console.log(`   🆔 Company ID: ${company.id}`);
      console.log(`   👤 User: ${company.users[0]?.email || 'No user linked'}`);
      console.log(`   📞 Phone: ${company.phones[0]?.e164 || 'No phone configured'}`);
      console.log(`   📊 Google Sheet: ${company.sheets[0]?.spreadsheetId || 'No sheet configured'}`);
      console.log(`   🤖 Retell Workflow: ${company.retell[0]?.workflowId || 'No retell configured'}`);
      console.log(`   🔗 Retell Webhook: https://ui.goshawkai.com/api/webhooks/retell/${company.id}`);
      console.log(`   🔗 n8n Webhook: ${company.retell[0]?.webhookUrl || 'Not configured'}`);
      console.log('');
    });

    console.log(`📊 Total clients: ${companies.length}`);

  } catch (error) {
    console.error('❌ Error listing clients:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listClients();
