import { cookies } from "next/headers"
import { prisma } from "@/lib/Prisma"

export async function getCurrentUser() {
    const cookieStore = await cookies()

    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
        return null
    }

    const session = await prisma.session.findUnique({
        where: {
            token: sessionToken
        },
        include: {
            user: true
        }
    })

    if (!session) {
        return null
    }

    if (session.expiresAt < new Date()) {
        return null
    }

    return session.user
}