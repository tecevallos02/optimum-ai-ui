const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user with password...');
    
    // Hash a simple password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create or update a test user
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        password: hashedPassword,
        emailVerified: new Date(),
        companyId: 'acme-corp'
      },
      create: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        emailVerified: new Date(),
        companyId: 'acme-corp'
      }
    });
    
    console.log('✅ Test user created/updated:', user.email);
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
    console.log('🏢 Company: Acme Corporation');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
