# Environment Variables Setup

This document outlines the required environment variables for the separated USER and ADMIN stacks.

## USER Stack Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth (USER stack)
NEXTAUTH_URL="https://ui.goshawkai.com"
NEXTAUTH_SECRET="your-user-secret-key"

# Google Sheets API (for USER data)
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_PROJECT_ID="your-project-id"

# Email (for USER authentication)
EMAIL_FROM="noreply@ui.goshawkai.com"
RESEND_API_KEY="your-resend-api-key"

# OAuth Providers (for USER authentication)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
AZURE_AD_CLIENT_ID="your-azure-client-id"
AZURE_AD_CLIENT_SECRET="your-azure-client-secret"
AZURE_AD_TENANT_ID="your-azure-tenant-id"
```

## ADMIN Stack Environment Variables

```bash
# Database (can be same as USER or separate)
ADMIN_DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth (ADMIN stack)
ADMIN_NEXTAUTH_URL="https://ui.goshawkai.com"
ADMIN_NEXTAUTH_SECRET="your-admin-secret-key"

# Session Cookie Names (to avoid conflicts)
ADMIN_SESSION_NAME="admin-next-auth.session-token"
ADMIN_CALLBACK_NAME="admin-next-auth.callback-url"
ADMIN_CSRF_NAME="admin-next-auth.csrf-token"
```

## Production Setup

### Vercel Environment Variables

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all the above variables for Production environment
4. Ensure `NEXTAUTH_URL` and `ADMIN_NEXTAUTH_URL` are set to your production domain

### Database Setup

1. Run the Prisma migration to add the AdminUser model:
   ```bash
   npx prisma migrate deploy
   ```

2. Seed the admin user:
   ```bash
   node setup-admin-user.js
   ```

### Cookie Configuration

The USER and ADMIN stacks use different cookie names to prevent conflicts:
- USER: `next-auth.session-token`
- ADMIN: `admin-next-auth.session-token`

This ensures that a user can be logged into both systems simultaneously without interference.

## Security Notes

1. **Separate Secrets**: Use different `NEXTAUTH_SECRET` values for USER and ADMIN stacks
2. **Database Isolation**: Consider using separate databases for USER and ADMIN data
3. **Admin Allowlist**: Only emails in the `AdminUser` table can access the admin panel
4. **No Cross-Stack Access**: USER routes cannot access admin data and vice versa

## Testing

1. **USER Stack**: Visit `https://ui.goshawkai.com/login`
2. **ADMIN Stack**: Visit `https://ui.goshawkai.com/admin/login`
3. **Admin Credentials**: 
   - Email: `goshawk1@gmail.com`
   - Password: `admin123`

## Troubleshooting

### Database Connection Issues
- Ensure your Neon database is accessible
- Check that the connection string is correct
- Verify SSL settings if required

### Session Conflicts
- Clear browser cookies if experiencing session issues
- Ensure different cookie names are configured
- Check that middleware is properly routing requests

### Admin Access Issues
- Verify admin user exists in database
- Check that email is in AdminUser table
- Ensure admin authentication is working
