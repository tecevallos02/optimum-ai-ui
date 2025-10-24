# 🚀 Production Setup Guide - Neon PostgreSQL

## Overview
This guide will help you set up your Goshawk AI UI application with Neon PostgreSQL for real business clients. You'll have multiple business organizations with proper user accounts ready for production use.

## 🎯 What You'll Get
- **5 Real Business Organizations** (Dental, Tech, Law, Medical, Fitness)
- **10+ User Accounts** with different roles (Owner, Manager, Agent)
- **Sample Contacts** for each business
- **Audit Logs** showing real activity
- **Production-Ready Database** with Neon PostgreSQL

## 📋 Step-by-Step Setup

### Step 1: Create Neon Account
1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up or login
3. Create a new project:
   - **Project Name**: `goshawk-ai-ui`
   - **Database Name**: `goshawk_ai_db`
   - **Region**: Choose closest to your users

### Step 2: Get Connection String
1. In your Neon project dashboard
2. Go to "Connection Details"
3. Copy the PostgreSQL connection string (looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### Step 3: Update Environment Variables
1. Open `.env.local` in your project
2. Replace the `DATABASE_URL` with your Neon connection string:
   ```env
   DATABASE_URL="postgresql://your-actual-connection-string-here"
   ```

### Step 4: Deploy Database Schema
```bash
# Generate Prisma client
npm run db:generate

# Push schema to Neon database
npm run db:push
```

### Step 5: Seed with Business Data
```bash
# Create sample business organizations and users
npm run db:seed
```

### Step 6: Test the Application
```bash
# Start development server
npm run dev
```

## 🏢 Business Organizations Created

### 1. **Acme Dental Practice**
- **Owner**: Dr. Sarah Smith (dr.smith@acmedental.com)
- **Manager**: Jennifer Wilson (reception@acmedental.com)
- **Agent**: Mike Johnson (assistant@acmedental.com)

### 2. **TechStart Solutions**
- **Owner**: Alex Chen (ceo@techstart.com)
- **Manager**: Maria Rodriguez (cto@techstart.com)

### 3. **Green Valley Law Firm**
- **Owner**: Robert Thompson (partner@greenvalleylaw.com)
- **Agent**: Lisa Davis (paralegal@greenvalleylaw.com)

### 4. **Sunrise Medical Center**
- **Owner**: Dr. Michael Brown (admin@sunrisemedical.com)
- **Manager**: Sarah Lee (nurse@sunrisemedical.com)

### 5. **Elite Fitness Studio**
- **Owner**: David Martinez (owner@elitefitness.com)
- **Agent**: Jessica Taylor (trainer@elitefitness.com)

## 🔐 Testing Authentication

### Email Sign-In
1. Go to `http://localhost:3000/signin`
2. Enter any of the business email addresses above
3. Check the console for the magic link
4. Click the magic link to sign in

### Account Switching
1. Click "Sign out" in the top-right corner
2. Sign in with a different business account
3. You'll see different organization data

## 📊 What's Included

### Database Tables
- **Users**: Business owners, managers, and agents
- **Organizations**: 5 different business types
- **Memberships**: User-organization relationships with roles
- **Contacts**: Sample customers for each business
- **Audit Logs**: Activity tracking for compliance
- **Accounts & Sessions**: NextAuth authentication data

### User Roles
- **OWNER**: Full access to all features
- **MANAGER**: Access to most features, can manage agents
- **AGENT**: Limited access, focused on daily operations

## 🚀 Production Deployment

### Environment Variables for Production
```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
DATABASE_URL=your-neon-production-url
EMAIL_FROM=noreply@yourdomain.com
```

### Security Considerations
- Use strong, unique secrets
- Enable SSL for database connections
- Set up proper CORS policies
- Monitor database performance in Neon console

### Scaling
- Neon automatically scales with usage
- Monitor connection limits
- Consider read replicas for heavy workloads

## 🔧 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if SSL is required (`?sslmode=require`)
- Ensure your IP is whitelisted

### Migration Issues
- Run `npx prisma db push --force-reset` to reset
- Check Prisma logs for specific errors
- Verify schema matches your models

### Authentication Issues
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain
- Check console for magic link generation

## 📈 Next Steps

1. **Customize Organizations**: Update business names and details
2. **Add Real Contacts**: Import actual customer data
3. **Configure Email**: Set up real email sending for production
4. **Add OAuth**: Configure Google/Microsoft sign-in
5. **Deploy**: Push to Vercel, Netlify, or your preferred platform

## 🎉 Success!

You now have a production-ready application with:
- ✅ Real business client accounts
- ✅ Proper database structure
- ✅ Role-based access control
- ✅ Email authentication
- ✅ Audit logging
- ✅ Scalable PostgreSQL database

Your business clients can now sign in and access their organization-specific data!
