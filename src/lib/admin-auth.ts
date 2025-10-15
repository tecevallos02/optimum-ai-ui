import { getServerSession as nextAuthGetServerSession } from "next-auth/next"
import { adminAuthOptions } from "@/lib/admin-auth.config"
import { cookies } from "next/headers"
import { PrismaClient } from "@prisma/client"

// Use separate database connection for admin
const adminPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.ADMIN_DATABASE_URL || process.env.DATABASE_URL
    }
  }
})

export type AdminSessionUser = {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
}

export async function getAdminServerSession() {
  return await nextAuthGetServerSession(adminAuthOptions) as any
}

export async function getCurrentAdminUser(): Promise<AdminSessionUser | null> {
  const session = await getAdminServerSession()
  if (!session?.user) return null

  // Type assertion to fix TypeScript session type issue
  const typedSession = session as any

  return {
    id: typedSession.user.id,
    email: typedSession.user.email!,
    name: typedSession.user.name || undefined,
    isAdmin: true,
  }
}

export async function requireAdminUser(): Promise<AdminSessionUser> {
  const user = await getCurrentAdminUser()
  if (!user) {
    throw new Error("Admin authentication required")
  }
  return user
}

export async function isAdminEmail(email: string): Promise<boolean> {
  try {
    // Check if email is in admin allowlist
    const adminUser = await adminPrisma.adminUser.findUnique({
      where: { email }
    })
    return !!adminUser
  } catch (error) {
    console.error('Error checking admin email:', error)
    return false
  }
}
