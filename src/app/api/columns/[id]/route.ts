import { prisma } from '@/lib/Prisma'

export async function PATCH(request: Request, { params }: {params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await request.json()

    const column = await prisma.column.update({
        where: { id },
        data: body,
    })

    return Response.json(column)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    
    await prisma.column.delete({
        where: { id },
    })

    return Response.json({ success: true })
}