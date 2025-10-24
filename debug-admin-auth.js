const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function debugAdminAuth() {
  try {
    console.log('🔍 Debugging admin authentication...');
    
    // Check database connection
    console.log('📊 Database connection test:');
    const userCount = await prisma.user.count();
    console.log('  - Total users in database:', userCount);
    
    // Check admin users
    console.log('🔐 Admin users in database:');
    const adminUsers = await prisma.adminUser.findMany();
    console.log('  - Total admin users:', adminUsers.length);
    
    for (const admin of adminUsers) {
      console.log('  - Admin:', admin.email, admin.name);
    }
    
    // Test specific admin user
    const testEmail = 'goshawkai1@gmail.com';
    console.log(`\n🧪 Testing admin user: ${testEmail}`);
    
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: testEmail }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found in database');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('  - ID:', adminUser.id);
    console.log('  - Email:', adminUser.email);
    console.log('  - Name:', adminUser.name);
    console.log('  - Has password:', !!adminUser.password);
    console.log('  - Created:', adminUser.createdAt);
    
    // Test password
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, adminUser.password);
    console.log('🔑 Password test:', isValid ? '✅ Valid' : '❌ Invalid');
    
    // Check if admin user has any sessions
    const sessions = await prisma.session.findMany({
      where: { userId: adminUser.id }
    });
    console.log('📱 Active sessions:', sessions.length);
    
    // Check if admin user has any accounts
    const accounts = await prisma.account.findMany({
      where: { userId: adminUser.id }
    });
    console.log('🔗 Linked accounts:', accounts.length);
    
  } catch (error) {
    console.error('❌ Error debugging admin auth:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugAdminAuth();
