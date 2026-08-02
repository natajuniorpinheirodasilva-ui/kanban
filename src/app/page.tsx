import { boardInclude } from "@/lib/board"
import { prisma } from "@/lib/Prisma"
import Kanban from "@/components/Kanban"

export default async function Home() {

  const board = await prisma.board.findFirst({ include: boardInclude })

  return
}