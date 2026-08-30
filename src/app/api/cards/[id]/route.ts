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
    const { title, description, priority, labels, dueDate, position, columnId } = await request.json()

    if (title !== undefined && (typeof title !== "string" || title.trim().length === 0 || title.trim().length > 120)) {
        return Response.json(
            { error: "Invalid title." },
            { status: 400 }
        )
    }

    if (description !== undefined && (typeof description !== "string" || description.length > 2000)) {
        return Response.json({ error: "Invalid description." }, { status: 400 })
    }

    const priorities = ["NONE", "LOW", "MEDIUM", "HIGH"]
    if (priority !== undefined && (typeof priority !== "string" || !priorities.includes(priority))) {
        return Response.json({ error: "Invalid priority." }, { status: 400 })
    }

    if (
        labels !== undefined &&
        (!Array.isArray(labels) || labels.length > 8 || labels.some((label: unknown) =>
            typeof label !== "string" ||
            label.trim().length === 0 ||
            label.trim().length > 24 ||
            label.includes(",")
        ))
    ) {
        return Response.json({ error: "Invalid labels." }, { status: 400 })
    }

    if (
        dueDate !== undefined &&
        dueDate !== null &&
        dueDate !== "" &&
        (typeof dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate))
    ) {
        return Response.json({ error: "Invalid due date." }, { status: 400 })
    }

    const parsedDueDate = dueDate === null || dueDate === ""
        ? null
        : dueDate !== undefined && typeof dueDate === "string"
            ? new Date(`${dueDate}T12:00:00.000Z`)
            : undefined

    if (
        parsedDueDate instanceof Date &&
        (Number.isNaN(parsedDueDate.getTime()) || parsedDueDate.toISOString().slice(0, 10) !== dueDate)
    ) {
        return Response.json({ error: "Invalid due date." }, { status: 400 })
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

    if (
        title === undefined &&
        description === undefined &&
        priority === undefined &&
        labels === undefined &&
        dueDate === undefined &&
        position === undefined &&
        columnId === undefined
    ) {
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
            ...(description !== undefined && { description: description.trim() }),
            ...(priority !== undefined && { priority }),
            ...(labels !== undefined && {
                labels: [...new Set(labels.map((label: string) => label.trim()))].join(",")
            }),
            ...(dueDate !== undefined && { dueDate: parsedDueDate }),
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
