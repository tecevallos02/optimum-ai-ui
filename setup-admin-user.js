const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 Setting up admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: 'goshawkai1@gmail.com' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const adminUser = await prisma.adminUser.create({
      data: {
        email: 'goshawkai1@gmail.com',
        name: 'Admin User',
        password: hashedPassword,
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: goshawkai1@gmail.com');
    console.log('🔑 Password: admin123');
    console.log('🌐 Login at: https://ui.goshawkai.com/admin/login');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
