# Goshawk AI UI - SSO Setup Guide

This Next.js 14 SaaS application provides multi-tenant AI receptionist management with SSO authentication.

## Features

- **Multi-tenant Organizations** with RBAC (OWNER, MANAGER, AGENT)
- **SSO Authentication** via Google OIDC, Microsoft Azure AD, and Email magic links
- **Organization Management** with invitation system
- **Contacts CRUD** with full management interface
- **Calendar Integration** (Google Calendar ready)
- **Audit Logging** for all actions
- **Dashboard & KPIs** with real-time data

## Prerequisites

- Node.js 18+ 
- npm or yarn
- SQLite (dev) or PostgreSQL (production)
- Google OAuth credentials (optional)
- Microsoft Azure AD credentials (optional)
- SMTP server for email magic links (optional)

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=REPLACE_ME_32B_RANDOM

# Google OIDC (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft Entra ID / Azure AD OIDC (Optional)
AZURE_AD_TENANT_ID=your-tenant-id
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret

# Email Magic Link (Optional)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM="Goshawk AI <no-reply@YOUR_DOMAIN>"

# Database
DATABASE_URL=sqlite:./prisma/dev.db

# Public Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Calendar Integration
# CALCOM_API_KEY=your-calcom-api-key
# GOOGLE_CALENDAR_API_CREDENTIALS_JSON={"type":"service_account",...}
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed with sample data
npx prisma db seed
```

### 3. Generate NextAuth Secret

```bash
# Generate a secure secret
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in your `.env.local`.

### 4. Configure OAuth Providers (Optional)

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

#### Microsoft Azure AD Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory > App registrations
3. Create new registration
4. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/azure-ad`
   - `https://yourdomain.com/api/auth/callback/azure-ad`
5. Create client secret
6. Copy Tenant ID, Client ID, and Secret to `.env.local`

#### Email Magic Link Setup

1. Use Gmail with App Password:
   - Enable 2FA on Gmail
   - Generate App Password
   - Use your Gmail address and App Password

2. Or use any SMTP server:
   - Update `EMAIL_SERVER_*` variables
   - Ensure server supports TLS

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Usage

### First Time Setup

1. **Sign In**: Use any configured SSO method or email magic link
2. **Create Organization**: You'll be prompted to create your first organization
3. **Invite Team Members**: Use the team management to invite others
4. **Configure Calendar**: Connect your Google Calendar for appointment management

### Organization Management

- **OWNER**: Full access to all features, can manage users and billing
- **MANAGER**: Can manage contacts, view reports, invite AGENT users
- **AGENT**: Can view contacts and basic dashboard

### Key Features

#### Contacts Management
- Add, edit, delete contacts
- Tag and categorize contacts
- Search and filter functionality
- Bulk operations

#### Calendar Integration
- Connect Google Calendar
- View upcoming appointments
- Sync appointment data
- Status tracking (confirmed, pending, cancelled)

#### Audit Logging
- All user actions are logged
- IP address and user agent tracking
- Organization-scoped logs
- Action history for compliance

#### Dashboard & KPIs
- Call handling statistics
- Booking metrics
- Cost savings tracking
- Real-time data visualization

## API Endpoints

### Authentication
- `GET /api/auth/[...nextauth]` - NextAuth.js endpoints
- `GET /api/me` - Current user and organization data

### Organizations
- `GET /api/orgs` - List user's organizations
- `POST /api/orgs` - Create new organization
- `POST /api/orgs/[id]/switch` - Switch current organization

### Invitations
- `POST /api/invitations` - Create invitation (MANAGER+)
- `GET /api/invitations/[token]` - Get invitation details
- `POST /api/invitations/accept` - Accept invitation

### Contacts
- `GET /api/contacts` - List contacts (paginated)
- `POST /api/contacts` - Create contact
- `PATCH /api/contacts/[id]` - Update contact
- `DELETE /api/contacts/[id]` - Delete contact

### Calendar
- `GET /api/appointments` - List appointments
- `GET /api/calendar/connect` - Check connection status
- `POST /api/calendar/connect` - Initiate calendar connection

## Database Schema

### Core Models
- **User**: NextAuth.js user data
- **Account**: OAuth provider accounts
- **Session**: User sessions
- **Organization**: Multi-tenant organizations
- **Membership**: User-organization relationships with roles
- **Invitation**: Organization invitations
- **Contact**: Customer contact information
- **AuditLog**: Action logging

### Roles
- **OWNER**: Full organization access
- **MANAGER**: Management access, can invite AGENT users
- **AGENT**: Basic access to contacts and dashboard

## Deployment

### Production Database

Update `DATABASE_URL` to use PostgreSQL:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_AhF9HrGJ8YfU@ep-fancy-waterfall-ad9itrjq-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Environment Variables

Ensure all production environment variables are set:
- Use strong, unique secrets
- Configure production OAuth redirect URIs
- Set up production SMTP server
- Use HTTPS URLs

### Build and Deploy

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure DATABASE_URL is correct
2. **OAuth Redirects**: Check redirect URIs match exactly
3. **Email Delivery**: Verify SMTP credentials and settings
4. **Session Issues**: Clear cookies and try again

### Debug Mode

Enable NextAuth debug mode:

```bash
NEXTAUTH_DEBUG=true
```

### Logs

Check application logs for detailed error information:
- Database connection issues
- OAuth callback errors
- Email delivery failures

## Security Considerations

- Use HTTPS in production
- Regularly rotate secrets
- Monitor audit logs
- Implement rate limiting
- Use strong passwords
- Enable 2FA where possible

## Support

For issues and questions:
1. Check this README
2. Review application logs
3. Check NextAuth.js documentation
4. Verify environment configuration

## License

This project is proprietary software. All rights reserved.