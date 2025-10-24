const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testAdminLogin() {
  try {
    console.log('🧪 Testing admin login process...');
    
    const email = 'goshawkai1@gmail.com';
    const password = 'admin123';
    
    // Simulate the admin authentication process
    console.log('1. Looking up admin user...');
    const adminUser = await prisma.adminUser.findUnique({
      where: { email }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', adminUser.email);
    
    console.log('2. Verifying password...');
    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return;
    }
    
    console.log('✅ Password verified');
    
    console.log('3. Creating user object for NextAuth...');
    const userObject = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      isAdmin: true,
    };
    
    console.log('✅ User object created:', userObject);
    
    console.log('4. Testing database connection for admin operations...');
    
    // Test if we can query admin-specific data
    const adminStats = await prisma.adminUser.count();
    console.log('✅ Admin database operations working, total admin users:', adminStats);
    
    console.log('\n🎯 Admin authentication should work!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🌐 Try logging in at: https://ui.goshawkai.com/admin/login');
    
  } catch (error) {
    console.error('❌ Error testing admin login:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminLogin();
