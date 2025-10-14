const { google } = require('googleapis');
require('dotenv').config();

async function testGoogleSheets() {
  try {
    console.log('Testing Google Sheets API credentials...');
    
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Test with a public Google Sheet (this will work even without sharing)
    const testSpreadsheetId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'; // Google's sample sheet
    
    console.log('✅ Credentials loaded successfully');
    console.log(`📧 Service Account: ${process.env.GOOGLE_SHEETS_CLIENT_EMAIL}`);
    console.log(`🏗️ Project ID: ${process.env.GOOGLE_SHEETS_PROJECT_ID}`);
    
    // Test API access
    const response = await sheets.spreadsheets.get({
      spreadsheetId: testSpreadsheetId,
    });
    
    console.log('✅ Google Sheets API access successful!');
    console.log(`📊 Test sheet title: ${response.data.properties.title}`);
    console.log('\n🎉 Your credentials are working correctly!');
    console.log('\nNext steps:');
    console.log('1. Create Google Sheets for your companies');
    console.log('2. Share them with your service account email');
    console.log('3. Update the database with real spreadsheet IDs');
    
  } catch (error) {
    console.error('❌ Error testing Google Sheets API:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file format');
    console.log('2. Make sure the private key includes \\n for newlines');
    console.log('3. Verify the service account email is correct');
  }
}

testGoogleSheets();
