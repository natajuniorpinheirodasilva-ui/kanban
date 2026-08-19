import { prisma } from '@/lib/Prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(request: Request, { params }: {params: Promise<{ id: string }> }) {
    const user = await getCurrentUser()

    if (!user) {
        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const { id } = await params
    const { title, position, columnId } = await request.json()

    if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
        return Response.json(
            { error: "Invalid title." },
            { status: 400 }
        )
    }

    if (position !== undefined && (typeof position !== "number" || position < 0)) {
        return Response.json(
            { error: "Invalid position." },
            { status: 400 }
        )
    }

    if (columnId !== undefined && (typeof columnId !== "string" || columnId.length === 0)) {
        return Response.json(
            { error: "Invalid column." },
            { status: 400 }
        )
    }

    if (title === undefined && position === undefined && columnId === undefined) {
        return Response.json(
            { error: "No valid fields provided." },
            { status: 400 }
        )
    }

    const existingCard = await prisma.card.findFirst({
        where: {
            id,
            column: {
                board: {
                    userId: user.id
                }
            }
        }
    })

    if (!existingCard) {
        return Response.json(
            { error: "Card not found." },
            { status: 404 }
        )
    }

    if (columnId !== undefined) {
        const targetColumn = await prisma.column.findFirst({
            where: {
                id: columnId,
                board: {
                    userId: user.id
                }
            }
        })

        if (!targetColumn) {
            return Response.json(
                { error: "Column not found." },
                { status: 404 }
            )
        }
    }

    const card = await prisma.card.update({
        where: { id },
        data: {
            ...(title !== undefined && { title: title.trim() }),
            ...(position !== undefined && { position }),
            ...(columnId !== undefined && { columnId })
        },
    })

    return Response.json(card)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser()

    if (!user) {
        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const { id } = await params

    const card = await prisma.card.findFirst({
        where: {
            id,
            column: {
                board: {
                    userId: user.id
                }
            }
        }
    })

    if (!card) {
        return Response.json(
            { error: "Card not found." },
            { status: 404 }
        )
    }

    await prisma.card.delete({
        where: { id },
    })

    return Response.json({ success: true })
}
