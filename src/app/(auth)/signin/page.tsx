'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { GripVertical, Lightbulb } from "lucide-react"
import { useRouter } from "next/navigation"

import Input from "@/components/auth/Input"
import Button from "@/components/auth/Button"

type Card = {
    id: string
    title: string
    tag: string
    description?: string
    detail?: string
    tagType?: "red" | "gray"
    urgent?: boolean
    completed?: boolean
}

type Column = {
    id: string
    title: string
    dotColor: string
    cards: Card[]
}

const allPossibleCards: Card[] = [
    {
        id: "1",
        title: "New UI Mockups",
        description: "Create sign up flows",
        tag: "Design",
        tagType: "red"
    },
    {
        id: "2",
        title: "API Integration",
        detail: "2 days left",
        tag: "Dev",
        tagType: "gray"
    },
    {
        id: "3",
        title: "Auth Feature",
        tag: "Urgent",
        urgent: true
    },
    {
        id: "4",
        title: "Tailwind Styles",
        tag: "Frontend",
        tagType: "gray"
    },
    {
        id: "5",
        title: "Database Setup",
        tag: "Done",
        completed: true
    },
    {
        id: "6",
        title: "Fix Navbar Bug",
        description: "Mobile view overflow",
        tag: "Bug",
        tagType: "red"
    },
    {
        id: "7",
        title: "User Testing",
        detail: "Next week",
        tag: "QA",
        tagType: "gray"
    },
    {
        id: "8",
        title: "Dark Mode Support",
        tag: "Feature",
        urgent: true
    },
    {
        id: "9",
        title: "Write Documentation",
        tag: "Docs",
        tagType: "gray",
        completed: true
    },
]

export default function SignIn() {
    const router = useRouter()

    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [rememberMe, setRememberMe] = useState<boolean>(false)

    const [signInError, setSignInError] = useState<boolean>(false)
    const [unexpectedError, setUnexpectedError] = useState<boolean>(false)

    async function handleSignIn(event: React.SubmitEvent) {
        event.preventDefault()

        setSignInError(false)
        setUnexpectedError(false)

        if (email.length === 0) {
            setSignInError(true)
        }

        if (password.length === 0) {
            setSignInError(true)
        }

        if (email.length === 0 || password.length === 0) {
            return
        }

        try {
            const response = await fetch("/api/auth/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password,
                    rememberMe
                })
            })

            if (response.status === 401 || response.status === 409) {
                setSignInError(true)
                return
            }

            if (!response.ok) {
                setUnexpectedError(true)
                return
            }

            router.push("/board")
        } catch (error) {
            setUnexpectedError(true)
        }
    }

    const [columns, setColumns] = useState<Column[]>([
        {
            id: "todo",
            title: "To Do",
            dotColor: "bg-foreground-muted",
            cards: []
        },
        {
            id: "in-progress",
            title: "In Progress",
            dotColor: "bg-primary animate-ping",
            cards: []
        },
        {
            id: "done",
            title: "Done",
            dotColor: "bg-foreground",
            cards: []
        }
    ])

    const [draggedItem, setDraggedItem] = useState<{
        cardId: string
        sourceColId: string
    } | null>(null)

    useEffect(() => {
        const shuffledCards = [...allPossibleCards].sort(
            () => Math.random() - 0.5
        )

        setColumns([
            {
                id: "todo",
                title: "To Do",
                dotColor: "bg-foreground-muted",
                cards: shuffledCards.slice(0, 2)
            },
            {
                id: "in-progress",
                title: "In Progress",
                dotColor: "bg-primary animate-ping",
                cards: shuffledCards.slice(2, 4)
            },
            {
                id: "done",
                title: "Done",
                dotColor: "bg-foreground",
                cards: shuffledCards.slice(4, 6)
            }
        ])
    }, [])

    const handleDragStart = (cardId: string, sourceColId: string) => {
        setDraggedItem({ cardId, sourceColId })
    }

    const handleDragEnd = () => {
        setDraggedItem(null)
    }

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault()
    }

    const handleDrop = (targetColId: string) => {
        if (!draggedItem) return

        const { cardId, sourceColId } = draggedItem

        if (sourceColId === targetColId) {
            setDraggedItem(null)
            return
        }

        setColumns(prevColumns => {
            const sourceColumn = prevColumns.find(
                column => column.id === sourceColId
            )

            const movedCard = sourceColumn?.cards.find(
                card => card.id === cardId
            )

            if (!movedCard) return prevColumns

            return prevColumns.map(column => {
                if (column.id === sourceColId) {
                    return {
                        ...column,
                        cards: column.cards.filter(
                            card => card.id !== cardId
                        )
                    }
                }

                if (column.id === targetColId) {
                    return {
                        ...column,
                        cards: [...column.cards, movedCard]
                    }
                }

                return column
            })
        })

        setDraggedItem(null)
    }

    return (
        <div className="flex w-full min-h-screen">
            {/* Left side */}
            <div className="hidden lg:flex w-1/2 bg-background relative overflow-hidden items-center justify-center p-6 select-none border-r border-border">
                <div className="group absolute top-6 text-xs text-foreground-muted font-medium flex items-center gap-2 bg-surface px-3 py-1.5 rounded-full border border-border shadow-sm z-20 pulse hover-lift hover:bg-primary hover:text-white">
                    <Lightbulb className="w-4 h-4 text-primary-muted group-hover:text-white" />
                    <span>Drag cards to reorder</span>
                </div>

                <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[2.5rem_2.5rem] mask-[radial-gradient(ellipse_65%_55%_at_50%_50%,#000_70%,transparent_100%)] opacity-70" />

                {/* Kanban */}
                <div className="relative z-10 flex w-full max-w-xl gap-3 xl:gap-4 -rotate-2 xl:-rotate-3 hover:rotate-0 transition-transform duration-500 ease-out mt-6">
                    {columns.map(column => (
                        <div
                            key={column.id}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(column.id)}
                            className="flex-1 min-w-0 max-w-42.5 xl:max-w-50 bg-surface/90 backdrop-blur-md border border-border rounded-xl p-2.5 xl:p-3 flex flex-col gap-3 shadow-xl min-h-80"
                        >
                            <div className="flex items-center justify-between px-0.5">
                                <span className="text-[11px] xl:text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5 truncate">
                                    <span
                                        className={`w-2 h-2 rounded-full shrink-0 ${column.dotColor}`}
                                    />
                                    <span className="truncate">
                                        {column.title}
                                    </span>
                                </span>

                                <span className="text-[10px] xl:text-xs font-bold text-foreground-muted bg-surface-muted px-1.5 py-0.5 rounded-full border border-border shrink-0">
                                    {column.cards.length}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2.5 flex-1">
                                {column.cards.map(card => {
                                    const cardStyle = card.urgent
                                        ? "bg-surface-elevated border border-danger/40 shadow-md shadow-danger/5"
                                        : "bg-surface-elevated border border-border shadow-sm hover:border-foreground-muted"

                                    const tagStyle =
                                        card.tagType === "red" || card.urgent
                                            ? "text-danger bg-danger-light border border-danger-border"
                                            : card.completed
                                                ? "text-foreground bg-surface-muted"
                                                : "text-foreground-muted bg-surface-muted"

                                    return (
                                        <div
                                            key={card.id}
                                            draggable
                                            onDragStart={() =>
                                                handleDragStart(
                                                    card.id,
                                                    column.id
                                                )
                                            }
                                            onDragEnd={handleDragEnd}
                                            className={`
                                                cursor-grab active:cursor-grabbing
                                                transition-all duration-200
                                                p-2.5 rounded-lg relative overflow-hidden
                                                ${cardStyle}
                                                ${draggedItem?.cardId === card.id
                                                    ? "opacity-30 scale-95"
                                                    : "opacity-100"
                                                }
                                            `}
                                        >
                                            {card.urgent && (
                                                <div className="absolute top-0 left-0 w-1 h-full bg-danger" />
                                            )}

                                            <div className="flex items-center justify-between gap-1">
                                                <span
                                                    className={`
                                                        text-[9px] xl:text-[10px]
                                                        font-semibold px-2 py-0.5
                                                        rounded-full truncate
                                                        ${tagStyle}
                                                    `}
                                                >
                                                    {card.tag}
                                                </span>

                                                <GripVertical className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
                                            </div>

                                            <h4
                                                className={`text-xs font-semibold mt-1.5 leading-snug ${card.completed
                                                    ? "text-foreground-muted line-through"
                                                    : "text-foreground"
                                                    }`}
                                            >
                                                {card.title}
                                            </h4>

                                            {card.description && (
                                                <p className="text-[10px] xl:text-[11px] text-foreground-muted mt-1 leading-tight">
                                                    {card.description}
                                                </p>
                                            )}

                                            {card.urgent && (
                                                <div className="w-full bg-surface-muted rounded-full h-1.5 mt-2.5 overflow-hidden">
                                                    <div className="bg-danger h-1.5 rounded-full w-3/4 animate-pulse" />
                                                </div>
                                            )}

                                            {card.detail && (
                                                <div className="mt-2.5 flex items-center justify-between text-[10px] text-foreground-muted">
                                                    <span>{card.detail}</span>

                                                    <div className="w-4 h-4 rounded-full bg-foreground flex items-center justify-center font-bold text-[8px] text-surface">
                                                        JS
                                                    </div>
                                                </div>
                                            )}

                                            {card.completed && (
                                                <p className="text-[10px] text-foreground-muted mt-1.5 flex items-center gap-1">
                                                    ✓ Completed
                                                </p>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right side */}
            <div className="relative flex flex-col justify-center items-center w-full lg:w-1/2 bg-linear-to-br from-primary-dark via-primary to-primary-deep overflow-hidden p-6 xl:p-8">
                <form
                    onSubmit={handleSignIn}
                    className="relative z-10 flex flex-col items-center w-full max-w-sm sm:max-w-md bg-surface/95 backdrop-blur-xl border border-border shadow-2xl p-6 sm:p-10 rounded-3xl"
                >
                    <h1 className="text-3xl font-bold text-foreground">
                        Sign in
                    </h1>

                    <p className="text-sm text-foreground-muted mt-1 mb-6">
                        Sign in to continue
                    </p>

                    <div className="w-full max-w-70 sm:max-w-[320px] flex flex-col items-center">
                        <Input
                            type="email"
                            placeholder="E-mail"
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Input
                            type="password"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <div className="flex items-center justify-start gap-2.5 w-full mt-3 mb-6">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 accent-primary cursor-pointer rounded shrink-0 ml-4"
                            />

                            <label
                                htmlFor="remember"
                                className="text-sm text-foreground-muted cursor-pointer select-none leading-none"
                            >
                                Remember me
                            </label>
                        </div>

                        <Button
                            type="submit"
                        >
                            Sign in
                        </Button>
                    </div>

                    <p className="mt-6 text-sm text-foreground">
                        Don't have an account?{" "}
                        <Link
                            className="text-primary font-semibold underline"
                            href="/signup"
                        >
                            Sign up
                        </Link>
                    </p>

                    {(signInError || unexpectedError) && (
                        <div className="w-3/4 h-px bg-linear-to-r from-transparent via-danger to-transparent mt-2" />
                    )}

                    {signInError && (
                        <p className="w-full mt-3 mb-3 text-xs text-danger font-medium text-center">
                            Please check the fields and try again.
                        </p>
                    )}

                    {unexpectedError && (
                        <div className="w-full mt-3 mb-3 text-xs text-danger font-medium text-center">
                            <p className="text-xs text-danger-hover font-medium">
                                Something went wrong. Please try again.
                            </p>
                        </div>
                    )}

                </form>
            </div>
        </div>
    )
}
