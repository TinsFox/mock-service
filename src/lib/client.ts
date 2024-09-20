import { PrismaClient } from "@prisma/client"
import { PrismaD1 } from "@prisma/adapter-d1"

export const getPrisma = (DB: D1Database) => {
  const adapter = new PrismaD1(DB)
  const prisma = new PrismaClient({ adapter })
  return prisma
}
