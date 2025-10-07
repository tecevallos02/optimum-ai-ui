#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Neon PostgreSQL for Goshawk AI UI...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${generateSecret()}

# Neon PostgreSQL Database
# Replace with your actual Neon connection string from https://console.neon.tech/
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Email Configuration (for production)
EMAIL_FROM=noreply@yourdomain.com

# OAuth Providers (optional - set to placeholder values if not configured)
GOOGLE_CLIENT_ID=placeholder-google-client-id
GOOGLE_CLIENT_SECRET=placeholder-google-client-secret
AZURE_AD_CLIENT_ID=placeholder-azure-client-id
AZURE_AD_CLIENT_SECRET=placeholder-azure-client-secret
AZURE_AD_TENANT_ID=placeholder-azure-tenant-id
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
} else {
  console.log('✅ .env.local file already exists');
}

console.log('\n📋 Next steps:');
console.log('1. Go to https://console.neon.tech/ and create a new project');
console.log('2. Copy your PostgreSQL connection string');
console.log('3. Update DATABASE_URL in .env.local with your Neon connection string');
console.log('4. Run: npm run db:push');
console.log('5. Run: npm run db:seed');
console.log('6. Run: npm run dev');
console.log('\n🎯 This will create real business client accounts ready for production!');

function generateSecret() {
  return require('crypto').randomBytes(32).toString('base64');
}
