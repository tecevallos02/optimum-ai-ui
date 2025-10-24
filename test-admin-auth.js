const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testAdminAuth() {
  try {
    console.log('🔐 Testing admin authentication...');
    
    const email = 'goshawkai1@gmail.com';
    const password = 'admin123';
    
    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', adminUser.email);
    
    // Test password verification
    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    console.log('🔑 Password verification:', isValidPassword);
    
    if (isValidPassword) {
      console.log('✅ Admin credentials are valid!');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('🌐 Try logging in at: https://ui.goshawkai.com/admin/login');
    } else {
      console.log('❌ Password verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing admin auth:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAuth();
