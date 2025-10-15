const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testActualAPI() {
  try {
    console.log('🔍 Testing actual API data flow...');
    
    // Test what happens when we call the combined data function
    const { getCombinedData } = await import('./src/lib/combined-data.ts');
    
    const companies = ['acme-corp', 'tech-solutions', 'global-services'];
    
    for (const companyId of companies) {
      console.log(`\n🏢 Testing ${companyId}:`);
      
      try {
        const combinedData = await getCombinedData(companyId, {
          useMockRetell: false, // This should use mock data since we have mock spreadsheet IDs
        });
        
        console.log(`   📊 Appointments: ${combinedData.appointments.length}`);
        console.log(`   📞 Call Logs: ${combinedData.callLogs.length}`);
        
        if (combinedData.appointments.length > 0) {
          const firstAppointment = combinedData.appointments[0];
          console.log(`   👤 First customer: ${firstAppointment.name}`);
          console.log(`   📞 Phone: ${firstAppointment.phone}`);
          console.log(`   🆔 Appointment ID: ${firstAppointment.appointment_id}`);
          console.log(`   📍 Address: ${firstAppointment.address}`);
        }
        
        if (combinedData.callLogs.length > 0) {
          const firstCall = combinedData.callLogs[0];
          console.log(`   📞 Call phone: ${firstCall.customerPhone}`);
          console.log(`   🆔 Call ID: ${firstCall.callId}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testActualAPI();
