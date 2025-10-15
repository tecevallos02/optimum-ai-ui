const fetch = require('node-fetch');

async function testAdminEndpoint() {
  try {
    console.log('🔍 Testing admin auth endpoint...');
    
    // Test the admin auth endpoint
    const response = await fetch('https://ui.goshawkai.com/api/admin/auth/providers');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Admin auth endpoint is accessible');
      console.log('Available providers:', Object.keys(data));
    } else {
      console.log('❌ Admin auth endpoint error:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('❌ Error testing admin endpoint:', error.message);
  }
}

testAdminEndpoint();
