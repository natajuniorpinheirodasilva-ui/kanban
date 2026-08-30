'use client'

import { useState } from "react"
import { Column, Card } from "@/generated/prisma/client"

type Props = {
    columns: Column[];
    initialColumnId?: string;
    onCreate: (card: Card) => void;
    onCancel: () => void;
}

const NewCardForm = ({ columns, initialColumnId = '', onCreate, onCancel }: Props) => {

    const [title, setTitle] = useState<string>('')
    const [columnId, setColumnId] = useState<string>(initialColumnId)

    const [titleError, setTitleError] = useState<boolean>(false)
    const [columnIdError, setColumnIdError] = useState<boolean>(false)

    const [apiError, setApiError] = useState<boolean>(false)
    const [errorTrigger, setErrorTrigger] = useState<number>(0)

    const errorClass = "border-b rounded shadow border-r animate-error font-semibold text-sm mt-1 pt-1 leading-3.5"

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()

        const hasTitleError = title === ""
        const hasColumnIdError = columnId === ""

        setTitleError(hasTitleError)
        setColumnIdError(hasColumnIdError)

        if (hasColumnIdError || hasTitleError) {
            setErrorTrigger(prev => prev + 1)
            return
        }
        try {
            const response = await fetch("/api/cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, columnId })
            })
            if (!response.ok) {
                setApiError(true)
                setErrorTrigger(prev => prev + 1)
                return
            }

            const newCard = await response.json()

            onCreate(newCard)
            setTitle('')
            setApiError(false)

        } catch (error) {
            setApiError(true)
            setErrorTrigger(prev => prev + 1)
        }
    }

    return (
        <form
            className="flex h-auto w-full flex-col gap-2 rounded-lg border border-border bg-surface-elevated p-3 font-sans shadow-sm"
            onSubmit={handleSubmit} >
            <input
                className="border border-border rounded p-2 bg-input text-foreground outline-none focus:border-primary"
                placeholder="Card title"
                value={title}
                type="text"
                onChange={(e) => setTitle(e.target.value)} />

            <select
                className="border border-border rounded p-2 bg-input text-foreground outline-none focus:border-primary"
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}>
                <option value="" disabled>Select a column</option>
                {columns.map((column) => (
                    <option
                        key={column.id}
                        value={column.id}>
                        {column.title}
                    </option>
                ))}
            </select>

            <div className="flex items-center gap-2 mt-1">
                <button
                    className="bg-primary text-white text-sm font-medium rounded-lg px-3 py-1.5 hover:bg-primary/80 cursor-pointer transition hover-lift"
                    type="submit">
                    Submit
                </button>
                <button
                    className="border-border border text-foreground-muted hover:text-foreground text-sm font-medium rounded-lg px-3 py-1.5 hover:bg-surface-muted transition hover-lift"
                    type="button"
                    onClick={onCancel}>
                    Cancel
                </button>
            </div>

            {apiError &&
                <p
                    key={`api-${errorTrigger}`}
                    className={errorClass}>
                    API Error, try again later.
                </p>
            }

            {columnIdError &&
                <p
                    key={`column-${errorTrigger}`}
                    className={errorClass}>
                    Column Id error.
                </p>
            }

            {titleError &&
                <p
                    key={`title-${errorTrigger}`}
                    className={errorClass}>
                    Title error.
                </p>
            }
        </form>
    )
}

export default NewCardForm
