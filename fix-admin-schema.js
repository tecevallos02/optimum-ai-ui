const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminSchema() {
  try {
    console.log('🔧 Fixing admin schema issues...');
    
    // Check current schema
    console.log('📊 Current database state:');
    
    const userCount = await prisma.user.count();
    const adminUserCount = await prisma.adminUser.count();
    const sessionCount = await prisma.session.count();
    
    console.log('  - Users:', userCount);
    console.log('  - Admin Users:', adminUserCount);
    console.log('  - Sessions:', sessionCount);
    
    // Check if there are any sessions that might be causing conflicts
    const allSessions = await prisma.session.findMany({
      include: {
        user: true,
        adminUser: true
      }
    });
    
    console.log('\n📱 Existing sessions:');
    for (const session of allSessions) {
      console.log('  - Session ID:', session.id);
      console.log('  - User ID:', session.userId);
      console.log('  - User:', session.user?.email || 'None');
      console.log('  - Admin User:', session.adminUser?.email || 'None');
      console.log('  - Expires:', session.expires);
      console.log('  - Is expired:', new Date() > session.expires);
      console.log('  ---');
    }
    
    // Clean up expired sessions
    const expiredSessions = await prisma.session.findMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    });
    
    if (expiredSessions.length > 0) {
      console.log(`🧹 Cleaning up ${expiredSessions.length} expired sessions...`);
      await prisma.session.deleteMany({
        where: {
          expires: {
            lt: new Date()
          }
        }
      });
      console.log('✅ Expired sessions cleaned up');
    }
    
    // Test creating a session for admin user
    console.log('\n🧪 Testing admin session creation...');
    
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: 'goshawkai1@gmail.com' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email);
      
      // Try to create a session with explicit adminUser relation
      try {
        const sessionToken = 'admin-test-' + Date.now();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
        
        const newSession = await prisma.session.create({
          data: {
            sessionToken,
            userId: adminUser.id,
            expires,
            adminUser: {
              connect: { id: adminUser.id }
            }
          }
        });
        
        console.log('✅ Admin session created successfully:', newSession.id);
        
        // Clean up test session
        await prisma.session.delete({
          where: { id: newSession.id }
        });
        
        console.log('🧹 Test session cleaned up');
        
      } catch (error) {
        console.log('❌ Error creating admin session:', error.message);
        console.log('This confirms the schema issue');
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing admin schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminSchema();
