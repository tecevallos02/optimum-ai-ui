# Setting Up Real Google Sheet Data

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Optimum AI - Calls Data"
4. Copy the spreadsheet ID from the URL (the long string after `/d/` and before `/edit`)

## Step 2: Set Up the Sheet Structure

Create a sheet named "Calls" with these columns in row 1:
- A: appointment_id
- B: name  
- C: phone
- D: datetime_iso
- E: window
- F: status
- G: address
- H: notes

## Step 3: Add Sample Data

Add some sample rows like:
```
APPT-001 | John Smith | +15551234567 | 2024-01-15T10:00:00Z | 9:00-10:00 AM | booked | 123 Main St | Customer interested in consultation
APPT-002 | Jane Doe | +15551234568 | 2024-01-15T14:30:00Z | 2:00-3:00 PM | scheduled | 456 Oak Ave | Follow-up appointment
APPT-003 | Bob Johnson | +15551234569 | 2024-01-16T09:15:00Z | 9:00-10:00 AM | confirmed | 789 Pine St | New customer inquiry
```

## Step 4: Share the Sheet

1. Click "Share" in the top right
2. Add this email: `goshawk-sheets-service@optimum-ai-test.iam.gserviceaccount.com`
3. Give it "Editor" permissions
4. Click "Send"

## Step 5: Update Database

Run this command with your actual spreadsheet ID:
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.companySheet.updateMany({
  data: { spreadsheetId: 'YOUR_ACTUAL_SPREADSHEET_ID_HERE' }
}).then(() => {
  console.log('✅ Database updated with real Google Sheet ID');
  prisma.\$disconnect();
});
"
```

Replace `YOUR_ACTUAL_SPREADSHEET_ID_HERE` with your actual spreadsheet ID.

## Step 6: Test

After updating the database, your dashboard should show real data from your Google Sheet instead of mock data.
