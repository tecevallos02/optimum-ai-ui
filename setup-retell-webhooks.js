const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupRetellWebhooks() {
  try {
    console.log('🔧 Setting up Retell webhook URLs...\n');

    // Get all companies
    const companies = await prisma.company.findMany({
      include: {
        retell: true
      }
    });

    console.log('🏢 Found companies:', companies.map(c => c.name));

    for (const company of companies) {
      const webhookUrl = `https://ui.goshawkai.com/api/webhooks/retell/${company.id}`;
      
      console.log(`\n📞 Setting up webhook for ${company.name}:`);
      console.log(`   🆔 Company ID: ${company.id}`);
      console.log(`   🔗 Webhook URL: ${webhookUrl}`);

      // Update or create Retell configuration
      if (company.retell && company.retell.length > 0) {
        // Update existing Retell config
        await prisma.companyRetell.update({
          where: { id: company.retell[0].id },
          data: {
            webhookUrl: webhookUrl,
            // Keep existing workflowId and apiKey
          }
        });
        console.log(`   ✅ Updated existing Retell config`);
      } else {
        // Create new Retell config
        await prisma.companyRetell.create({
          data: {
            companyId: company.id,
            workflowId: `retell-workflow-${company.id}`, // You'll need to replace this with actual workflow ID
            apiKey: `retell-api-key-${company.id}`, // You'll need to replace this with actual API key
            webhookUrl: webhookUrl,
          }
        });
        console.log(`   ✅ Created new Retell config`);
      }
    }

    console.log('\n🎉 Retell webhook setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to your Retell dashboard');
    console.log('2. For each company, set the webhook URL to:');
    companies.forEach(company => {
      console.log(`   ${company.name}: https://ui.goshawkai.com/api/webhooks/retell/${company.id}`);
    });
    console.log('3. Test the webhook by making a call');

  } catch (error) {
    console.error('❌ Error setting up Retell webhooks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupRetellWebhooks();
