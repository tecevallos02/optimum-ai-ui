import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample business organizations
  const organizations = [
    {
      name: 'Acme Dental Practice',
      description: 'Family dental practice serving the community for 20+ years'
    },
    {
      name: 'TechStart Solutions',
      description: 'Software development company specializing in web applications'
    },
    {
      name: 'Green Valley Law Firm',
      description: 'Full-service law firm with expertise in business and real estate'
    },
    {
      name: 'Sunrise Medical Center',
      description: 'Multi-specialty medical practice with 15+ providers'
    },
    {
      name: 'Elite Fitness Studio',
      description: 'Premium fitness and wellness center with personal training'
    }
  ]

  // Create organizations
  const createdOrgs = []
  for (const orgData of organizations) {
    const org = await prisma.organization.create({
      data: {
        name: orgData.name,
      }
    })
    createdOrgs.push(org)
    console.log(`✅ Created organization: ${org.name}`)
  }

  // Create sample users for each organization
  const users = [
    // Acme Dental Practice
    {
      email: 'dr.smith@acmedental.com',
      name: 'Dr. Sarah Smith',
      role: Role.OWNER,
      orgName: 'Acme Dental Practice'
    },
    {
      email: 'reception@acmedental.com',
      name: 'Jennifer Wilson',
      role: Role.MANAGER,
      orgName: 'Acme Dental Practice'
    },
    {
      email: 'assistant@acmedental.com',
      name: 'Mike Johnson',
      role: Role.AGENT,
      orgName: 'Acme Dental Practice'
    },
    // TechStart Solutions
    {
      email: 'ceo@techstart.com',
      name: 'Alex Chen',
      role: Role.OWNER,
      orgName: 'TechStart Solutions'
    },
    {
      email: 'cto@techstart.com',
      name: 'Maria Rodriguez',
      role: Role.MANAGER,
      orgName: 'TechStart Solutions'
    },
    // Green Valley Law Firm
    {
      email: 'partner@greenvalleylaw.com',
      name: 'Robert Thompson',
      role: Role.OWNER,
      orgName: 'Green Valley Law Firm'
    },
    {
      email: 'paralegal@greenvalleylaw.com',
      name: 'Lisa Davis',
      role: Role.AGENT,
      orgName: 'Green Valley Law Firm'
    },
    // Sunrise Medical Center
    {
      email: 'admin@sunrisemedical.com',
      name: 'Dr. Michael Brown',
      role: Role.OWNER,
      orgName: 'Sunrise Medical Center'
    },
    {
      email: 'nurse@sunrisemedical.com',
      name: 'Sarah Lee',
      role: Role.MANAGER,
      orgName: 'Sunrise Medical Center'
    },
    // Elite Fitness Studio
    {
      email: 'owner@elitefitness.com',
      name: 'David Martinez',
      role: Role.OWNER,
      orgName: 'Elite Fitness Studio'
    },
    {
      email: 'trainer@elitefitness.com',
      name: 'Jessica Taylor',
      role: Role.AGENT,
      orgName: 'Elite Fitness Studio'
    }
  ]

  // Create users and memberships
  for (const userData of users) {
    const org = createdOrgs.find(o => o.name === userData.orgName)
    if (!org) continue

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        emailVerified: new Date(),
      }
    })

    // Create membership
    await prisma.membership.create({
      data: {
        userId: user.id,
        orgId: org.id,
        role: userData.role,
      }
    })

    console.log(`✅ Created user: ${user.name} (${user.email}) as ${userData.role} in ${org.name}`)
  }

  // Create sample contacts for each organization
  const contacts = [
    // Acme Dental Practice contacts
    { name: 'John Smith', email: 'john.smith@email.com', phone: '555-0101', orgName: 'Acme Dental Practice', tags: ['VIP', 'Regular'] },
    { name: 'Mary Johnson', email: 'mary.johnson@email.com', phone: '555-0102', orgName: 'Acme Dental Practice', tags: ['New Patient'] },
    { name: 'Bob Wilson', email: 'bob.wilson@email.com', phone: '555-0103', orgName: 'Acme Dental Practice', tags: ['Insurance'] },
    
    // TechStart Solutions contacts
    { name: 'Alice Cooper', email: 'alice@techcorp.com', phone: '555-0201', orgName: 'TechStart Solutions', tags: ['Enterprise', 'Hot Lead'] },
    { name: 'Tom Anderson', email: 'tom@startup.io', phone: '555-0202', orgName: 'TechStart Solutions', tags: ['SMB'] },
    
    // Green Valley Law Firm contacts
    { name: 'Jane Doe', email: 'jane.doe@email.com', phone: '555-0301', orgName: 'Green Valley Law Firm', tags: ['Real Estate', 'Client'] },
    { name: 'Richard Roe', email: 'richard.roe@email.com', phone: '555-0302', orgName: 'Green Valley Law Firm', tags: ['Business Law'] },
    
    // Sunrise Medical Center contacts
    { name: 'Patient One', email: 'patient1@email.com', phone: '555-0401', orgName: 'Sunrise Medical Center', tags: ['Emergency', 'VIP'] },
    { name: 'Patient Two', email: 'patient2@email.com', phone: '555-0402', orgName: 'Sunrise Medical Center', tags: ['Routine'] },
    
    // Elite Fitness Studio contacts
    { name: 'Fitness Enthusiast', email: 'fitness@email.com', phone: '555-0501', orgName: 'Elite Fitness Studio', tags: ['Premium', 'Personal Training'] },
    { name: 'New Member', email: 'newmember@email.com', phone: '555-0502', orgName: 'Elite Fitness Studio', tags: ['Trial'] }
  ]

  for (const contactData of contacts) {
    const org = createdOrgs.find(o => o.name === contactData.orgName)
    if (!org) continue

    await prisma.contact.create({
      data: {
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        tags: contactData.tags,
        notes: `Contact for ${contactData.orgName}`,
        orgId: org.id,
      }
    })

    console.log(`✅ Created contact: ${contactData.name} for ${org.name}`)
  }

  // Create sample audit logs
  const auditActions = [
    'User logged in',
    'Contact created',
    'Appointment scheduled',
    'Settings updated',
    'Report generated',
    'User invited',
    'Contact updated',
    'Appointment cancelled'
  ]

  for (let i = 0; i < 20; i++) {
    const org = createdOrgs[Math.floor(Math.random() * createdOrgs.length)]
    const users = await prisma.user.findMany({
      where: {
        memberships: {
          some: { orgId: org.id }
        }
      }
    })
    
    if (users.length > 0) {
      const user = users[Math.floor(Math.random() * users.length)]
      const action = auditActions[Math.floor(Math.random() * auditActions.length)]
      
      await prisma.auditLog.create({
        data: {
          orgId: org.id,
          actorId: user.id,
          action: action,
          target: action.includes('Contact') ? 'contact' : action.includes('Appointment') ? 'appointment' : 'system',
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      })
    }
  }

  console.log('✅ Created sample audit logs')

  console.log('🎉 Database seed completed successfully!')
  console.log(`📊 Created:`)
  console.log(`   - ${createdOrgs.length} organizations`)
  console.log(`   - ${users.length} users`)
  console.log(`   - ${contacts.length} contacts`)
  console.log(`   - 20 audit log entries`)
  
  console.log('\n🔑 Test accounts created:')
  console.log('   - dr.smith@acmedental.com (Owner of Acme Dental Practice)')
  console.log('   - ceo@techstart.com (Owner of TechStart Solutions)')
  console.log('   - partner@greenvalleylaw.com (Owner of Green Valley Law Firm)')
  console.log('   - admin@sunrisemedical.com (Owner of Sunrise Medical Center)')
  console.log('   - owner@elitefitness.com (Owner of Elite Fitness Studio)')
  console.log('\n💡 Use email authentication to sign in with any of these accounts!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
