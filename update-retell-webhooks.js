const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateRetellWebhooks() {
  try {
    console.log('Updating Retell webhook URLs...');

    // Get all companies with Retell configs
    const companies = await prisma.company.findMany({
      include: { retell: true }
    });

    for (const company of companies) {
      if (company.retell.length > 0) {
        const retellConfig = company.retell[0];
        
        // Update with your actual domain
        const uiWebhookUrl = `https://your-domain.com/api/webhooks/retell/${company.id}`;
        const n8nWebhookUrl = `https://your-n8n-instance.com/webhook/retell-${company.id}`;
        
        await prisma.companyRetell.update({
          where: { id: retellConfig.id },
          data: {
            webhookUrl: uiWebhookUrl,
            // Store n8n webhook separately (you might want to add this field)
            // n8nWebhookUrl: n8nWebhookUrl
          }
        });

        console.log(`✅ Updated ${company.name}:`);
        console.log(`   UI Webhook: ${uiWebhookUrl}`);
        console.log(`   n8n Webhook: ${n8nWebhookUrl}`);
      }
    }

    console.log('\n🎉 Webhook URLs updated!');
    console.log('\nNext steps:');
    console.log('1. Replace "your-domain.com" with your actual domain');
    console.log('2. Replace "your-n8n-instance.com" with your actual n8n URL');
    console.log('3. Configure these URLs in your Retell workflow dashboard');
    console.log('4. Test both webhooks are receiving data');

  } catch (error) {
    console.error('Error updating webhook URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRetellWebhooks();
