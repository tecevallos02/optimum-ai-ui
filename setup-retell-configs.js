const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupRetellConfigurations() {
  try {
    console.log('Setting up Retell configurations for companies...');

    // Get all companies
    const companies = await prisma.company.findMany();
    console.log(`Found ${companies.length} companies`);

    // Create Retell configurations for each company
    for (const company of companies) {
      console.log(`Setting up Retell config for ${company.name}...`);
      
      // Check if Retell config already exists
      const existingRetell = await prisma.companyRetell.findUnique({
        where: { companyId: company.id }
      });

      if (existingRetell) {
        console.log(`  Retell config already exists for ${company.name}`);
        continue;
      }

      // Create mock Retell configuration
      await prisma.companyRetell.create({
        data: {
          companyId: company.id,
          workflowId: `mock-workflow-${company.id}`,
          apiKey: `mock-api-key-${company.id}`,
          webhookUrl: `https://your-domain.com/api/webhooks/retell/${company.id}`,
        }
      });

      console.log(`  ✅ Created Retell config for ${company.name}`);
    }

    console.log('🎉 Retell configurations setup complete!');
    console.log('\nNext steps:');
    console.log('1. Replace mock API keys with real Retell API keys');
    console.log('2. Update workflow IDs with actual Retell workflow IDs');
    console.log('3. Configure webhook URLs for real-time updates');
  } catch (error) {
    console.error('Error setting up Retell configurations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupRetellConfigurations();
