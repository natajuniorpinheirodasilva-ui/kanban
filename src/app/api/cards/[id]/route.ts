import { prisma } from '@/lib/Prisma'

export async function PATCH(request: Request, { params }: {params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await request.json()

    const card = await prisma.card.update({
        where: { id },
        data: body,
    })

    return Response.json(card)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    
    await prisma.card.delete({
        where: { id },
    })

    return Response.json({ success: true })
}