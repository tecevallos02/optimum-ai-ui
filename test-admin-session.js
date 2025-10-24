const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminSession() {
  try {
    console.log('🔍 Testing admin session setup...');
    
    // Check if admin user exists
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: 'goshawkai1@gmail.com' }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', adminUser.email);
    
    // Check if there are any existing sessions for this admin user
    const sessions = await prisma.session.findMany({
      where: { userId: adminUser.id }
    });
    
    console.log('📱 Existing sessions for admin user:', sessions.length);
    
    if (sessions.length > 0) {
      console.log('🔍 Session details:');
      for (const session of sessions) {
        console.log('  - Session ID:', session.id);
        console.log('  - Session Token:', session.sessionToken);
        console.log('  - Expires:', session.expires);
        console.log('  - Is expired:', new Date() > session.expires);
      }
    }
    
    // Check if there are any accounts for this admin user
    const accounts = await prisma.account.findMany({
      where: { userId: adminUser.id }
    });
    
    console.log('🔗 Accounts for admin user:', accounts.length);
    
    // Test creating a new session (simulate login)
    console.log('\n🧪 Testing session creation...');
    
    const sessionToken = 'test-session-' + Date.now();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    try {
      const newSession = await prisma.session.create({
        data: {
          sessionToken,
          userId: adminUser.id,
          expires
        }
      });
      
      console.log('✅ Test session created:', newSession.id);
      
      // Clean up test session
      await prisma.session.delete({
        where: { id: newSession.id }
      });
      
      console.log('🧹 Test session cleaned up');
      
    } catch (error) {
      console.log('❌ Error creating test session:', error.message);
    }
    
    console.log('\n🎯 Admin session setup should work!');
    console.log('The issue might be with the NextAuth configuration or session handling.');
    
  } catch (error) {
    console.error('❌ Error testing admin session:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminSession();
