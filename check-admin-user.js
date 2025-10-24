const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log('🔍 Checking admin user...');
    
    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: 'goshawkai1@gmail.com' }
    });
    
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', adminUser.name);
    console.log('🔑 Has password:', !!adminUser.password);
    
    // Test password
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, adminUser.password);
    console.log('🔐 Password "admin123" is valid:', isValid);
    
    if (!isValid) {
      console.log('🔄 Resetting password...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.adminUser.update({
        where: { email: 'goshawkai1@gmail.com' },
        data: { password: hashedPassword }
      });
      console.log('✅ Password reset to "admin123"');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
