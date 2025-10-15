# Admin Setup Guide

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```bash
# Admin emails (comma-separated list)
ADMIN_EMAILS="goshawkai1@gmail.com,partner@example.com"

# NextAuth configuration
NEXTAUTH_URL="https://ui.goshawkai.com"
NEXTAUTH_SECRET="your-secret-here"

# Optional: Trust host in production
AUTH_TRUST_HOST=true
```

## How Admin Authentication Works

1. **Middleware Protection**: The middleware checks if the user's email is in the `ADMIN_EMAILS` list
2. **Single Auth System**: Uses the same NextAuth system as regular users
3. **No Separate Admin Auth**: Removed the complex dual auth system that was causing loops

## Admin Access

- **URL**: `https://ui.goshawkai.com/admin`
- **Login**: Use regular login page with admin email
- **Credentials**: Same as regular user credentials
- **Protection**: Middleware ensures only emails in `ADMIN_EMAILS` can access

## Testing

1. Visit `/` → should redirect to `/login` if not authenticated
2. Visit `/login` → should show login form
3. Visit `/admin` as non-admin → should redirect to `/`
4. Visit `/admin` as admin → should show admin dashboard
5. Visit `/app` as authenticated user → should show app dashboard
