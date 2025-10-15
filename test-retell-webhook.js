const fetch = require('node-fetch');

async function testRetellWebhook() {
  try {
    console.log('🧪 Testing Retell webhook...\n');

    // Test webhook for Acme Corporation
    const companyId = 'acme-corp';
    const webhookUrl = `https://ui.goshawkai.com/api/webhooks/retell/${companyId}`;
    
    const testPayload = {
      call_id: 'test-call-123',
      workflow_id: 'test-workflow-456',
      customer_phone: '+15551112222',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 300000).toISOString(), // 5 minutes later
      duration: 300, // 5 minutes
      status: 'completed',
      time_saved: 180, // 3 minutes saved
      cost: 0.15,
      transcript: 'Test call transcript - customer called to book an appointment',
      summary: 'Customer wants to schedule a consultation for next week',
      metadata: {
        intent: 'booking',
        customer_name: 'John Smith',
        appointment_requested: true
      }
    };

    console.log(`📞 Sending test webhook to: ${webhookUrl}`);
    console.log('📋 Payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Webhook test successful!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Webhook test failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Error testing webhook:', error);
  }
}

testRetellWebhook();
