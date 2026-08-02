import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../../src/generated/prisma/client"

process.loadEnvFile()

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({
  adapter,
});