# 🏢 Client Onboarding Process - Optimum AI

This guide shows you how to add new clients to your system **without changing any code**. Each client gets complete isolation with their own Google Sheets and Retell webhook.

## 🚀 Quick Start Process

### **Step 1: Add New Client**
```bash
node add-new-client.js
```

**What you'll need:**
- Company name (e.g., "P&J Air Conditioning")
- User email (who will access this company)
- Phone number (E.164 format: +15551234567)
- Google Sheet ID (or "mock" for testing)
- Retell Workflow ID (or "mock" for testing)
- Retell API Key (or "mock" for testing)

### **Step 2: Update with Real Credentials**
```bash
node update-client-credentials.js
```

**When you get real credentials:**
- Google Sheet ID from client's actual sheet
- Retell Workflow ID from Retell dashboard
- Retell API Key from Retell dashboard

### **Step 3: Configure n8n Webhook**
```bash
node setup-n8n-webhook.js
```

**For n8n integration:**
- n8n webhook URL for this specific client
- This forwards Retell data to n8n for Google Sheets updates

## 🔧 What Happens Automatically

### **Company Isolation:**
✅ Each client gets unique company ID (e.g., `pj-air-conditioning`)  
✅ User is linked to only their company  
✅ All data is scoped by company ID  
✅ No cross-client data access possible  

### **Google Sheets Integration:**
✅ Each client has their own spreadsheet ID  
✅ n8n updates their specific sheet  
✅ Data flows: Retell → Your UI → n8n → Client's Google Sheet  
✅ Real-time updates without code changes  

### **Retell Webhook:**
✅ Each client gets unique webhook URL: `/api/webhooks/retell/{company-id}`  
✅ Retell data is automatically forwarded to n8n  
✅ UI updates in real-time when calls come in  

## 📋 Example: Adding P&J Air Conditioning

### **1. Run the script:**
```bash
node add-new-client.js
```

### **2. Enter the information:**
```
📝 Company Name: P&J Air Conditioning
👤 User Email: tecevallos@hotmail.com
📞 Phone Number: +15557778888
📊 Google Sheet ID: mock
🤖 Retell Workflow ID: mock
🔑 Retell API Key: mock
```

### **3. Get real credentials from client:**
- Ask client to create Google Sheet
- Set up Retell workflow for their phone number
- Get the actual IDs and keys

### **4. Update with real data:**
```bash
node update-client-credentials.js
```

### **5. Configure n8n:**
```bash
node setup-n8n-webhook.js
```

## 🔄 Data Flow

```
Client Phone Call
    ↓
Retell AI (handles call)
    ↓
Retell Webhook → Your UI (/api/webhooks/retell/{company-id})
    ↓
Your UI (displays real-time data)
    ↓
n8n Webhook (updates client's Google Sheet)
    ↓
Client's Google Sheet (permanent record)
```

## 🎯 Key Benefits

✅ **Zero Code Changes** - Add clients without touching code  
✅ **Complete Isolation** - Each client sees only their data  
✅ **Real-time Updates** - UI updates when calls come in  
✅ **Automatic n8n Integration** - Data flows to client's Google Sheet  
✅ **Scalable** - Add unlimited clients easily  
✅ **Secure** - No cross-client data access possible  

## 🛠️ Management Commands

### **List all clients:**
```bash
node list-clients.js
```

### **Update client credentials:**
```bash
node update-client-credentials.js
```

### **Test client webhook:**
```bash
node test-client-webhook.js
```

### **Remove client:**
```bash
node remove-client.js
```

## 🔐 Security Notes

- Each client has their own company ID
- User sessions are scoped to their company
- API routes validate company ownership
- No client can access another client's data
- Webhooks are company-specific

## 📞 Support

If you need to modify the system:
1. **Add new fields** - Update the database schema
2. **Change webhook format** - Update the webhook handler
3. **Add new integrations** - Create new API routes

But for normal client onboarding, you never need to touch the code!
