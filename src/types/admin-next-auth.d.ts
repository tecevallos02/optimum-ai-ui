// ADMIN stack NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      isAdmin?: boolean
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    isAdmin?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string
    isAdmin?: boolean
  }
}
