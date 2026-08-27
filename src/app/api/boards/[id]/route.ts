import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/Prisma";

export async function PATCH(request: Request, { params }: {params: Promise<{ id: string }> }) {
    const user = await getCurrentUser()
    if(!user) {
        return (Response.json(
            {error: "Invalid session."},
            {status: 401}
        ))
    }

    const { id } = await params
    const { title } = await request.json()

    if (typeof title !== "string" ||  title.trim().length === 0) {
        return (Response.json(
            {error: "Invalid title."},
            {status: 400}
        ))
    }

    const board = await prisma.board.findFirst({
        where: {
            id,
            userId: user.id
        }
    })

    if (!board) {
        return (Response.json(
            {error: "Board not found."},
            {status: 404}
        ))
    }

    const updateBoard = await prisma.board.update({
        where: { id },
        data: {
            title: title.trim()
        }
    })
    
    return Response.json(updateBoard)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser()
    if(!user) {
        return (Response.json(
            {error: "Invalid session."},
            {status: 401}
        ))
    }

    const { id } = await params

    const board = await prisma.board.findFirst({
        where: {
            id,
            userId: user.id
        }
    })
    
    if (!board) {
        return(Response.json(
            {error: "Board not found." },
            {status: 404}
        ))
    }

    const boardCount = await prisma.board.count({
        where: {
            userId: user.id
        }
    })

    if (boardCount <= 1) {
        return(Response.json(
            {error: "Cannot delete the last workspace."},
            {status: 409}
        ))
    }

    const nextWorkspace = await prisma.board.findFirst({
        where: {
            userId: user.id,
            id: {
                not: id
            }
        },
        select: {
            id: true
        }
    })

    if (!nextWorkspace) {
        return Response.json(
            {error: "Invalid next workspace"},
            {status: 409}
        )
    }

    await prisma.board.delete({
        where: {
            id
        }
    })

    return (Response.json(
        {
            success: true,
            nextWorkspaceId: nextWorkspace.id
        }
    ))
}
