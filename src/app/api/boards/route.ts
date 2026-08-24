import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/Prisma"

export async function POST(request: Request) {
    const user = await getCurrentUser()

    if (!user) {
        return Response.json(
            { error: "Unauthorized." },
            { status: 401 }
        )
    }

    const { title } = await request.json()

    if (typeof title !== "string" || title.trim().length === 0) {
        return Response.json(
            { error: "Invalid workspace title." },
            { status: 400 }
        )
    }

    const board = await prisma.board.create({
        data: {
            title: title.trim(),
            userId: user.id,
            columns: {
                create: [
                    { title: "To Do", position: 100 },
                    { title: "In Progress", position: 200 },
                    { title: "Done", position: 300 }
                ]
            }
        }
    })

    return Response.json(board, { status: 201 })
}
