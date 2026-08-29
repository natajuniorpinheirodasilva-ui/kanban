import { prisma } from "@/lib/Prisma"
import { getCurrentUser } from "@/lib/auth"

type CardPositionUpdate = {
    id: string;
    columnId: string;
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
        updates.length > 500 ||
        !updates.every((update: CardPositionUpdate) =>
            typeof update?.id === "string" &&
            typeof update?.columnId === "string" &&
            typeof update?.position === "number" &&
            Number.isFinite(update.position) &&
            update.position >= 0
        )
    ) {
        return Response.json({ error: "Invalid card positions." }, { status: 400 })
    }

    const cardIds = [...new Set(updates.map((update: CardPositionUpdate) => update.id))]
    const columnIds = [...new Set(updates.map((update: CardPositionUpdate) => update.columnId))]

    if (cardIds.length !== updates.length) {
        return Response.json({ error: "Duplicate cards are not allowed." }, { status: 400 })
    }

    const [ownedCardCount, ownedColumnCount] = await Promise.all([
        prisma.card.count({
            where: {
                id: { in: cardIds },
                column: { board: { userId: user.id } }
            }
        }),
        prisma.column.count({
            where: {
                id: { in: columnIds },
                board: { userId: user.id }
            }
        })
    ])

    if (ownedCardCount !== cardIds.length || ownedColumnCount !== columnIds.length) {
        return Response.json({ error: "Card or column not found." }, { status: 404 })
    }

    await prisma.$transaction(
        updates.map((update: CardPositionUpdate) =>
            prisma.card.update({
                where: { id: update.id },
                data: {
                    columnId: update.columnId,
                    position: update.position
                }
            })
        )
    )

    return Response.json({ success: true })
}

export async function POST(request: Request) {
    const user = await getCurrentUser()

    if (!user) {
        return Response.json({ error: "Unauthorized." }, { status: 401 })
    }

    const body = await request.json()
    const { title, columnId } = body

    if (typeof title !== "string" || title.trim().length === 0) {
        return Response.json({ error: "Invalid title." }, { "status": 400 })
    }
    if (typeof columnId !== "string" || columnId.length === 0) {
        return Response.json({ error: "Invalid column." }, { "status": 400 })
    }

    const column = await prisma.column.findFirst({
        where: {
            id: columnId,
            board: {
                userId: user.id
            }
        }
    })

    if (!column) {
        return Response.json({ error: "Column not found." }, { status: 404 })
    }

    const lastCard = await prisma.card.findFirst({
        where: { columnId },
        orderBy: { position: "desc" },
    })

    const newPosition = lastCard ? lastCard.position + 100 : 100

    const card = await prisma.card.create({
        data: {
            title: title.trim(),
            columnId,
            position: newPosition,
        }
    })

    return Response.json(card)
}
