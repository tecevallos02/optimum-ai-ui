import { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AzureADProvider from "next-auth/providers/azure-ad"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import { verifyPassword } from "./password"

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
  session: {
    strategy: "jwt",
  },
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
    // Credentials provider for email/password authentication
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              memberships: {
                include: {
                  org: true
                }
              }
            }
          })

          if (!user || !user.password || !user.emailVerified) {
            return null
          }

          const isValidPassword = await verifyPassword(credentials.password, user.password)
          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.image,
            emailVerified: user.emailVerified,
            orgs: user.memberships.map(m => ({
              id: m.org.id,
              name: m.org.name,
              role: m.role
            }))
          }
        } catch (error) {
          console.error('Credentials authorization error:', error)
          return null
        }
      }
    }),
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
          // Get user data with organization name and company
          const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
              organization: true,
            }
          })
          
          // Get company ID separately to avoid Prisma client issues
          const userWithCompany = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
              companyId: true,
            }
          })
          
          // Set company ID
          token.companyId = userWithCompany?.companyId || null
          
          if (userData?.organization) {
            // User has organization name, create org object
            token.orgs = [{
              id: 'user-org',
              name: userData.organization,
              role: 'OWNER',
            }]
            token.currentOrgId = 'user-org'
            
            console.log('✅ Found organization for user:', user.email, userData.organization)
          } else {
            // User has no organization, set empty
            token.orgs = []
            token.currentOrgId = null
            
            console.log('No organization found for user:', user.email)
          }
        } catch (error) {
          console.error('Error handling user organization:', error)
          // Fallback to empty if database fails
          token.orgs = []
          token.currentOrgId = null
        }
      }
      
      // Always refresh organization data on every JWT call
      if (token.userId && token.email) {
        try {
          const userData = await prisma.user.findUnique({
            where: { id: token.userId },
            select: {
              organization: true,
            }
          })
          
          // Get company ID separately
          const userWithCompany = await prisma.user.findUnique({
            where: { id: token.userId },
            select: {
              companyId: true,
            }
          })
          
          // Update company ID
          token.companyId = userWithCompany?.companyId || null
          
          if (userData?.organization) {
            token.orgs = [{
              id: 'user-org',
              name: userData.organization,
              role: 'OWNER',
            }]
            
            // Set current org if not already set
            if (!token.currentOrgId) {
              token.currentOrgId = 'user-org'
            }
          }
        } catch (error) {
          console.error('Error refreshing user organization:', error)
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
        session.user.companyId = token.companyId || null
        
        // Set role based on current org
        if (token.currentOrgId && token.orgs) {
          const currentOrg = token.orgs.find(org => org.id === token.currentOrgId)
          session.user.role = currentOrg?.role || null
        } else {
          session.user.role = null
        }
        
        // Auto-set current org if user has organizations but no current org
        if (token.orgs && token.orgs.length > 0 && !token.currentOrgId) {
          session.user.currentOrgId = token.orgs[0].id
          session.user.role = token.orgs[0].role
        }
      }
      
      return session
    },
  },
}


