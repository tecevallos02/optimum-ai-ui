const fetch = require('node-fetch');

async function testAdminStats() {
  try {
    console.log('🔍 Testing admin stats API...');
    
    const response = await fetch('https://ui.goshawkai.com/api/admin/stats');
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Stats data:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing admin stats:', error.message);
  }
}

testAdminStats();
