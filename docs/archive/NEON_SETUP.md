# Neon PostgreSQL Setup Guide

## Step 1: Create Neon Account and Database

1. **Go to Neon Console**: https://console.neon.tech/
2. **Sign up/Login** with your account
3. **Create a new project**:
   - Project name: `optimum-ai-ui`
   - Database name: `optimum_ai_db`
   - Region: Choose closest to your users
4. **Copy the connection string** (it will look like):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

## Step 2: Environment Variables

Create a `.env.local` file in your project root with:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Neon PostgreSQL Database
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Email Configuration (for production)
EMAIL_FROM=noreply@yourdomain.com

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id
```

## Step 3: Database Migration

Run these commands to set up your database:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Neon database
npx prisma db push

# (Optional) Seed with initial data
npx prisma db seed
```

## Step 4: Verify Setup

1. **Check Neon Console**: Go to your project dashboard
2. **View Tables**: You should see all your tables (User, Organization, etc.)
3. **Test Connection**: Run your app and create a test account

## Production Considerations

### Security
- Use strong `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
- Set up proper CORS policies
- Use environment-specific database URLs

### Scaling
- Neon automatically scales with your usage
- Consider connection pooling for high traffic
- Monitor database performance in Neon console

### Backup
- Neon provides automatic backups
- Set up additional backup strategies if needed

## Troubleshooting

### Connection Issues
- Verify DATABASE_URL is correct
- Check if SSL is required (add `?sslmode=require`)
- Ensure your IP is whitelisted (if using IP restrictions)

### Migration Issues
- Run `npx prisma db push --force-reset` to reset database
- Check Prisma logs for specific errors
- Verify schema matches your models

### Performance
- Use database indexes for frequently queried fields
- Monitor query performance in Neon console
- Consider read replicas for heavy read workloads
