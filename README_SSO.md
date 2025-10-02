# SSO and Multi-Tenant Setup Guide

This guide explains how to set up and configure the SSO (Single Sign-On) and multi-tenant features for Optimum AI UI.

## Overview

The application now supports:
- **Authentication**: Google OAuth, Microsoft Azure AD, and Email magic links
- **Multi-tenancy**: Organizations with role-based access control (RBAC)
- **Roles**: OWNER, MANAGER, AGENT with hierarchical permissions
- **Invitations**: Team member invitation system
- **Audit Logging**: Track important user actions

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here-32-chars-minimum"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Microsoft Azure AD
AZURE_AD_TENANT_ID="your-azure-tenant-id"
AZURE_AD_CLIENT_ID="your-azure-client-id"
AZURE_AD_CLIENT_SECRET="your-azure-client-secret"

# Email Provider (for magic links)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-smtp-username"
EMAIL_SERVER_PASSWORD="your-smtp-password"
EMAIL_FROM="Optimum AI <no-reply@yourdomain.com>"

# Public Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Provider Setup

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client IDs
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy the Client ID and Client Secret to your `.env.local`

### Microsoft Azure AD Setup

1. Go to the [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Set redirect URI to:
   - `http://localhost:3000/api/auth/callback/azure-ad` (development)
   - `https://yourdomain.com/api/auth/callback/azure-ad` (production)
5. Go to "Certificates & secrets" and create a new client secret
6. Copy the Tenant ID, Application (client) ID, and Client Secret to your `.env.local`

### Email Provider Setup

For email magic links, you need an SMTP server. You can use:
- **Gmail**: Use App Passwords with `smtp.gmail.com:587`
- **SendGrid**: Use API key as password with `smtp.sendgrid.net:587`
- **AWS SES**: Configure with your AWS SES SMTP credentials
- **Any SMTP provider**: Use their SMTP settings

## Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env.example` to `.env.local` and fill in your values

3. **Run database migrations**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Open http://localhost:3000
   - Click "Sign In" to test authentication
   - Create your first organization after signing in

## Testing the Features

### Authentication Flow
1. Visit http://localhost:3000/signin
2. Try signing in with Google, Microsoft, or email
3. After successful authentication, you'll be redirected to `/app`

### Organization Management
1. After first sign-in, you'll be prompted to create an organization
2. Use the organization switcher in the header to manage multiple orgs
3. Switch between organizations to test multi-tenancy

### Invitation System
1. As an OWNER or MANAGER, create invitations via the API:
   ```bash
   POST /api/invitations
   {
     "email": "user@example.com",
     "role": "AGENT"
   }
   ```
2. The API will return an invitation URL
3. Visit the invitation URL to test the acceptance flow
4. Sign in with the invited email to accept the invitation

### Role-Based Access
- **OWNER**: Full access, can manage all aspects of the organization
- **MANAGER**: Can invite users and manage team members
- **AGENT**: Limited access to assigned features

Use the `RoleGuard` component to protect UI elements:
```tsx
<RoleGuard allowed={['OWNER', 'MANAGER']} requireAtLeast>
  <AdminOnlyButton />
</RoleGuard>
```

### Audit Logging
Audit logs are automatically created for:
- User sign-in/sign-out
- Organization creation and switching
- Invitation creation and acceptance
- Role changes

View audit logs via the API:
```bash
GET /api/audit?orgId=your-org-id
```

## API Endpoints

### Authentication
- `GET/POST /api/auth/*` - NextAuth.js routes
- `GET /api/me` - Current user info with organizations and role

### Organizations
- `GET /api/orgs` - List user's organizations
- `POST /api/orgs` - Create new organization
- `POST /api/orgs/[id]/switch` - Switch current organization

### Invitations
- `POST /api/invitations` - Create invitation (MANAGER+ only)
- `GET /api/invitations/[token]` - Get invitation details
- `POST /api/invitations/accept` - Accept invitation

### Other APIs
All existing APIs (`/api/calls`, `/api/kpis`, etc.) now require authentication and are scoped to the current organization.

## Database Schema

The application uses the following key models:
- **User**: NextAuth.js user with email, name, image
- **Account**: OAuth provider accounts
- **Session**: User sessions
- **Organization**: Tenant organizations
- **Membership**: User-organization relationships with roles
- **Invitation**: Team invitation tokens
- **AuditLog**: Activity tracking

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **NEXTAUTH_SECRET**: Use a strong, random secret (32+ characters)
3. **HTTPS**: Always use HTTPS in production
4. **Database**: Switch to PostgreSQL for production
5. **Email Security**: Use secure SMTP credentials and consider rate limiting

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Ensure your OAuth provider redirect URIs match exactly
2. **"Database connection failed"**: Check your DATABASE_URL and ensure the database exists
3. **"Email not sending"**: Verify SMTP credentials and check spam folders
4. **"Session not found"**: Clear browser cookies and try signing in again

### Debug Mode

Enable debug logging by adding to `.env.local`:
```bash
NEXTAUTH_DEBUG=true
```

This will provide detailed logs in the console for troubleshooting authentication issues.

## Production Deployment

Before deploying to production:

1. **Database**: Switch to PostgreSQL
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/database"
   ```

2. **Environment**: Update all URLs to production domains
3. **OAuth**: Update redirect URIs in provider consoles
4. **Security**: Use secure session cookies and HTTPS
5. **Monitoring**: Set up error tracking and audit log monitoring

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review NextAuth.js documentation: https://next-auth.js.org/
3. Check Prisma documentation: https://www.prisma.io/docs/


