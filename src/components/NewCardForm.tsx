'use client'

import { useState } from "react"
import { Column, Card } from "@/generated/prisma/client"

type Props = {
    columns: Column[];
    onCreate: (card: Card) => void;
    className?: string;
}

const NewCardForm = ({ columns, onCreate }: Props) => {

    const [title, setTitle] = useState<string>('')
    const [columnId, setColumnId] = useState<string>('')

    const [titleError, setTitleError] = useState<boolean>(false)
    const [columnIdError, setColumnIdError] = useState<boolean>(false)

    const [apiError, setApiError] = useState<boolean>(false)
    const [errorTrigger, setErrorTrigger] = useState<number>(0)

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        
        const hasTitleError = title === ""
        const hasColumnIdError = columnId === ""

        setTitleError(hasTitleError)
        setColumnIdError(hasColumnIdError)

        if (hasColumnIdError || hasTitleError ) {
            setErrorTrigger(prev => prev + 1)
            return
        }
        try {
            const response = await fetch("/api/cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, columnId })
            })
            if(!response.ok) {
                setApiError(true)
                setErrorTrigger(prev => prev + 1)
                return
            }
            
            const newCard = await response.json()
            
            onCreate(newCard)
            setColumnId('')
            setTitle('')
            setApiError(false)

        } catch(error) {
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
        placeholder="Card title"
        value={title}
        type="text"
        onChange={ (e) => setTitle(e.target.value) }/>
        
        <select
         className="border border-black/20 rounded p-2"
         value={columnId}
         onChange={ (e) => setColumnId(e.target.value) }>
            <option value="" disabled>Select a column</option>
            {columns.map( (column) => (
                <option
                 key={column.id}
                 value={column.id}>
                    {column.title}
                </option>
            ))}
        </select>

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
        
        { columnIdError && 
            <p
            key={`column-${errorTrigger}`}
            className="border-b rounded shadow border-r animate-error font-semibold text-sm mt-1 leading-tight pt-1">
                Column Id error.
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

export default NewCardForm