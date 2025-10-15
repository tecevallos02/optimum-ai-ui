const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupPJAirConditioning() {
  try {
    console.log('🏢 Setting up P&J Air Conditioning...\n');

    // 1. Create P&J Air Conditioning company
    console.log('1️⃣ Creating P&J Air Conditioning company...');
    const company = await prisma.company.upsert({
      where: { id: 'pj-air-conditioning' },
      update: {},
      create: {
        id: 'pj-air-conditioning',
        name: 'P&J Air Conditioning'
      }
    });
    console.log(`✅ Company created: ${company.name} (ID: ${company.id})`);

    // 2. Link tecevallos@hotmail.com to P&J Air Conditioning
    console.log('\n2️⃣ Linking tecevallos@hotmail.com to P&J Air Conditioning...');
    const user = await prisma.user.findUnique({
      where: { email: 'tecevallos@hotmail.com' }
    });

    if (!user) {
      console.log('❌ User tecevallos@hotmail.com not found');
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { companyId: 'pj-air-conditioning' }
    });
    console.log(`✅ User ${user.email} linked to P&J Air Conditioning`);

    // 3. Create Google Sheets configuration (placeholder for now)
    console.log('\n3️⃣ Setting up Google Sheets configuration...');
    await prisma.companySheet.upsert({
      where: { 
        companyId: 'pj-air-conditioning'
      },
      update: {},
      create: {
        companyId: 'pj-air-conditioning',
        spreadsheetId: 'mock-pj-air-sheet', // Placeholder - you'll replace with real Google Sheet ID
        dataRange: 'Calls!A:H'
      }
    });
    console.log('✅ Google Sheets configuration created (placeholder)');

    // 4. Create phone number for P&J Air Conditioning
    console.log('\n4️⃣ Setting up phone number...');
    await prisma.companyPhone.upsert({
      where: {
        companyId_e164: {
          companyId: 'pj-air-conditioning',
          e164: '+15557778888' // Placeholder phone - you'll replace with real phone
        }
      },
      update: {},
      create: {
        companyId: 'pj-air-conditioning',
        e164: '+15557778888'
      }
    });
    console.log('✅ Phone number added: +15557778888');

    // 5. Create Retell configuration
    console.log('\n5️⃣ Setting up Retell configuration...');
    await prisma.companyRetell.upsert({
      where: { companyId: 'pj-air-conditioning' },
      update: {},
      create: {
        companyId: 'pj-air-conditioning',
        workflowId: 'retell-workflow-pj-air', // You'll replace with actual Retell workflow ID
        apiKey: 'retell-api-key-pj-air', // You'll replace with actual Retell API key
        webhookUrl: 'https://ui.goshawkai.com/api/webhooks/retell/pj-air-conditioning'
      }
    });
    console.log('✅ Retell configuration created');

    // 6. Display setup summary
    console.log('\n🎉 P&J Air Conditioning setup complete!');
    console.log('\n📋 Configuration Summary:');
    console.log(`   🏢 Company: ${company.name}`);
    console.log(`   🆔 Company ID: ${company.id}`);
    console.log(`   👤 User: tecevallos@hotmail.com`);
    console.log(`   📞 Phone: +15557778888 (placeholder)`);
    console.log(`   📊 Google Sheet: mock-pj-air-sheet (placeholder)`);
    console.log(`   🔗 Retell Webhook: https://ui.goshawkai.com/api/webhooks/retell/pj-air-conditioning`);
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Create a Google Sheet for P&J Air Conditioning');
    console.log('2. Update the spreadsheetId in the database with the real Google Sheet ID');
    console.log('3. Update the phone number with P&J Air Conditioning\'s actual phone');
    console.log('4. Set up the Retell workflow and update workflowId and apiKey');
    console.log('5. Configure the webhook URL in your Retell dashboard');

  } catch (error) {
    console.error('❌ Error setting up P&J Air Conditioning:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupPJAirConditioning();
