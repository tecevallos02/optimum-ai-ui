// NextAuth v4 doesn't export NextAuthOptions, using any for now
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { adminPrisma } from "./admin-prisma"
import { verifyPassword } from "./password"

// Use main environment variables as fallback for admin
const adminDatabaseUrl = process.env.ADMIN_DATABASE_URL || process.env.DATABASE_URL;
const adminNextAuthUrl = process.env.ADMIN_NEXTAUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
const adminNextAuthSecret = process.env.ADMIN_NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET;

if (!adminDatabaseUrl) {
  throw new Error("ADMIN_DATABASE_URL or DATABASE_URL is missing");
}
if (!adminNextAuthSecret) {
  throw new Error("ADMIN_NEXTAUTH_SECRET or NEXTAUTH_SECRET is missing");
}

export const adminAuthOptions: any = {
  adapter: PrismaAdapter(adminPrisma),
  session: {
    strategy: "jwt",
  },
  secret: adminNextAuthSecret,
  pages: {
    signIn: "/admin/login",
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
        console.log('🔐 Admin login attempt:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null
        }

        try {
          // Check if email is in admin allowlist
          const adminUser = await adminPrisma.adminUser.findUnique({
            where: { email: credentials.email }
          })

          if (!adminUser) {
            console.log('❌ Email not in admin allowlist:', credentials.email)
            return null
          }

          console.log('✅ Admin user found:', adminUser.email);

          // Verify password
          const isValidPassword = await verifyPassword(credentials.password, adminUser.password)
          console.log('🔑 Password verification result:', isValidPassword);
          
          if (!isValidPassword) {
            console.log('❌ Invalid password for admin:', credentials.email)
            return null
          }

          console.log('✅ Admin authentication successful:', adminUser.email)

          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            isAdmin: true,
          }
        } catch (error) {
          console.error('❌ Admin credentials authorization error:', error)
          return null
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      console.log('🔐 Admin JWT callback:', { user: !!user, tokenKeys: Object.keys(token) });
      
      // Initial sign in
      if (user) {
        console.log('🔐 Setting admin JWT token:', { id: user.id, email: user.email, isAdmin: true });
        token.userId = user.id
        token.email = user.email
        token.name = user.name
        token.isAdmin = true
      }
      
      return token
    },
    async session({ session, token }: any) {
      console.log('🔐 Admin session callback:', { 
        hasToken: !!token, 
        tokenKeys: token ? Object.keys(token) : [],
        sessionUser: session?.user 
      });
      
      if (token.userId) {
        console.log('🔐 Setting admin session:', { 
          id: token.userId, 
          email: token.email, 
          isAdmin: token.isAdmin 
        });
        session.user.id = token.userId as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      
      console.log('🔐 Final admin session:', session);
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
