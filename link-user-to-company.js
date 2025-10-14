const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function linkUserToCompany() {
  try {
    console.log('Linking users to companies...');

    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name || 'No name'})`);
    });

    // Get all companies
    const companies = await prisma.company.findMany({
      select: { id: true, name: true }
    });

    console.log(`\nFound ${companies.length} companies:`);
    companies.forEach(company => {
      console.log(`- ${company.name} (${company.id})`);
    });

    if (users.length === 0) {
      console.log('\n❌ No users found. Please create a user account first.');
      return;
    }

    if (companies.length === 0) {
      console.log('\n❌ No companies found. Please run setup-companies.js first.');
      return;
    }

    // For this example, we'll link the first user to the first company
    // In a real app, you'd have a more sophisticated user-company assignment logic
    const user = users[0];
    const company = companies[0];

    console.log(`\n🔗 Linking user ${user.email} to company ${company.name}...`);

    // Update user with companyId
    await prisma.user.update({
      where: { id: user.id },
      data: { companyId: company.id }
    });

    console.log('✅ User linked to company successfully!');
    console.log(`\n📋 User ${user.email} is now associated with ${company.name}`);
    console.log('This user will now see data from this company\'s Google Sheet.');

  } catch (error) {
    console.error('Error linking user to company:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkUserToCompany();
