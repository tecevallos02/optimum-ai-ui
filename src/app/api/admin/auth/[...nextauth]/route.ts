import NextAuth from "next-auth"
import { adminAuthOptions } from "@/lib/admin-auth.config"

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = NextAuth(adminAuthOptions)

export { handler as GET, handler as POST }
