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
    select: {
      id: true
    }
  })

  if (!board) { return <h1>No board found.</h1> }

  redirect(`/board/${board.id}`)
}
