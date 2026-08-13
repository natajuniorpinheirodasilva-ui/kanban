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
    
    function handleCardCreate(newCard: Card) {
        setCards([...cards, newCard])
    }

    function handleColumnCreate(newColumn: Column) {
        setColumns([...columns, newColumn])
    }

return(    
    <div className="flex justify-center" >
        <div className="flex gap-5">
        
        <NewCardForm columns={board.columns} onCreate={handleCardCreate}/>
        <NewColumnForm boardId={board.id} onCreate={handleColumnCreate} />
        
        {columns.map((column) => (
            <div className="flex flex-col w-72 gap-3 text" key={column.id}>
            <h2 className="text-base font-semibold text-black/70 uppercase tracking-wide rounded border-b pb-1 shadow">
                {column.title}
            </h2>

            {cards
             .filter( (card) => card.columnId === column.id )
             .map((card) => (
                <div
                key={card.id}
                className="bg-white/5 border border-black/20 rounded-xl p-4 text-black shadow"
                >
                {card.title}
                </div>
            ))}

            </div>
        ))}
        </div>
    </div>

)}

export default Kanban