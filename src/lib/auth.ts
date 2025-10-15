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
