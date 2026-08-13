'use client'

import { useState } from "react"
import { Column } from "@/generated/prisma/client"

type Props = {
    boardId: string;
    onCreate: (column: Column) => void;
}

const NewColumnForm = ({ boardId, onCreate }: Props) => {

    const [title, setTitle] = useState<string>('')
    const [titleError, setTitleError] = useState<boolean>(false)
    const [apiError, setApiError] = useState<boolean>(false)
    const [errorTrigger, setErrorTrigger] = useState<number>(0)

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()

        const hasTitleError = title === ""
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
    className="flex flex-col w-72 h-auto self-start gap-2 bg-white/5 border border-black/20 rounded-xl p-4 shadow-sm"
    onSubmit={handleSubmit} >
        <input
        className="border border-black/20 rounded p-2"
        placeholder="Column title"
        value={title}
        type="text"
        onChange={(e) => setTitle(e.target.value)} />

        <button
        className="bg-black/80 text-white rounded p-2 hover:bg-black/70 cursor-pointer"
        type="submit">
            Submit
        </button>

        { apiError &&
            <p
            key={`api-${errorTrigger}`}
            className="border-b rounded shadow border-r animate-error font-semibold text-sm mt-1 leading-tight pt-1">
                API Error, try again later.
            </p>
        }

        { titleError &&
            <p
            key={`title-${errorTrigger}`}
            className="border-b rounded shadow border-r animate-error font-semibold text-sm mt-1 leading-tight pt-1">
                Title error.
            </p>
        }
    </form>
  )
}

export default NewColumnForm