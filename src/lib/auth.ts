import { getServerSession as nextAuthGetServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth.config"
import { Role, isAtLeast } from "./roles"
import { cookies } from "next/headers"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  orgId: string | null;
  role: Role | null;
  orgs: Array<{ id: string; name: string; role: Role }>;
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
    orgId: session.user.currentOrgId || null,
    role: session.user.role || null,
    orgs: session.user.orgs || [],
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function getCurrentOrgId(): Promise<string | null> {
  const cookieStore = await cookies()
  const currentOrgCookie = cookieStore.get('currentOrgId')
  return currentOrgCookie?.value || null
}

export async function requireRole(required: Role): Promise<SessionUser> {
  const user = await requireUser()
  const currentOrgId = await getCurrentOrgId()
  
  if (!currentOrgId || !user.role) {
    throw new Error("No organization selected")
  }
  
  if (!isAtLeast(user.role, required)) {
    throw new Error("Insufficient permissions")
  }
  
  return user
}

export async function hasRole(required: Role): Promise<boolean> {
  try {
    await requireRole(required)
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
