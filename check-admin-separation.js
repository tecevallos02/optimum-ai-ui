const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminSeparation() {
  try {
    console.log('🔍 Checking admin account separation...');
    
    const adminEmail = 'goshawkai1@gmail.com';
    
    // Check if admin user exists in admin system
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: adminEmail }
    });
    
    console.log('🔐 Admin system:');
    console.log('  - Admin user exists:', !!adminUser);
    if (adminUser) {
      console.log('  - Email:', adminUser.email);
      console.log('  - Name:', adminUser.name);
    }
    
    // Check if regular user exists in CRM system
    const regularUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    console.log('👤 CRM system:');
    console.log('  - Regular user exists:', !!regularUser);
    if (regularUser) {
      console.log('  - Email:', regularUser.email);
      console.log('  - Name:', regularUser.name);
      console.log('  - ⚠️  WARNING: Admin user has CRM account!');
      
      // Ask if we should delete the CRM account
      console.log('🗑️  Deleting CRM account for admin user...');
      await prisma.user.delete({
        where: { email: adminEmail }
      });
      console.log('✅ CRM account deleted for admin user');
    } else {
      console.log('✅ Admin user has no CRM account (correct)');
    }
    
    console.log('\n🎯 Result:');
    console.log('  - Admin login: ✅ goshawkai1@gmail.com (admin system only)');
    console.log('  - CRM login: ❌ goshawkai1@gmail.com (should fail)');
    
  } catch (error) {
    console.error('❌ Error checking admin separation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminSeparation();
