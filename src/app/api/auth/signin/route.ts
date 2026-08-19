import { prisma } from "@/lib/Prisma"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function POST(request: Request) {
    const body = await request.json()
    const { email, password, rememberMe } = body

    if (!email || !password) {
        return Response.json(
            { error: "Invalid credentials." },
            { status: 400 }
        )
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (!existingUser) {
        return Response.json(
            { error: "Invalid credentials." },
            { status: 401 }
        )
    }

    const passwordMatches = await bcrypt.compare(
        password,
        existingUser.password
    )

    if (!passwordMatches) {
        return Response.json(
            { error: "Invalid credentials." },
            { status: 401 }
        )
    }

    const sessionToken = crypto.randomBytes(32).toString("hex")

    const expiresAt = new Date()

    if (rememberMe) {
        expiresAt.setDate(expiresAt.getDate() + 30)
    } else {
        expiresAt.setHours(expiresAt.getHours() + 24)
    }

    await prisma.session.create({
        data: {
            token: sessionToken,
            expiresAt,
            userId: existingUser.id
        }
    })

    const cookieStore = await cookies()

    cookieStore.set("session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        ...(rememberMe && {
            expires: expiresAt
        })
    })

    return Response.json(
        {
            message: "Signed in successfully.",
            user: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email
            }
        },
        { status: 200 }
    )
}