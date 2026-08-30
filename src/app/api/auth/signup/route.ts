import { prisma } from "@/lib/Prisma"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { isStrongPassword, isValidEmail, normalizeEmail, PASSWORD_REQUIREMENTS } from "@/lib/auth-validation"

export async function POST(request: Request) {
    const body = await request.json()
    const { name, email, password, rememberMe } = body

    if (
        typeof name !== "string" ||
        name.trim().length === 0 ||
        name.trim().length > 80 ||
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return Response.json(
            { error: "All fields are required." },
            { status: 400 }
        )
    }

    const normalizedEmail = normalizeEmail(email)

    if (!isValidEmail(normalizedEmail)) {
        return Response.json({ error: "Enter a valid e-mail address." }, { status: 400 })
    }

    if (!isStrongPassword(password)) {
        return Response.json({ error: PASSWORD_REQUIREMENTS }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email: normalizedEmail
        }
    })

    if (existingUser) {
        return Response.json(
            { error: "E-mail already in use." },
            { status: 409 }
        )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,

            boards: {
                create: {
                    title: "My Board",

                    columns: {
                        create: [
                            {
                                title: "To Do",
                                position: 100
                            },
                            {
                                title: "In Progress",
                                position: 200
                            },
                            {
                                title: "Done",
                                position: 300
                            }
                        ]
                    }
                }
            }
        }
    })

    const sessionToken = crypto.randomBytes(32).toString("hex")

    const expiresAt = new Date()
    expiresAt.setDate(
        expiresAt.getDate() + (rememberMe ? 30 : 1)
    )

    await prisma.session.create({
        data: {
            token: sessionToken,
            expiresAt,
            userId: user.id
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
            message: "Account created successfully.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        },
        { status: 201 }
    )
}
