'use client'

import { Card, Column } from "@/generated/prisma/client";
import { BoardWithColumnsAndCards } from "@/lib/board";
import NewCardForm from "@/components/NewCardForm";
import NewColumnForm from "./NewColumnForm";
import { useState } from "react";

type Props = {
    board: BoardWithColumnsAndCards
}

function Kanban ({ board }: Props) {

    const [cards, setCards] = useState<Card[]>(board.columns.flatMap( (column) => column.cards) )
    const [columns, setColumns] = useState<Column[]>(board.columns)
    
    const [activeColumnForCard, setActiveColumnForCard] = useState<null | string>(null)
    const [newColumnButton, setNewColumnButton] = useState<boolean>(false)

    const [columnDeleteError, setColumnDeleteError] = useState<boolean>(false)
    const [cardDeleteError ,setCardDeleteError] = useState<boolean>(false)
    
    function handleCardCreate(newCard: Card) {
        setCards([...cards, newCard])
        setActiveColumnForCard(null)
    }

    function handleColumnCreate(newColumn: Column) {
        setColumns([...columns, newColumn])
        setNewColumnButton(false)
    }

    async function handleColumnDelete(columnId: string) {
        if (!window.confirm("Delete this column and all its cards?")) {
            return
        }

        try {
            const response = await fetch(`/api/columns/${columnId}`, {
                method: "DELETE",
            })
            if (!response.ok) {
                setColumnDeleteError(true)
                return
            }

            setColumns(columns.filter((column) => column.id !== columnId))
            setCards(cards.filter((card) => card.columnId !== columnId))

        } catch (error) {
            setColumnDeleteError(true)
        }
    }

    async function handleCardDelete(cardId: string) {
        if(!window.confirm("Delete this card?")) {
            return
        }
        
        try {
            const response = await fetch(`/api/cards/${cardId}`, {
                method: "DELETE",
            })
            if(!response.ok) {
                setCardDeleteError(true)
                return
            }

            setCards(cards.filter((card) => card.id !== cardId))

        } catch (error) {
            setCardDeleteError(true)
        }
    }

return (    
    <div className="flex gap-5 p-6 overflow-x-auto items-start justify-start min-h-screen bg-gray-50/50" >
        
        {columns.map((column) => (
            <div className="flex flex-col w-72 gap-3 bg-gray-100 p-4 rounded-xl shadow-sm shrink-0 border border-black/5" key={column.id}>
                <h2 className="flex items-center justify-between text-base font-semibold text-black/70 uppercase tracking-wide border-b pb-1">
                    <span>{column.title}</span>
                    <button
                        className="text-sm normal-case tracking-normal font-bold cursor-pointer hover:bg-black/5 hover:rounded"
                        onClick={() => handleColumnDelete(column.id)}>
                            Delete Column
                    </button>
                </h2>

                
                {cards
                .filter( (card) => card.columnId === column.id )
                .map((card) => (
                    <div
                        key={card.id}
                        className="flex items-center justify-between bg-white border border-black/10 rounded-xl p-4 text-black shadow-sm">
                        <span>{card.title}</span>
                        <button
                        className="text-sm normal-case tracking-normal font-bold cursor-pointer hover:bg-black/5 hover:rounded p-1"
                        onClick={() => handleCardDelete(card.id)}>
                            Delete
                        </button>
                    </div>
                ))}

                {activeColumnForCard === column.id ? (
                    <NewCardForm
                        key={column.id}
                        columns={columns}
                        initialColumnId={column.id}
                        onCreate={handleCardCreate}
                        onCancel={() => setActiveColumnForCard(null)}/>
                ) : (
                    <button
                        className="mt-2 w-full text-left text-sm text-gray-500 hover:text-black hover:bg-black/5 p-2 rounded-lg transition cursor-pointer"
                        onClick={() => setActiveColumnForCard(column.id)}>
                            + Add Card
                    </button>
                )}
            </div>
        ))}

        {newColumnButton ? (
            <NewColumnForm 
                boardId={board.id}
                onCreate={handleColumnCreate}
                onCancel={() => setNewColumnButton(false)}
            />
        ) : (
            <button
             className="w-auto shrink-0 bg-black/5 hover:bg-black/10 text-black/70 font-medium py-3 px-4 rounded-xl text-left transition cursor-pointer"
             onClick={ () => setNewColumnButton(true) }>
                + Add column
            </button>
        )}

    </div>
)}

export default Kanban