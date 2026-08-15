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
    
    // card useStates
    const [cards, setCards] = useState<Card[]>(board.columns.flatMap( (column) => column.cards) )
    const [cardDeleteError ,setCardDeleteError] = useState<boolean>(false)
    const [cardDeleteAlert, setCardDeleteAlert] = useState<boolean>(false)
    const [cardIdToDelete, setCardIdToDelete] = useState<string | null>(null)

    // column useStates
    const [columns, setColumns] = useState<Column[]>(board.columns)
    const [activeColumnForCard, setActiveColumnForCard] = useState<null | string>(null)
    const [newColumnButton, setNewColumnButton] = useState<boolean>(false)
    const [columnDeleteError, setColumnDeleteError] = useState<boolean>(false)
    const [columnIdToDelete, setColumnIdToDelete] = useState<string | null>(null)
    const [columnDeleteAlert, setColumnDeleteAlert] = useState<boolean>(false)

    function handleCardCreate(newCard: Card) {
        setCards([...cards, newCard])
        setActiveColumnForCard(null)
    }

    function handleColumnCreate(newColumn: Column) {
        setColumns([...columns, newColumn])
        setNewColumnButton(false)
    }

    // column delete function
    async function handleColumnDelete() {        
        if (!columnIdToDelete) return

        try {
            const response = await fetch(`/api/columns/${columnIdToDelete}`, {
                method: "DELETE",
            })
            if (!response.ok) {
                setColumnDeleteError(true)
                return
            }

            setColumns(columns.filter((column) => column.id !== columnIdToDelete))
            setCards(cards.filter((card) => card.columnId !== columnIdToDelete))

            setColumnDeleteAlert(false)
            setColumnIdToDelete(null)
        
        } catch (error) {
            setColumnDeleteError(true)
        }
    }

    // card delete function
    async function handleCardDelete() {
        if(!cardIdToDelete) return
        
        try {
            const response = await fetch(`/api/cards/${cardIdToDelete}`, {
                method: "DELETE",
            })
            if(!response.ok) {
                setCardDeleteError(true)
                return
            }

            setCards(cards.filter((card) => card.id !== cardIdToDelete))

            setCardDeleteAlert(false)
            setCardIdToDelete(null)

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
                        onClick={() => {
                            setColumnIdToDelete(column.id);
                            setColumnDeleteAlert(true); 
                        }}>
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
                        onClick={() => {
                            setCardIdToDelete(card.id); 
                            setCardDeleteAlert(true); 
                        }}>
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

        {/* delete card pop-up */}
        { cardDeleteAlert &&
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 pt-4 rounded-xl shadow-lg flex flex-col items-start min-h-35 w-auto border-b-4 border-red-500 scale-126">
                    <p className="font-semibold text-gray-800 text-xl underline decoration-2 decoration-red-500 drop-shadow-lg">
                        Delete this <span className="font-bold">card</span>?
                    </p>
                    
                    <div className="flex gap-6 w-full justify-start my-auto">
                        <button
                        className="w-auto text-left text-lg text-black hover:border-green-700 hover:bg-black/15 rounded-lg transition cursor-pointer border-b-2 hover:border-b-4 hover: shadow"
                        onClick={ () => handleCardDelete() }>
                            Continue
                        </button>
                        
                        <button
                        className="w-auto text-left text-lg text-black hover:border-red-700 hover:bg-black/15 rounded-lg transition cursor-pointer border-b-2 hover:border-b-4 shadow"
                        onClick={() => {
                            setCardDeleteAlert(false);
                            setCardIdToDelete(null)
                        }}>
                            Cancel
                        </button>
                    </div >  
                </div>
            </div>
        }

                { columnDeleteAlert &&
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 pt-4 rounded-xl shadow-lg flex flex-col items-start min-h-35 w-auto border-b-4 border-red-500 scale-126">
                    <p className="font-semibold text-gray-800 text-xl underline decoration-2 decoration-red-500 drop-shadow-lg">
                        Delete this <span className="font-bold">column</span>?
                    </p>
                    
                    <div className="flex gap-6 w-full justify-start my-auto">
                        <button
                        className="w-auto text-left text-lg text-black hover:border-green-700 hover:bg-black/15 rounded-lg transition cursor-pointer border-b-2 hover:border-b-4 hover: shadow"
                        onClick={ () => handleColumnDelete() }>
                            Continue
                        </button>
                        
                        <button
                        className="w-auto text-left text-lg text-black hover:border-red-700 hover:bg-black/15 rounded-lg transition cursor-pointer border-b-2 hover:border-b-4 shadow"
                        onClick={() => {
                            setColumnDeleteAlert(false);
                            setColumnIdToDelete(null)
                        }}>
                            Cancel
                        </button>
                    </div >  
                </div>
            </div>
        }

        
    </div>
)}

export default Kanban