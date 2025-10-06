const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test if we can query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 PostgreSQL version:', result[0].version);
    
    // Check if User table exists
    const userCount = await prisma.user.count();
    console.log('👥 Users in database:', userCount);
    
    console.log('🎉 Database is ready!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('the URL must start with the protocol')) {
      console.error('\n🔧 Fix: DATABASE_URL is missing or incorrect in Vercel environment variables');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('\n🔧 Fix: Network connection issue - check your Neon database is running');
    } else if (error.message.includes('authentication')) {
      console.error('\n🔧 Fix: Authentication failed - check your Neon credentials');
    } else if (error.message.includes('relation "User" does not exist')) {
      console.error('\n🔧 Fix: Database schema not set up - need to run migrations');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
