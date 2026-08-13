import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../../src/generated/prisma/client"

process.loadEnvFile()

const databaseUrl = process.env.DATABASE_URL
if(!databaseUrl) {
  throw new Error("DATABASE_URL is not defined.")
}

const adapter = new PrismaBetterSqlite3({
  url: databaseUrl
})

export const prisma = new PrismaClient