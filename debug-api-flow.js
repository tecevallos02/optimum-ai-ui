const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAPIFlow() {
  try {
    console.log('🔍 Debugging API flow...');
    
    // Simulate what happens when a user logs in
    const testUsers = [
      { email: 'tecevallos@hotmail.com', expectedCompany: 'acme-corp' },
      { email: 'tecevallos@gmail.com', expectedCompany: 'tech-solutions' }
    ];
    
    for (const testUser of testUsers) {
      console.log(`\n📧 Testing ${testUser.email}:`);
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { email: testUser.email }
      });
      
      if (!user) {
        console.log('   ❌ User not found');
        continue;
      }
      
      console.log(`   👤 User ID: ${user.id}`);
      console.log(`   🏢 Company ID: ${user.companyId}`);
      console.log(`   ✅ Expected: ${testUser.expectedCompany}`);
      
      if (user.companyId !== testUser.expectedCompany) {
        console.log('   ⚠️  Company mismatch!');
        continue;
      }
      
      // Get company data
      const company = await prisma.company.findUnique({
        where: { id: user.companyId },
        include: { sheets: true, retell: true }
      });
      
      if (!company) {
        console.log('   ❌ Company not found');
        continue;
      }
      
      console.log(`   🏢 Company: ${company.name}`);
      console.log(`   📊 Sheet ID: ${company.sheets[0]?.spreadsheetId}`);
      console.log(`   📞 Retell Workflow: ${company.retell[0]?.workflowId}`);
      
      // Test the mock data generation
      console.log('   🧪 Testing mock data generation...');
      
      // Simulate the mock data generation
      const companyData = {
        'acme-corp': {
          prefix: 'ACME',
          phone: '+15551112222',
          customers: ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson', 'David Brown']
        },
        'tech-solutions': {
          prefix: 'TECH',
          phone: '+15553334444', 
          customers: ['Alice Johnson', 'Bob Wilson', 'Carol Davis', 'David Miller', 'Eva Garcia']
        },
        'global-services': {
          prefix: 'GLOBAL',
          phone: '+15555556666',
          customers: ['Frank Smith', 'Grace Lee', 'Henry Chen', 'Ivy Rodriguez', 'Jack Taylor']
        }
      };
      
      const companyInfo = companyData[user.companyId];
      if (companyInfo) {
        console.log(`   📞 Expected phone: ${companyInfo.phone}`);
        console.log(`   👤 Expected customer: ${companyInfo.customers[0]}`);
        console.log(`   🆔 Expected appointment ID: ${companyInfo.prefix}-001`);
      }
    }
    
    console.log('\n🔍 Possible issues:');
    console.log('1. Browser cache - try hard refresh (Ctrl+F5)');
    console.log('2. Session cache - try logging out and back in');
    console.log('3. API not using companyId correctly');
    console.log('4. Mock data not being generated properly');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAPIFlow();
