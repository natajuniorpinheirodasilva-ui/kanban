'use client'

import { useState } from "react"
import { Column, Card } from "@/generated/prisma/client"

type Props = {
    columns: Column[];
    onCreate: (card: Card) => void
}

const NewCardForm = ({ columns, onCreate }: Props) => {

    const [title, setTitle] = useState<string>('')
    const [titleError, setTitleError] = useState<boolean>(false)
    const [columnId, setColumnId] = useState<string>('')
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
            
            const newCard = await response.json()
            
            onCreate(newCard)
            setColumnId('')
            setTitle('')

        } catch(error) {
            setApiError(true)
        }
        
    }

    return (
    <div>
        {apiError &&
            <p>API Error, try again later.</p>
        }
    </div>
  )
}

export default NewCardForm