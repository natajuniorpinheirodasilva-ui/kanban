import Kanban from "@/components/kanban/Kanban"
import NavBar from "@/components/ui/NavBar"
import { getCurrentUser } from "@/lib/auth"
import { boardInclude } from "@/lib/board"
import { prisma } from "@/lib/Prisma"
import { redirect } from "next/navigation"

type Props = {
    params: Promise<{
        id: string;
    }>;
}

export default async function BoardPage({ params }: Props) {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/signup")
    }

    const { id } = await params

    const [board, workspaces] = await Promise.all([
        prisma.board.findFirst({
            where: {
                id,
                userId: user.id
            },
            include: boardInclude
        }),
        prisma.board.findMany({
            where: {
                userId: user.id
            },
            select: {
                id: true,
                title: true
            },
            orderBy: {
                title: "asc"
            }
        })
    ])

    if (!board) {
        redirect("/board")
    }

    return (
        <div>
            <NavBar userName={user.name} />
            <Kanban
                key={board.id}
                board={board}
                workspaces={workspaces}
            />
        </div>
    )
}
