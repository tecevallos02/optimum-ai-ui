const fetch = require('node-fetch');

async function testAPIData() {
  try {
    console.log('Testing API data for different companies...');
    
    // Test the KPIs API for different companies
    // Note: This will only work if you're logged in as different users
    console.log('\n📊 Testing KPIs API...');
    
    try {
      const response = await fetch('http://localhost:3000/api/kpis');
      const data = await response.json();
      console.log('KPIs Response:', data);
    } catch (error) {
      console.log('❌ API Error (expected if not logged in):', error.message);
    }
    
    console.log('\n🔍 The issue might be:');
    console.log('1. Both emails are linked to the same company');
    console.log('2. The company-specific mock data is not being generated correctly');
    console.log('3. The API is not passing the companyId correctly');
    
    console.log('\n💡 To fix this:');
    console.log('1. Check which company each email is linked to');
    console.log('2. Make sure each company has unique mock data');
    console.log('3. Verify the API is using the correct companyId');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPIData();
