'use client'

import { useState } from "react"
import { Column } from "@/generated/prisma/client"

type Props = {
    boardId: string;
    onCreate: (column: Column) => void;
    onCancel: () => void;
}

const NewColumnForm = ({ boardId, onCreate, onCancel }: Props) => {

    const [title, setTitle] = useState<string>('')
    const [titleError, setTitleError] = useState<boolean>(false)
    const [apiError, setApiError] = useState<boolean>(false)
    const [errorTrigger, setErrorTrigger] = useState<number>(0)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const hasTitleError = title.trim() === ""
        setTitleError(hasTitleError)

        if (hasTitleError) {
            setErrorTrigger(prev => prev + 1)
            return
        }
        try {
            const response = await fetch("/api/columns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, boardId })
            })
            if (!response.ok) {
                setApiError(true)
                setErrorTrigger(prev => prev + 1)
                return
            }

            const newColumn = await response.json()

            onCreate(newColumn)
            setTitle('')
            setApiError(false)

        } catch (error) {
            setApiError(true)
            setErrorTrigger(prev => prev + 1)
        }
    }

    return (
        <form
            className="flex flex-col w-72 h-auto self-start gap-2 bg-surface-muted border border-border rounded-xl p-4 shadow-sm shrink-0"
            onSubmit={handleSubmit} >
            <input
                className="border border-border rounded p-2 text-sm bg-input text-foreground outline-none focus:border-primary"
                placeholder="Column title..."
                value={title}
                type="text"
                autoFocus
                onChange={(e) => setTitle(e.target.value)} />

            <div className="flex items-center gap-2 mt-1">
                <button
                    className="bg-primary text-white text-sm font-medium rounded-lg px-3 py-1.5 hover:bg-primary/80 cursor-pointer transition hover-lift"
                    type="submit">
                    Add Column
                </button>
                <button
                    className="border-border border text-foreground-muted hover:text-foreground text-sm font-medium rounded-lg px-3 py-1.5 hover:bg-surface-elevated transition hover-lift"
                    type="button"
                    onClick={onCancel}>
                    Cancel
                </button>
            </div>

            {apiError &&
                <p
                    key={`api-${errorTrigger}`}
                    className="border-b rounded shadow border-r animate-error font-semibold text-sm mt-1 leading-tight pt-1 text-danger border-danger-border">
                    API Error, try again later.
                </p>
            }

            {titleError &&
                <p
                    key={`title-${errorTrigger}`}
                    className="border-b rounded shadow border-r animate-error font-semibold text-sm mt-1 leading-tight pt-1 text-danger border-danger-border">
                    Title error.
                </p>
            }
        </form>
    )
}

export default NewColumnForm
