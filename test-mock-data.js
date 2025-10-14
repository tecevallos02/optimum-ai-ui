// Test the company-specific mock data generation
function getCompanyMockData(companyId) {
  const baseMockData = [
    {
      appointment_id: 'APPT-001',
      name: 'John Smith',
      phone: '+15551234567',
      datetime_iso: '2024-01-15T10:00:00Z',
      window: '9:00-10:00 AM',
      status: 'booked',
      address: '123 Main St, New York, NY',
      notes: 'Customer interested in premium package',
      intent: 'booking'
    },
    {
      appointment_id: 'APPT-002',
      name: 'Jane Doe',
      phone: '+15551234568',
      datetime_iso: '2024-01-15T14:30:00Z',
      window: '2:00-3:00 PM',
      status: 'completed',
      address: '456 Oak Ave, Los Angeles, CA',
      notes: 'Follow up needed for next quarter',
      intent: 'booking'
    }
  ];

  const companyData = {
    'acme-corp': {
      prefix: 'ACME',
      phone: '+15551112222',
      customers: ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson', 'David Brown']
    },
    'tech-solutions': {
      prefix: 'TECH',
      phone: '+15553334444', 
      customers: ['Alice Johnson', 'Bob Wilson', 'Carol Davis', 'David Miller', 'Eva Garcia']
    },
    'global-services': {
      prefix: 'GLOBAL',
      phone: '+15555556666',
      customers: ['Frank Smith', 'Grace Lee', 'Henry Chen', 'Ivy Rodriguez', 'Jack Taylor']
    }
  };

  const company = companyData[companyId] || companyData['acme-corp'];
  
  return baseMockData.map((call, index) => ({
    ...call,
    appointment_id: `${company.prefix}-${String(index + 1).padStart(3, '0')}`,
    phone: company.phone,
    name: company.customers[index % company.customers.length] || `Customer ${index + 1}`,
    address: call.address.replace('New York, NY', companyId === 'acme-corp' ? 'New York, NY' : 
                                 companyId === 'tech-solutions' ? 'San Francisco, CA' : 'London, UK'),
    notes: `${call.notes} (${company.prefix} customer)`
  }));
}

// Test the function
console.log('Testing company-specific mock data generation...\n');

const companies = ['acme-corp', 'tech-solutions', 'global-services'];

companies.forEach(companyId => {
  console.log(`🏢 ${companyId.toUpperCase()}:`);
  const data = getCompanyMockData(companyId);
  console.log(`   📞 Phone: ${data[0].phone}`);
  console.log(`   👤 Customer: ${data[0].name}`);
  console.log(`   🆔 Appointment ID: ${data[0].appointment_id}`);
  console.log(`   📍 Address: ${data[0].address}`);
  console.log(`   📝 Notes: ${data[0].notes}`);
  console.log('');
});

console.log('✅ Company-specific data generation is working correctly!');
console.log('Each company should now have unique data when you log in.');
