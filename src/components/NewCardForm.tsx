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
    <form onSubmit={handleSubmit} >
        <input
        value={title}
        type="text"
        onChange={ (e) => setTitle(e.target.value) }/>
        
        <select
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

        <button type="submit">Submit</button>

        { apiError && <p>API Error, try again later.</p>}
        { columnIdError && <p>Column Id error.</p> }
        { titleError && <p>Title error.</p> }
    </form>
  )
}

export default NewCardForm