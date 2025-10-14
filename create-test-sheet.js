const { google } = require('googleapis');

async function createTestSheet() {
  try {
    console.log('Creating test Google Sheet...');

    // Initialize Google Sheets API
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    // Create a new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'Optimum AI - Test Calls Data',
        },
        sheets: [
          {
            properties: {
              title: 'Calls',
              gridProperties: {
                rowCount: 1000,
                columnCount: 8,
              },
            },
          },
        ],
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    console.log(`✅ Created spreadsheet: ${spreadsheetId}`);
    console.log(`📊 URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);

    // Add sample data
    const sampleData = [
      ['appointment_id', 'name', 'phone', 'datetime_iso', 'window', 'status', 'address', 'notes'],
      ['apt_001', 'John Smith', '+15551234567', '2024-01-15T10:00:00Z', '9:00-10:00 AM', 'booked', '123 Main St', 'Customer interested in consultation'],
      ['apt_002', 'Jane Doe', '+15559876543', '2024-01-15T14:30:00Z', '2:00-3:00 PM', 'scheduled', '456 Oak Ave', 'Follow-up appointment'],
      ['apt_003', 'Bob Johnson', '+15555551234', '2024-01-16T09:15:00Z', '9:00-10:00 AM', 'confirmed', '789 Pine St', 'New customer inquiry'],
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Calls!A1:H4',
      valueInputOption: 'RAW',
      requestBody: {
        values: sampleData,
      },
    });

    console.log('✅ Added sample data to the sheet');

    return spreadsheetId;
  } catch (error) {
    console.error('❌ Error creating test sheet:', error);
    throw error;
  }
}

createTestSheet();
