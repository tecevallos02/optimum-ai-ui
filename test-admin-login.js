const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login...');
    
    const adminUser = await prisma.adminUser.findFirst({
      where: { email: 'goshawkai1@gmail.com' }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', adminUser.email);
    console.log('Stored password hash:', adminUser.password);
    
    // Test password verification
    const testPassword = 'admin123';
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
    
    console.log('Password test result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password verification failed');
      console.log('Let me update the password...');
      
      // Update password
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Password updated successfully');
      
      // Test again
      const isPasswordValidAfterUpdate = await bcrypt.compare(testPassword, hashedPassword);
      console.log('Password test after update:', isPasswordValidAfterUpdate);
    } else {
      console.log('✅ Password verification successful');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminLogin();
