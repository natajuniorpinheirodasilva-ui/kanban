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
    
    function handleCardCreate(newCard: Card) {
        setCards([...cards, newCard])
        setActiveColumnForCard(null)
    }

    function handleColumnCreate(newColumn: Column) {
        setColumns([...columns, newColumn])
        setNewColumnButton(false)
    }

return (    
    <div className="flex gap-5 p-6 overflow-x-auto items-start justify-start min-h-screen bg-gray-50/50" >
        
        {columns.map((column) => (
            <div className="flex flex-col w-72 gap-3 bg-gray-100 p-4 rounded-xl shadow-sm shrink-0 border border-black/5" key={column.id}>
                <h2 className="text-base font-semibold text-black/70 uppercase tracking-wide border-b pb-1">
                    {column.title}
                </h2>
                
                {cards
                 .filter( (card) => card.columnId === column.id )
                 .map((card) => (
                    <div
                        key={card.id}
                        className="bg-white border border-black/10 rounded-xl p-4 text-black shadow-sm">
                        {card.title}
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
                        className="mt-2 w-full text-left text-sm text-gray-500 hover:text-black hover:bg-black/5 p-2 rounded-lg transition"
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
             className="w-72 shrink-0 bg-black/5 hover:bg-black/10 text-black/70 font-medium py-3 px-4 rounded-xl text-left transition"
             onClick={ () => setNewColumnButton(true) }>
                + Add another column
            </button>
        )}

    </div>
)}

export default Kanban