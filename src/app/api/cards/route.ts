import { prisma } from "@/lib/Prisma"
import { getCurrentUser } from "@/lib/auth"

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
