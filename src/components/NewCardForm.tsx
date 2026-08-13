'use client'

import { useState } from "react"
import { Column, Card } from "@/generated/prisma/client"

type Props = {
    columns: Column[];
    onCreate: (card: Card) => void
}

const NewCardForm = ({ columns, onCreate }: Props) => {

    const [title, setTitle] = useState<string>('')
    const [columnId, setColumnId] = useState<string>('')

    const [titleError, setTitleError] = useState<boolean>(false)
    const [columnIdError, setColumnIdError] = useState<boolean>(false)

    const [apiError, setApiError] = useState<boolean>(false)

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        
        const hasTitleError = title === ""
        const hasColumnIdError = columnId === ""

        setTitleError(hasTitleError)
        setColumnIdError(hasColumnIdError)

        if (hasColumnIdError || hasTitleError ) {
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
                return
            }
            
            const newCard = await response.json()
            
            onCreate(newCard)
            setColumnId('')
            setTitle('')

        } catch(error) {
            setApiError(true)
        }
    }

    return (
    <form
    className="flex flex-col w-72 gap-2 bg-white/5 border border-black/20 rounded-xl p-4 shadow"
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

        { apiError && <p>API Error, try again later.</p>}
        { columnIdError && <p>Column Id error.</p> }
        { titleError && <p>Title error.</p> }
    </form>
  )
}

export default NewCardForm