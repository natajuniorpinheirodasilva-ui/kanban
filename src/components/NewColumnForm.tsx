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
    className="flex flex-col w-72 h-auto self-start gap-2 bg-gray-100 border border-black/10 rounded-xl p-4 shadow-sm shrink-0"
    onSubmit={handleSubmit} >
        <input
        className="border border-black/20 rounded p-2 text-sm bg-white"
        placeholder="Column title..."
        value={title}
        type="text"
        autoFocus
        onChange={(e) => setTitle(e.target.value)} />

        <div className="flex items-center gap-2 mt-1">
            <button
            className="bg-black text-white text-sm font-medium rounded-lg px-3 py-1.5 hover:bg-black/80 cursor-pointer transition"
            type="submit">
                Add Column
            </button>
            <button
            className="text-gray-500 hover:text-black text-sm font-medium rounded-lg px-3 py-1.5 hover:bg-black/5 transition"
            type="button"
            onClick={onCancel}>
                Cancel
            </button>
        </div>

        { apiError &&
            <p
            key={`api-${errorTrigger}`}
            className="border-b rounded shadow border-r animate-error font-semibold text-sm mt-1 leading-tight pt-1 text-red-500 border-red-200">
                API Error, try again later.
            </p>
        }

        { titleError &&
            <p
            key={`title-${errorTrigger}`}
            className="border-b rounded shadow border-r animate-error font-semibold text-sm mt-1 leading-tight pt-1 text-red-500 border-red-200">
                Title error.
            </p>
        }
    </form>
  )
}

export default NewColumnForm