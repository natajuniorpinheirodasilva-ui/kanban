import { prisma } from '@/lib/Prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(request: Request, { params }: {params: Promise<{ id: string }> }) {
    const user = await getCurrentUser()
    
    if(!user) {
        return Response.json(
            { error: "Unauthorized" }, 
            { status: 401 }
        )
    }

    const { id } = await params
    const { title, position } = await request.json()

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

    if (title === undefined && position === undefined) {
        return Response.json(
            { error: "No valid fields provided." },
            { status: 400 }
        )
    }

    const column = await prisma.column.findFirst({
        where: {
            id,
            board: {
                userId: user.id
            }
        }
    })

    if(!column) {
        return Response.json(
            { error: "Column not found" },
            { status: 404 }
        )
    }

    const updatedColumn = await prisma.column.update({
        where: { id },
        data: {
            ...(title !== undefined && { title: title.trim() }),
            ...(position !== undefined && { position })
        }
    })

    return Response.json(updatedColumn)
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

    const column = await prisma.column.findFirst({
        where: {
            id,
            board: {
                userId: user.id
            }
        }
    })

    if (!column) {
        return Response.json(
            { error: "Column not found" },
            { status: 404 }
        )
    }

    await prisma.column.delete({
        where: { id },
    })

    return Response.json({ success: true })
}
