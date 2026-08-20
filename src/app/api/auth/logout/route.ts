import { prisma } from "@/lib/Prisma"
import { cookies } from "next/headers"

export async function POST() {
    
    const cookieStorage = await cookies()
    const sessionCookie = cookieStorage.get("session")
    if (!sessionCookie) {
        return Response.json({ success: true })
    }

    await prisma.session.deleteMany({
        where: { token: sessionCookie.value }
    })

    cookieStorage.delete("session")

    return ( Response.json({ success: "Cookie successfully deleted" }) )
}
