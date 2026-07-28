import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../src/generated/prisma/client"
import { loadEnvFile } from "process"

process.loadEnvFile()
const databaseUrl  = process.env.DATABASE_URL
if (!databaseUrl) {
    throw new Error ("DATABASE_URL is not defined")
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl })
const prisma = new PrismaClient({ adapter })

async function main() {
    const existingBoard = await prisma.board.findFirst()
    if (existingBoard) {return}

    await prisma.board.create({
        data: {
            title: "Exemplo",
            columns: {
                create: [
                    {title: "A Fazer", position: 100, cards: {
                        create: [
                            {title: "A Fazer 1", position: 100}
                        ]
                    } },
                    {title: "Em Andamento", position: 200, cards: { 
                        create: [
                            {title: "Em Andamento 1", position: 200}
                        ] 
                    } },
                    {title: "Concluído", position: 300, cards: {
                        create: [
                            {title: "Concluído 1", position: 300}
                        ] 
                    } },
                ]
            }
        }
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })