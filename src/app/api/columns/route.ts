import { prisma } from '@/lib/Prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: Request) {
    const user = await getCurrentUser()

    if (!user) {
        return Response.json(
            { error: "Unauthorized." }, 
            { status: 401 }
        )
    }

    const body = await request.json()
    const { title, boardId } = body

    if(typeof title !== "string" || title.trim().length === 0) {
        return Response.json({ error: "Invalid Title." }, { status: 400 } )
    }
    if(typeof boardId !== "string" || boardId.length === 0) {
        return Response.json({ error: "Invalid Id." }, { status: 400 })
    }

    const board = await prisma.board.findFirst({
        where: {
            id: boardId,
            userId: user.id,
        }
    })

    if (!board) {
        return Response.json({ error: "Board not found." }, { status: 404 })
    }

    const lastColumn = await prisma.column.findFirst({
        where: { boardId },
        orderBy: { position: "desc" },
    })

    const newPosition = lastColumn ? lastColumn.position + 100 : 100

    const column = await prisma.column.create({
        data: {
            title: title.trim(),
            boardId,
            position: newPosition,
        }
    })

    return Response.json(column)
}
