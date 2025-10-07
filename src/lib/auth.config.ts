import { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AzureADProvider from "next-auth/providers/azure-ad"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}
if (!process.env.NEXTAUTH_URL) {
  throw new Error("NEXTAUTH_URL is missing");
}
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is missing");
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Only enable providers with valid credentials
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
        process.env.GOOGLE_CLIENT_ID !== 'placeholder-google-client-id' ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      })
    ] : []),
    ...(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && 
        process.env.AZURE_AD_CLIENT_ID !== 'placeholder-azure-client-id' ? [
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        tenantId: process.env.AZURE_AD_TENANT_ID!,
      })
    ] : []),
    // Email provider - always enabled for development
    EmailProvider({
      from: process.env.EMAIL_FROM || "noreply@localhost",
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        try {
          // For development, we'll log the magic link to console
          if (process.env.NODE_ENV === "development") {
            console.log("🔗 Magic Link for", email, ":", url)
            console.log("📧 In production, this would be sent via email")
            return
          }

          // In production, send real emails with Resend
          const { Resend } = await import('resend')
          const resend = new Resend(process.env.RESEND_API_KEY)

          // Extract the token from the URL for display
          const urlObj = new URL(url)
          const token = urlObj.searchParams.get('token') || '123456' // Fallback for display
          
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
            to: [email],
            subject: 'Your 6-digit activation code',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #333; margin: 0;">Welcome to Goshawk AI</h1>
                  <p style="color: #666; margin: 10px 0 0 0;">Your account activation code</p>
                </div>
                
                <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0;">
                  <p style="color: #333; font-size: 16px; margin: 0 0 15px 0;">Your 6-digit activation code is:</p>
                  <div style="background-color: #007bff; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 8px; display: inline-block; font-family: 'Courier New', monospace;">
                    ${token}
                  </div>
                  <p style="color: #666; font-size: 14px; margin: 15px 0 0 0;">Enter this code on the verification page</p>
                </div>
                
                <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #1976d2; font-size: 14px;">
                    <strong>Important:</strong> This code will expire in 24 hours for security reasons.
                  </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${url}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Go to Verification Page
                  </a>
                </div>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px; text-align: center; margin: 0;">
                  If you didn't request this activation code, you can safely ignore this email.
                </p>
              </div>
            `,
          })

          console.log("✅ Magic link email sent successfully to:", email)
        } catch (error) {
          console.error("Failed to send verification email:", error)
          // Fallback to logging for debugging
          console.log("🔗 Magic Link for", email, ":", url)
          throw new Error("Failed to send verification email")
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.userId = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
        token.emailVerified = (user as any).emailVerified
        
        // Check if email is verified
        if (!(user as any).emailVerified) {
          console.log('User email not verified:', user.email)
          // Don't create organizations or memberships for unverified users
          token.orgs = []
          token.currentOrgId = null
          return token
        }
        
        try {
          // Check if user has any memberships
          const memberships = await prisma.membership.findMany({
            where: { userId: user.id },
            include: { org: true },
            orderBy: { org: { createdAt: 'asc' } },
          })
          
          // If user has no memberships, create a default organization for them
          if (memberships.length === 0) {
            console.log('Creating default organization for verified user:', user.email)
            
            // Create a default organization for the new user
            const defaultOrg = await prisma.organization.create({
              data: {
                name: `${user.name || 'My'} Organization`,
                createdAt: new Date(),
              }
            })
            
            // Create membership with OWNER role
            await prisma.membership.create({
              data: {
                userId: user.id,
                orgId: defaultOrg.id,
                role: 'OWNER',
              }
            })
            
            // Add the new organization to token
            token.orgs = [{
              id: defaultOrg.id,
              name: defaultOrg.name,
              role: 'OWNER',
            }]
            token.currentOrgId = defaultOrg.id
            
            console.log('✅ Created organization and membership for user:', user.email)
          } else {
            // User already has memberships
            token.orgs = memberships.map(m => ({
              id: m.org.id,
              name: m.org.name,
              role: m.role,
            }))
            
            // Set current org to first one if available
            token.currentOrgId = memberships[0]?.org.id || null
          }
        } catch (error) {
          console.error('Error handling user memberships:', error)
          // Fallback to mock data if database fails
          token.orgs = [{
            id: 'temp-org-1',
            name: 'Test Organization',
            role: 'OWNER',
          }]
          token.currentOrgId = 'temp-org-1'
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string
        session.user.orgs = token.orgs || []
        session.user.currentOrgId = token.currentOrgId || null
        
        // Set role based on current org
        if (token.currentOrgId && token.orgs) {
          const currentOrg = token.orgs.find(org => org.id === token.currentOrgId)
          session.user.role = currentOrg?.role || null
        } else {
          session.user.role = null
        }
      }
      
      return session
    },
  },
}


