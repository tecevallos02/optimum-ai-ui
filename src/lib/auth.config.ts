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
  // Temporarily disabled due to Windows permission issues
  // adapter: PrismaAdapter(prisma),
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
    // Email provider - only enable if SMTP is configured
    ...(process.env.EMAIL_SERVER_HOST && process.env.EMAIL_SERVER_USER && 
        process.env.EMAIL_SERVER_USER !== 'your-email@gmail.com' && 
        process.env.EMAIL_SERVER_PASSWORD && 
        process.env.EMAIL_SERVER_PASSWORD !== 'your-app-password' ? [
      EmailProvider({
        server: {
          host: process.env.EMAIL_SERVER_HOST!,
          port: Number(process.env.EMAIL_SERVER_PORT!),
          auth: {
            user: process.env.EMAIL_SERVER_USER!,
            pass: process.env.EMAIL_SERVER_PASSWORD!,
          },
        },
        from: process.env.EMAIL_FROM!,
      })
    ] : []),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.userId = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
        
        // Temporarily disabled due to Windows permission issues
        // Fetch user's organizations and memberships
        // const memberships = await prisma.membership.findMany({
        //   where: { userId: user.id },
        //   include: { org: true },
        //   orderBy: { org: { createdAt: 'asc' } },
        // })
        
        // token.orgs = memberships.map(m => ({
        //   id: m.org.id,
        //   name: m.org.name,
        //   role: m.role,
        // }))
        
        // Set current org to first one if available
        // token.currentOrgId = memberships[0]?.org.id || null
        
        // Temporary mock data for testing
        token.orgs = [{
          id: 'temp-org-1',
          name: 'Test Organization',
          role: 'OWNER',
        }]
        token.currentOrgId = 'temp-org-1'
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


