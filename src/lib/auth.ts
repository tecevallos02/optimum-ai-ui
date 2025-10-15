import { getServerSession as nextAuthGetServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth.config"
import { cookies } from "next/headers"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  companyId: string | null;
}

export async function getServerSession() {
  return await nextAuthGetServerSession(authOptions)
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession()
  if (!session?.user) return null

  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name || undefined,
    companyId: session.user.companyId || null,
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

// Simplified USER auth - no roles, single company per user
export async function requireUserWithCompany(): Promise<SessionUser> {
  const user = await requireUser()
  
  if (!user.companyId) {
    throw new Error("User not linked to any company")
  }
  
  return user
}

// Legacy exports for backward compatibility (will be removed in future)
export async function getCurrentOrgId(): Promise<string | null> {
  const cookieStore = await cookies()
  const currentOrgCookie = cookieStore.get('currentOrgId')
  return currentOrgCookie?.value || null
}

export async function requireRole(required: any): Promise<SessionUser> {
  // Legacy function - just return user with company
  return await requireUserWithCompany()
}

export async function hasRole(required: any): Promise<boolean> {
  try {
    await requireUserWithCompany()
    return true
  } catch {
    return false
  }
}

export async function getUserMembership(userId: string, orgId: string) {
  return await prisma.membership.findUnique({
    where: {
      userId_orgId: {
        userId,
        orgId,
      },
    },
    include: {
      org: true,
      user: true,
    },
  })
}
