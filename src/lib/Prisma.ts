import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../src/generated/prisma/client"

const databaseUrl = process.env.DATABASE_URL
if(!databaseUrl) {
  throw new Error("DATABASE_URL is not defined.")
}

const adapter = new PrismaPg({ connectionString: databaseUrl })

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
