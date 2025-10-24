const fetch = require('node-fetch');

async function testSimpleAdmin() {
  try {
    console.log('🧪 Testing simple admin API...');
    
    const response = await fetch('https://ui.goshawkai.com/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'goshawkai1@gmail.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', data);
    
    if (response.ok) {
      console.log('✅ Simple admin API is working!');
    } else {
      console.log('❌ Simple admin API failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing simple admin:', error);
  }
}

testSimpleAdmin();
