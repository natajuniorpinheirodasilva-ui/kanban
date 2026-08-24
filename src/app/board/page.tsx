import NavBar from "@/components/ui/NavBar"
import Kanban from "@/components/kanban/Kanban"
import { boardInclude } from "@/lib/board"
import { prisma } from "@/lib/Prisma"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {

  const user = await getCurrentUser()
  if (!user) {
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
    <div>
      <div className="">
        <NavBar userName={user.name} />
        <Kanban board={board} />
      </div>
    </div>
  )
}
