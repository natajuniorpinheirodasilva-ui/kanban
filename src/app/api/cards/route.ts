import { prisma } from "@/lib/Prisma"

export async function POST(request: Request) {
    const body = await request.json()
    const { title, columnId } = body
    if (!title || title.trim().length === 0) {
        return Response.json({ error: "Invalid title." }, { "status": 400 })
    }
    if (!columnId || columnId.length === 0) {
        return Response.json({ error: "Invalid column." }, { "status": 400 })
    }

    const lastCard = await prisma.card.findFirst({
        where: { columnId },
        orderBy: { position: "desc" },
    })

    const newPosition = lastCard ? lastCard.position + 100 : 100

    const card = await prisma.card.create({
        data: {
            title,
            columnId,
            position: newPosition,
        }
    })

    return Response.json(card)
}