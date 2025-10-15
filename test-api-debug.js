const fetch = require('node-fetch');

async function testApiDebug() {
  try {
    console.log('🔍 Testing API debugging...\n');

    // Test the KPIs API
    console.log('📊 Testing /api/kpis...');
    const kpisResponse = await fetch('https://ui.goshawkai.com/api/kpis', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (kpisResponse.ok) {
      const kpisData = await kpisResponse.json();
      console.log('✅ KPIs API Response:', JSON.stringify(kpisData, null, 2));
    } else {
      console.log('❌ KPIs API Error:', kpisResponse.status, kpisResponse.statusText);
      const errorText = await kpisResponse.text();
      console.log('Error details:', errorText);
    }

    console.log('\n📅 Testing /api/appointments...');
    const appointmentsResponse = await fetch('https://ui.goshawkai.com/api/appointments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (appointmentsResponse.ok) {
      const appointmentsData = await appointmentsResponse.json();
      console.log('✅ Appointments API Response:', JSON.stringify(appointmentsData, null, 2));
    } else {
      console.log('❌ Appointments API Error:', appointmentsResponse.status, appointmentsResponse.statusText);
      const errorText = await appointmentsResponse.text();
      console.log('Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testApiDebug();
