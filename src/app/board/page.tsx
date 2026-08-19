import { boardInclude } from "@/lib/board"
import { prisma } from "@/lib/Prisma"
import Kanban from "@/components/kanban/Kanban"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {

  const user = await getCurrentUser()
  if(!user) {
    redirect("/signup")
  }

  const board = await prisma.board.findFirst({
    where: {
      userId: user.id
    },
    include: boardInclude
  })

  if (!board) { return <h1>No board found.</h1> }

  return (
    <Kanban board={board}/>
  )
}
