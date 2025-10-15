const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log('🔍 Checking admin user...');
    
    const adminUser = await prisma.adminUser.findFirst({
      where: { email: 'goshawkai1@gmail.com' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log('Email:', adminUser.email);
      console.log('ID:', adminUser.id);
      console.log('Name:', adminUser.name);
      console.log('Created:', adminUser.createdAt);
    } else {
      console.log('❌ Admin user not found with email: goshawkai1@gmail.com');
      
      // Check all admin users
      const allAdmins = await prisma.adminUser.findMany();
      console.log('All admin users:');
      allAdmins.forEach(admin => {
        console.log('- Email:', admin.email, 'ID:', admin.id);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
