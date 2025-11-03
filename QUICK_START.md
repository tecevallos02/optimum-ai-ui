# Quick Start Guide - AI Receptionist Platform

## 🚀 Get Started in 5 Steps

### Step 1: Deploy to Vercel (5 minutes)

```bash
# Make sure everything is committed
git add .
git commit -m "Add AI Receptionist features"
git push origin main

# Deploy to Vercel (if not auto-deployed)
vercel --prod
```

**Add Environment Variables in Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `ENCRYPTION_KEY` = `uViSzKFtq7aXeKnQXma4p2HPWCZ4nOSrC5aRROqCktQ=`
   - `RETELL_WEBHOOK_BASE_URL` = `https://your-domain.vercel.app`
   - (Optional) `N8N_INSTANCE_URL`, `RETELL_API_KEY`

### Step 2: Run Database Migration (2 minutes)

**Option A: From local machine**
```bash
npx prisma migrate deploy
```

**Option B: From Vercel**
- Redeploy your app (migrations run automatically via build command)

**Verify:**
```bash
npx prisma studio
# Check that new tables exist: OrganizationRetell, OrganizationN8n, CallLog, WorkflowExecution
```

### Step 3: Create Your First Organization (3 minutes)

**Option A: Via Admin UI**
1. Go to `https://your-domain.vercel.app/admin/simple-login`
2. Login with admin credentials
3. Click "Organizations" → "New Organization"
4. Enter name, timezone, save

**Option B: Via Prisma Studio**
```bash
npx prisma studio
```
1. Go to Organization model
2. Click "Add record"
3. Fill in:
   - name: "Test Company"
   - timezone: "America/New_York"
   - Save

### Step 4: Setup Retell AI (10 minutes)

**4.1: Create Retell Agent**
1. Go to https://app.retellai.com/
2. Sign up / Login
3. Click "Create Agent"
4. Configure:
   - Name: "Test Receptionist"
   - Voice: Choose your preferred voice
   - Language: English (US)
   - Save and copy Agent ID

**4.2: Configure in Your Platform**
1. Go to `/admin/organizations`
2. Click on your test organization
3. Click "Retell" tab
4. Fill in:
   - Agent ID: (from Retell)
   - API Key: (from Retell Settings → API Keys)
   - Custom Prompt: "You are a friendly receptionist for [Your Company]. Help customers book appointments."
   - Voice ID: (optional, from Retell)
   - Language: en-US
   - Check "Active"
   - Save

**4.3: Configure Webhook in Retell**
1. In Retell Dashboard → Agent Settings
2. Go to "Webhooks" section
3. Add webhook URL: `https://your-domain.vercel.app/api/webhooks/retell`
4. Copy the webhook secret
5. Save it in your platform (Retell tab will show it after saving config)

### Step 5: Make Test Call (5 minutes)

**5.1: Get Phone Number**
1. In Retell Dashboard → Phone Numbers
2. Purchase a phone number (or use test number)
3. Link it to your agent

**5.2: Call and Test**
1. Call the phone number
2. Talk to the AI receptionist
3. Try booking an appointment

**5.3: Verify Data**
1. Go to `/admin/organizations/[orgId]`
2. Click "Calls" tab
3. Check if your call appears
4. Verify call log has:
   - Duration
   - Transcript
   - Status

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Database migration applied (new tables exist)
- [ ] Environment variables set in Vercel
- [ ] Organization created
- [ ] Retell agent configured
- [ ] Webhook URL added in Retell
- [ ] Test call made
- [ ] Call log appears in admin panel
- [ ] No errors in Vercel logs

---

## 🎯 Next: Add n8n Automation (Optional, 15 minutes)

### 1. Setup n8n

**Option A: Cloud (Easiest)**
- Sign up at https://n8n.io/
- Use their cloud instance

**Option B: Self-Hosted**
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 2. Create Workflow

1. Create new workflow in n8n
2. Add **Webhook** trigger:
   - Path: `/retell/[orgId]`
   - Method: POST
   - Save and copy webhook URL

3. Add **Function** node:
   ```javascript
   // Extract call data
   const callData = items[0].json;
   const intent = callData.analysis?.intent;

   return [{
     json: {
       intent,
       customerPhone: callData.customerPhone,
       transcript: callData.transcript
     }
   }];
   ```

4. Add **Switch** node:
   - Based on `intent`
   - Routes: BOOKING, QUOTE, COMPLAINT, OTHER

5. For BOOKING route, add your logic:
   - Create appointment in your database
   - Send confirmation email
   - Update CRM
   - etc.

6. Activate workflow

### 3. Configure in Platform

1. Go to `/admin/organizations/[orgId]`
2. Click "n8n" tab
3. Fill in:
   - n8n Instance URL: `https://your-n8n.com`
   - Workflow ID: (from n8n)
   - API Key: (from n8n Settings → API)
   - Webhook URL: (from n8n webhook node)
   - Check "Active"
   - Save

### 4. Test

1. Make another test call
2. Book an appointment (say "I'd like to book an appointment")
3. Check n8n executions
4. Verify workflow was triggered
5. Check if appointment was created

---

## 🔧 Common Issues & Fixes

### Issue 1: Webhook not receiving calls

**Check:**
```bash
# Check Vercel logs
vercel logs --follow

# Test webhook manually
curl -X POST https://your-domain.vercel.app/api/webhooks/retell \
  -H "Content-Type: application/json" \
  -d '{"event":"call_ended","call":{"call_id":"test","agent_id":"agent_test"}}'
```

**Fix:**
- Verify webhook URL in Retell is correct
- Check webhook secret matches
- Ensure no trailing slashes

### Issue 2: Database connection fails

**Fix:**
```bash
# Verify DATABASE_URL in .env.local
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

### Issue 3: Encryption error

**Fix:**
```bash
# Regenerate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Update in Vercel environment variables
```

### Issue 4: n8n workflow not triggering

**Fix:**
- Check workflow is activated (toggle in n8n)
- Verify webhook URL is correct
- Check n8n execution logs
- Test webhook directly in n8n

---

## 📱 Test Scenarios

### Scenario 1: Booking Appointment

**Script:**
"Hi, I'd like to book a haircut appointment for tomorrow at 2 PM. My name is John Smith and my phone is 555-1234."

**Expected:**
- Call logged in database
- Intent: BOOKING
- n8n workflow triggered
- Appointment created
- Confirmation sent

### Scenario 2: Asking for Quote

**Script:**
"How much does a haircut cost?"

**Expected:**
- Call logged
- Intent: QUOTE
- n8n workflow could send pricing info

### Scenario 3: Complaint

**Script:**
"I'm calling to complain about my last appointment."

**Expected:**
- Call logged
- Intent: COMPLAINT
- n8n workflow creates support ticket

---

## 📊 Monitor Your Platform

### View Call Logs

```bash
# API endpoint
curl https://your-domain.vercel.app/api/organizations/[orgId]/calls
```

### View Usage & Billing

```bash
# API endpoint
curl https://your-domain.vercel.app/api/organizations/[orgId]/usage?period=current_month
```

### Check Database

```bash
# Open Prisma Studio
npx prisma studio

# Check tables:
# - CallLog (all calls)
# - WorkflowExecution (n8n runs)
# - OrganizationRetell (Retell configs)
# - OrganizationN8n (n8n configs)
```

---

## 🎓 Understanding the Data Flow

```
Customer Calls
     ↓
Retell AI Answers
     ↓
Call Ends
     ↓
Retell sends webhook → Your API
     ↓
Your API:
  1. Validates signature ✓
  2. Finds organization by agent ID ✓
  3. Stores call in CallLog ✓
  4. Triggers n8n workflow ✓
     ↓
n8n Workflow:
  1. Receives call data ✓
  2. Extracts intent ✓
  3. Routes to appropriate action ✓
  4. Creates appointment / sends email / etc ✓
```

---

## 💰 Pricing Model

**Simple Fixed Pricing:**

All clients pay the same monthly fee:
- **$299/month** - Flat rate for all features
- Unlimited calls
- Unlimited n8n workflow executions
- Full AI receptionist features
- Complete isolation and security

**Your Costs:**
- Retell AI: ~$0.02/minute (pay as you go)
- n8n: $20-50/month (cloud) or Free (self-hosted)
- Platform: $10-50/month (Vercel, Database)

**Customer ROI Example:**
- Client pays: $299/month
- Time saved: 100 calls × 5 min = 500 min = 8.3 hours
- Labor cost saved: 8.3 hours × $25/hr = $208
- ROI: ($208 - $299) = Still cheaper than hiring!
- Plus: 24/7 availability, never sick, scales instantly

---

## 🚀 Scale Your Platform

Once you have 1 organization working:

### Add More Organizations

1. Create new organization in admin panel
2. Setup Retell agent for new org
3. Configure n8n workflow for new org
4. Done! Fully isolated.

### White Label for Clients

Each organization can have:
- Custom AI voice
- Custom prompts
- Custom phone number
- Custom n8n workflows
- Custom branding (add logo field)

### Simple Pricing

All clients get the same features at $299/month:
- No usage limits
- No complex billing calculations
- Easy to sell: "One price, everything included"
- Focus on value, not counting calls

---

## 📚 Learn More

- **Full Setup Guide:** [AI_RECEPTIONIST_SETUP_GUIDE.md](AI_RECEPTIONIST_SETUP_GUIDE.md)
- **Migration Guide:** [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- **Retell Docs:** https://docs.retellai.com
- **n8n Docs:** https://docs.n8n.io

---

## ✨ You're Ready!

Your AI Receptionist platform is now:
- ✅ Multi-tenant with full isolation
- ✅ Integrated with Retell AI
- ✅ Automated with n8n
- ✅ Tracking usage for billing
- ✅ Scalable to 1000+ organizations

**Now go get some customers!** 🎉
