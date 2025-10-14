# Google Sheets Integration Setup Guide

## Overview
Each company needs their own Google Sheet with call data. This guide walks you through setting up company isolation with Google Sheets.

## Step 1: Create Google Sheets for Each Company

### For Each Company:
1. **Create a new Google Sheet** in your Google Drive
2. **Name it** something like "Acme Corporation - Call Data" 
3. **Set up the columns** in this exact order (A through H):

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| appointment_id | name | phone | datetime_iso | window | status | address | notes |

### Sample Data Format:
```
appointment_id | name | phone | datetime_iso | window | status | address | notes
APPT-001 | John Smith | +15551234567 | 2024-01-15T10:00:00Z | 9:00-10:00 AM | booked | 123 Main St | Customer interested in premium package
APPT-002 | Jane Doe | +15551234568 | 2024-01-15T14:30:00Z | 2:00-3:00 PM | completed | 456 Oak Ave | Follow up needed
```

## Step 2: Get Google Sheets API Credentials

### 2.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Sheets API**

### 2.2 Create Service Account
1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Name: `sheets-integration`
4. Description: `Service account for Google Sheets integration`
5. Click **Create and Continue**

### 2.3 Generate Service Account Key
1. Click on your service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Download the JSON file

### 2.4 Extract Credentials
From the downloaded JSON file, extract:
- `client_email` (looks like: `sheets-integration@your-project.iam.gserviceaccount.com`)
- `private_key` (the long string starting with `-----BEGIN PRIVATE KEY-----`)
- `project_id` (your Google Cloud project ID)

## Step 3: Update Environment Variables

Add these to your `.env` file:
```bash
# Google Sheets API Credentials
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account-email@project-id.iam.gserviceaccount.com"
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
GOOGLE_SHEETS_PROJECT_ID="your-google-cloud-project-id"
```

## Step 4: Share Google Sheets with Service Account

For each company's Google Sheet:
1. Open the Google Sheet
2. Click **Share** button (top right)
3. Add the service account email (from step 2.4)
4. Give it **Editor** permissions
5. Click **Send**

## Step 5: Update Database with Real Spreadsheet IDs

1. **Get the Spreadsheet ID** from each Google Sheet URL:
   - URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - Copy the `SPREADSHEET_ID_HERE` part

2. **Update the setup script** (`setup-companies.js`):
   ```javascript
   const companies = [
     {
       id: 'acme-corp',
       name: 'Acme Corporation',
       sheets: {
         spreadsheetId: '1ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ', // Replace with real ID
         dataRange: 'Calls!A:H'
       },
       phones: ['+15551234567', '+15551234568']
     },
     // ... other companies
   ];
   ```

3. **Run the setup script**:
   ```bash
   node setup-companies.js
   ```

## Step 6: Test the Integration

1. **Start your application**:
   ```bash
   npm run dev
   ```

2. **Check the dashboard** - it should now load data from Google Sheets

3. **Verify company isolation** - each company should only see their own data

## Step 7: Set Up N8N Webhook (Optional)

To automatically update the UI when new data is added to Google Sheets:

1. **Create N8N workflow** that triggers when Google Sheet is updated
2. **Add webhook node** that calls: `POST /api/webhooks/sheet-update`
3. **Test the webhook** by adding a row to a Google Sheet

## Data Flow

```
Google Sheets (Company A) → N8N → Webhook → Your App → Dashboard
Google Sheets (Company B) → N8N → Webhook → Your App → Dashboard
Google Sheets (Company C) → N8N → Webhook → Your App → Dashboard
```

## Troubleshooting

### Common Issues:
1. **"No company found"** - Run the setup script
2. **"Google Sheet configuration not found"** - Check spreadsheet ID in database
3. **"Permission denied"** - Make sure service account has Editor access to sheets
4. **"Invalid credentials"** - Check your .env file format

### Debug Steps:
1. Check database: `npx prisma studio`
2. Check logs: Look at browser console and server logs
3. Test API directly: `GET /api/me/company`

## Security Notes

- ✅ Each company only sees their own data
- ✅ Service account has minimal permissions (only sheets access)
- ✅ No client-side Google Sheets credentials
- ✅ All data validation happens server-side
