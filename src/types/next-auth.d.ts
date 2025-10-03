// import NextAuth from "next-auth"
import { Role } from "@/lib/roles"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      orgs?: Array<{ id: string; name: string; role: Role }>
      currentOrgId?: string | null
      role?: Role | null
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string
    orgs?: Array<{ id: string; name: string; role: Role }>
    currentOrgId?: string | null
  }
}



