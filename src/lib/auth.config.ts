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

          // In production, you can configure real email sending here
          console.log("🔗 Magic Link for", email, ":", url)
        } catch (error) {
          console.error("Failed to send verification email:", error)
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
        token.emailVerified = user.emailVerified
        
        // Check if email is verified
        if (!user.emailVerified) {
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


