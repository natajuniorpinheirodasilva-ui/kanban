import { prisma } from '@/lib/Prisma'
import { getCurrentUser } from '@/lib/auth'

type ColumnPositionUpdate = {
    id: string;
    position: number;
}

export async function PATCH(request: Request) {
    const user = await getCurrentUser()

    if (!user) {
        return Response.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { updates } = await request.json()

    if (
        !Array.isArray(updates) ||
        updates.length === 0 ||
        updates.length > 100 ||
        !updates.every((update: ColumnPositionUpdate) =>
            typeof update?.id === "string" &&
            typeof update?.position === "number" &&
            Number.isFinite(update.position) &&
            update.position >= 0
        )
    ) {
        return Response.json({ error: "Invalid column positions." }, { status: 400 })
    }

    const columnIds = [...new Set(updates.map((update: ColumnPositionUpdate) => update.id))]

    if (columnIds.length !== updates.length) {
        return Response.json({ error: "Duplicate columns are not allowed." }, { status: 400 })
    }

    const ownedColumnCount = await prisma.column.count({
        where: {
            id: { in: columnIds },
            board: { userId: user.id }
        }
    })

    if (ownedColumnCount !== columnIds.length) {
        return Response.json({ error: "Column not found." }, { status: 404 })
    }

    await prisma.$transaction(
        updates.map((update: ColumnPositionUpdate) =>
            prisma.column.update({
                where: { id: update.id },
                data: { position: update.position }
            })
        )
    )

    return Response.json({ success: true })
}

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
