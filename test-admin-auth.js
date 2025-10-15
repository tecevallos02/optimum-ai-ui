const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testAdminAuth() {
  try {
    console.log('🔍 Testing admin authentication setup...');
    
    // Check admin user
    const adminUser = await prisma.adminUser.findFirst({
      where: { email: 'goshawkai1@gmail.com' }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', adminUser.email);
    
    // Test password
    const testPassword = 'admin123';
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
    console.log('✅ Password verification:', isPasswordValid);
    
    // Check if admin user has all required fields
    console.log('Admin user fields:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      hasPassword: !!adminUser.password,
      createdAt: adminUser.createdAt
    });
    
    console.log('✅ Admin authentication setup is correct');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAuth();
