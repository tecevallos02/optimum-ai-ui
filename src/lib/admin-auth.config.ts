// NextAuth v4 doesn't export NextAuthOptions, using any for now
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { adminPrisma } from "./admin-prisma"
import { verifyPassword } from "./password"

// Validate required environment variables for admin
if (!process.env.ADMIN_DATABASE_URL && !process.env.DATABASE_URL) {
  throw new Error("ADMIN_DATABASE_URL or DATABASE_URL is missing");
}
if (!process.env.ADMIN_NEXTAUTH_URL && !process.env.NEXTAUTH_URL) {
  throw new Error("ADMIN_NEXTAUTH_URL or NEXTAUTH_URL is missing");
}
if (!process.env.ADMIN_NEXTAUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  throw new Error("ADMIN_NEXTAUTH_SECRET or NEXTAUTH_SECRET is missing");
}

export const adminAuthOptions: any = {
  adapter: PrismaAdapter(adminPrisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    // Admin credentials provider only
    CredentialsProvider({
      name: "admin-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Check if email is in admin allowlist
          const adminUser = await adminPrisma.adminUser.findUnique({
            where: { email: credentials.email }
          })

          if (!adminUser) {
            console.log('Email not in admin allowlist:', credentials.email)
            return null
          }

          // Verify password
          const isValidPassword = await verifyPassword(credentials.password, adminUser.password)
          if (!isValidPassword) {
            console.log('Invalid password for admin:', credentials.email)
            return null
          }

          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            isAdmin: true,
          }
        } catch (error) {
          console.error('Admin credentials authorization error:', error)
          return null
        }
      }
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      // Initial sign in
      if (user) {
        token.userId = user.id
        token.email = user.email
        token.name = user.name
        token.isAdmin = true
      }
      
      return token
    },
    async session({ session, token }: any) {
      if (token.userId) {
        session.user.id = token.userId as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      
      return session
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.ADMIN_SESSION_NAME || 'admin-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: process.env.ADMIN_CALLBACK_NAME || 'admin-next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: process.env.ADMIN_CSRF_NAME || 'admin-next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
}
