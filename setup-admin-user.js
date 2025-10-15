const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupAdminUser() {
  try {
    console.log('🔧 Setting up admin user...');

    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: 'goshawk1@gmail.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const adminUser = await prisma.adminUser.create({
      data: {
        email: 'goshawk1@gmail.com',
        name: 'Admin User',
        password: hashedPassword,
      }
    });

    console.log('✅ Admin user created successfully:');
    console.log('   Email:', adminUser.email);
    console.log('   Password: admin123');
    console.log('   ID:', adminUser.id);

  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdminUser();
