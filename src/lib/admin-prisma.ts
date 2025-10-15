import { PrismaClient } from '@prisma/client'

// Separate Prisma client for admin operations
export const adminPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.ADMIN_DATABASE_URL || process.env.DATABASE_URL
    }
  }
})
