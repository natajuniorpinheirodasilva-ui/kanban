import { prisma } from '@/lib/Prisma'

export async function POST(request: Request) {
    const body = await request.json()
    const { title, boardId } = body

    if(!title || title.trim().length() === 0) {
        return Response.json({ error: "Invalid Title." }, { status: 400 } )
    }
    if(boardId.length === 0) {
        return Response.json({ error: "Invalid Id." }, { status: 400 })
    }

    const lastColumn = await prisma.column.findFirst({
        where: { boardId },
        orderBy: { position: "desc" },
    })

    const newPosition = lastColumn ? lastColumn.position + 100 : 100

    const column = await prisma.column.create({
        data: {
            title,
            boardId,
            position: newPosition,
        }
    })

    return Response.json(column)
}