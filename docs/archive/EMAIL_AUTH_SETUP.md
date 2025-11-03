# Email Authentication Setup

## Development Mode (Current Setup)

The email authentication is now configured to work in development mode. Here's how it works:

### How to Test Email Sign-In:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Go to the sign-in page:**
   - Navigate to `http://localhost:3000/signin`
   - You'll see a blue notice explaining development mode

3. **Test email sign-in:**
   - Enter any email address (e.g., `test@example.com`)
   - Click "Send magic link"
   - Check the browser console (F12 → Console tab)
   - You'll see a magic link like: `🔗 Magic Link for test@example.com : http://localhost:3000/api/auth/callback/email?callbackUrl=...`

4. **Use the magic link:**
   - Copy the URL from the console
   - Paste it in a new browser tab
   - You'll be automatically signed in

## Production Setup (Optional)

For production, you can configure real email sending using Resend:

### 1. Get a Resend API Key:
- Go to [resend.com](https://resend.com)
- Sign up for a free account
- Get your API key

### 2. Set Environment Variables:
Create a `.env.local` file with:
```env
RESEND_API_KEY=your-resend-api-key-here
EMAIL_FROM=noreply@yourdomain.com
```

### 3. Verify Domain (for production):
- Add your domain in Resend dashboard
- Update `EMAIL_FROM` to use your verified domain

## Features

- ✅ **Development-friendly**: Magic links logged to console
- ✅ **Production-ready**: Uses Resend for real email sending
- ✅ **Secure**: 24-hour link expiration
- ✅ **User-friendly**: Clear instructions and error messages
- ✅ **Responsive**: Works on all devices

## Troubleshooting

### Email not working?
1. Check browser console for magic link
2. Ensure development server is running
3. Check for any error messages in console

### Production email not sending?
1. Verify Resend API key is correct
2. Check domain verification in Resend
3. Ensure `EMAIL_FROM` uses verified domain
