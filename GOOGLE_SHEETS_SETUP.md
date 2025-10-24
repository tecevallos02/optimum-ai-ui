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
GOOGLE_SHEETS_CLIENT_EMAIL="goshawk-sheets-service@optimum-ai-test.iam.gserviceaccount.com"
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCPv4hfGY4OisKG\nVrj/0etDVqwIVcUEtrMLoCOuVHauu18OAPvam2yDmgwkx15JQwsC6MEMOHe6MpsR\npCh0kNbnC8JXFDVRNCxDYRQgarNwi+mf1FJhsx6eUS8N2I3kIgLqUukbYMe3FXHq\nlBz97mKFihXlI+Wy9W42llumaC3nMBlXyh3yV6PnAdCPWwUoK8CAkMqEuWGxdyAn\nJwpJVyR/P79NrCFGEm/RnSa/bIPoLXvhAzWBuWRb3/ZtARlbTf7RLNrzVTd8VixL\nvWt2fKvglZHByrPrOFzS/8ErsGfuFmukPEnTTtdrtf4LrSGtZZX3S3D3aceFIbeP\nNP7gQ8kRAgMBAAECggEALAjUUa2WYsYHCPgP++3mT96BHJyJmgQNnQYVaBXftW8Y\nk0Wh4TmzaC0Mg0e/jlnHScDbQk8Z/iP6dNEAw5SLAIQNqHc8Tf/Zf1qBu9xz04pI\nqvlzsxIX0w+zhl5MORJiKj3zwrtG8sLS/rUYnIEmFRpT0rnIZ6XfeUFeGf/X7/XK\ngdb7w1ilfR07TSyJcFjfjtmE4ovuim3WplzRDELXFshvKwBcn6njGgMdubNiJG+t\n277j7KVhNnhfJ2dho6Sq4ddjncazo0JS3Vm21RuSdxWwjd8V/i3t/eUroG9NC0yz\n8CeWXPdys9w5uZqWq6CsWbYWO2c7uCyv2NdDp0Q3MQKBgQDDC6tbbMnSn/b5dI6A\nsJU6gE2iooA16wZyi7Xu60qY77RSPtUg2F4if/DhWRyhTD9OB1tDAbJ1AEAd251E\n83VEQBjvsIR8VHTpQ2D0Whh7d13KOWv1fhZR6r8gDA/99abwRA2ZR2u7q1QbOOAP\npB96Rn7FstYRNiO/MCasV4y+3wKBgQC8q+QIA26XT+H6oBSBPhMU7IJbF9IFy+SZ\n953l2SDamX817W/SKmUn+9ouFFS7l3g5O1/UKEejXFF60knasRzxXcmiqhLEG50K\nHSoRn6aNt+sfKrozHL+MKLwlnfuLClD9bjcS1AmsXOILWZs74lBCOIv+cKCtzE8e\n6ZmdLMCmDwKBgFjK2DCfvuVG830uxazqNpVSUYWHasyg+OdumN1yehxTi4ihmA8C\n0R/tlLBSDAmWF3+jM7W2cRJ4kbfGAbuhBbKTZ4a+miGrpSmIBfxXg6u5dJYaO/6f\nbvPN5UJmm2Umzt+0a2hrLi1aWsilxML6GWZl71J7Dp75QZ7JAeIVXTqLAoGBAKA7\nMzwC/icPNpHM5d0lRLteaQ7H2hwGHy0LeFO95QMBnWHFNlQ8oRAl+hNsPNHcP8QL\nQsVBOCXqv2AZu5M5G6V4y0eUPL/D28i9H/87oQ12hv4/IUdLQPndlnw0AW8B4ep5\ncdhRr61sbKTLAuUGvLago3QBXtR7US6loUo0uZ/NAoGAKaHUpykMb8gc/zmpJwuC\ngE+rYmM1CMAaXuw49EmloVcc3O1T2PLqrWYkhloi1cvzV535vUoG4rRt/BpwDHQv\nrTGxKrAFBu7orhV28DvqwDXcmFi6uhroTyFJicYVf4sn0PaOHU5WVctGWKDszpLU\nIKp3AxpNooHE985sZ7Vj4P0=\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_PROJECT_ID="optimum-ai-test"

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
