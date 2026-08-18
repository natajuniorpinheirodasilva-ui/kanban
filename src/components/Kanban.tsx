'use client'

import { Card, Column } from "@/generated/prisma/client";
import { BoardWithColumnsAndCards } from "@/lib/board";
import NewCardForm from "@/components/NewCardForm";
import NewColumnForm from "./NewColumnForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useState } from "react";

type Props = {
    board: BoardWithColumnsAndCards
}

function Kanban ({ board }: Props) {

    const [cards, setCards] = useState<Card[]>(board.columns.flatMap( (column) => column.cards) )
    const [cardDeleteError ,setCardDeleteError] = useState<boolean>(false)
    const [cardDeleteAlert, setCardDeleteAlert] = useState<boolean>(false)
    const [cardIdToDelete, setCardIdToDelete] = useState<string | null>(null)

    const [columns, setColumns] = useState<Column[]>(board.columns)
    const [activeColumnForCard, setActiveColumnForCard] = useState<null | string>(null)
    const [newColumnButton, setNewColumnButton] = useState<boolean>(false)
    const [columnDeleteError, setColumnDeleteError] = useState<boolean>(false)
    const [columnIdToDelete, setColumnIdToDelete] = useState<string | null>(null)
    const [columnDeleteAlert, setColumnDeleteAlert] = useState<boolean>(false)

    const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null)

    const [draggedCardId, setDraggedCardId] = useState<string | null>(null)
    const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null)

    const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
    const [editingColumnTitle, setEditingColumnTitle] = useState<string>("")

    const [editingCardId, setEditingCardId] = useState<string | null>(null)
    const [editingCardTitle, setEditingCardTitle] = useState<string>("")

    function handleCardCreate(newCard: Card) {
        setCards([...cards, newCard])
        setActiveColumnForCard(null)
    }

    function handleColumnCreate(newColumn: Column) {
        setColumns([...columns, newColumn])
        setNewColumnButton(false)
    }

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

    async function handleColumnTitleSave(columnId: string) {
        const trimmedTitle = editingColumnTitle.trim()
        if (!trimmedTitle) {
            setEditingColumnId(null)
            return
        }

        setColumns(columns.map((col) => col.id === columnId ? { ...col, title: trimmedTitle } : col))
        setEditingColumnId(null)

        try {
            const response = await fetch(`/api/columns/${columnId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: trimmedTitle }),
            })
            if (!response.ok) {
                setColumnDeleteError(true)
            }
        } catch (error) {
            setColumnDeleteError(true)
        }
    }

    async function handleCardTitleSave(cardId: string) {
        const trimmedTitle = editingCardTitle.trim()
        if (!trimmedTitle) {
            setEditingCardId(null)
            return
        }

        setCards(cards.map((card) => card.id === cardId ? { ...card, title: trimmedTitle } : card))
        setEditingCardId(null)

        try {
            const response = await fetch(`/api/cards/${cardId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: trimmedTitle }),
            })
            if (!response.ok) {
                setCardDeleteError(true)
            }
        } catch (error) {
            setCardDeleteError(true)
        }
    }

    function handleCardDragStart(cardId: string) {
        setDraggedCardId(cardId)
    }

    async function handleCardDrop(targetColumnId: string) {
        if (!draggedCardId) return

        const draggedCard = cards.find((c) => c.id === draggedCardId)
        if (!draggedCard) return

        const columnCards = cards
            .filter((c) => c.columnId === targetColumnId && c.id !== draggedCardId)
            .sort((a, b) => a.position - b.position)

        const lastCard = columnCards[columnCards.length - 1]
        const newPosition = lastCard ? lastCard.position + 100 : 100

        setCards(cards.map((c) =>
            c.id === draggedCardId ? { ...c, columnId: targetColumnId, position: newPosition } : c
        ))

        try {
            const response = await fetch(`/api/cards/${draggedCardId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ columnId: targetColumnId, position: newPosition }),
            })
            if (!response.ok) {
                setCardDeleteError(true)
            }
        } catch (error) {
            setCardDeleteError(true)
        }

        setDraggedCardId(null)
    }

    function handleColumnDragStart(columnId: string) {
        setDraggedColumnId(columnId)
    }

    async function handleColumnDrop(targetColumnId: string) {
        if (!draggedColumnId || draggedColumnId === targetColumnId) {
            setDraggedColumnId(null)
            return
        }

        const draggedIndex = columns.findIndex((c) => c.id === draggedColumnId)
        const targetIndex = columns.findIndex((c) => c.id === targetColumnId)
        if (draggedIndex === -1 || targetIndex === -1) return

        const draggedColumn = columns[draggedIndex]
        const withoutDragged = columns.filter((c) => c.id !== draggedColumnId)
        const newTargetIndex = withoutDragged.findIndex((c) => c.id === targetColumnId)

        const insertAt = draggedIndex < targetIndex ? newTargetIndex + 1 : newTargetIndex

        const reordered = [
            ...withoutDragged.slice(0, insertAt),
            draggedColumn,
            ...withoutDragged.slice(insertAt),
        ]

        const repositioned = reordered.map((c, index) => ({ ...c, position: (index + 1) * 100 }))

        setColumns(repositioned)
        setDraggedColumnId(null)

        try {
            const response = await fetch(`/api/columns/${draggedColumn.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ position: repositioned.find((c) => c.id === draggedColumn.id)!.position }),
            })
            if (!response.ok) {
                setColumnDeleteError(true)
            }
        } catch (error) {
            setColumnDeleteError(true)
        }
    }

return (    
    <div className="flex gap-5 p-6 overflow-x-auto items-start justify-start min-h-screen bg-gray-50/50" >
        
        {columns.map((column) => (
            <div
                className={`flex flex-col w-72 gap-3 p-4 rounded-xl shadow-sm shrink-0 border transition-colors duration-200 ${
                    dragOverColumnId === column.id && (draggedColumnId || draggedCardId)
                        ? "bg-red-50 border-red-400"
                        : "bg-gray-100 border-black/5"
                } min-h-25`}
                key={column.id}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setDragOverColumnId(column.id)}
                onDrop={() => {
                    setDragOverColumnId(null)
                    if (draggedColumnId) {
                        handleColumnDrop(column.id)
                    } else {
                        handleCardDrop(column.id)
                    }
                }}
            >
                <h2
                    className={`flex items-center justify-between text-base font-semibold uppercase tracking-wide border-b pb-1 cursor-grab active:cursor-grabbing transition-all duration-200 ${
                        draggedColumnId === column.id
                            ? "opacity-40 text-red-700"
                            : "opacity-100 text-black/70"
                    }`}
                    draggable={editingColumnId !== column.id}
                    onDragStart={() => handleColumnDragStart(column.id)}
                    onDragEnd={() => setDraggedColumnId(null)}
                >
                    {editingColumnId === column.id ? (
                        <input
                            type="text"
                            className="bg-white border border-gray-300 rounded px-2 py-0.5 text-sm normal-case text-black focus:outline-none focus:ring-1 focus:ring-black w-full mr-2"
                            value={editingColumnTitle}
                            onChange={(e) => setEditingColumnTitle(e.target.value)}
                            onBlur={() => handleColumnTitleSave(column.id)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleColumnTitleSave(column.id)
                                if (e.key === "Escape") setEditingColumnId(null)
                            }}
                            autoFocus
                        />
                    ) : (
                        <span
                            className="cursor-pointer hover:underline break-words mr-2 flex-1 min-w-0"
                            title="Click to edit column title"
                            onClick={() => {
                                setEditingColumnId(column.id)
                                setEditingColumnTitle(column.title)
                            }}
                        >
                            {column.title}
                        </span>
                    )}

                    <button
                        className="text-sm normal-case tracking-normal font-bold cursor-pointer hover:bg-black/5 hover:rounded shrink-0"
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
                        draggable={editingCardId !== card.id}
                        onDragStart={() => handleCardDragStart(card.id)}
                        onDragEnd={() => setDraggedCardId(null)}
                        className={`flex items-center justify-between border rounded-xl p-4 text-black cursor-grab select-none active:cursor-grabbing transition-all duration-200 ${
                            draggedCardId === card.id
                                ? "opacity-60 scale-105 shadow-md bg-red-50 border-red-300"
                                : "opacity-100 scale-100 shadow-sm bg-white border-black/10"
                        }`}>
                        
                        {editingCardId === card.id ? (
                            <input
                                type="text"
                                className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black w-full mr-2"
                                value={editingCardTitle}
                                onChange={(e) => setEditingCardTitle(e.target.value)}
                                onBlur={() => handleCardTitleSave(card.id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCardTitleSave(card.id)
                                    if (e.key === "Escape") setEditingCardId(null)
                                }}
                                autoFocus
                            />
                        ) : (
                            <span
                                className="cursor-pointer hover:underline break-words mr-2 flex-1 min-w-0"
                                title="Click to edit card title"
                                onClick={() => {
                                    setEditingCardId(card.id)
                                    setEditingCardTitle(card.title)
                                }}
                            >
                                {card.title}
                            </span>
                        )}

                        <button
                        className="text-sm normal-case tracking-normal font-bold cursor-pointer hover:bg-black/5 hover:rounded p-1 shrink-0"
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

        { cardDeleteAlert &&
            <ConfirmDialog
                message="Delete this card?"
                onConfirm={handleCardDelete}
                onCancel={() => {
                    setCardDeleteAlert(false);
                    setCardIdToDelete(null)
                }}
            />
        }

        { columnDeleteAlert &&
            <ConfirmDialog
                message="Delete this column?"
                onConfirm={handleColumnDelete}
                onCancel={() => {
                    setColumnDeleteAlert(false);
                    setColumnIdToDelete(null)
                }}
            />
        }
    </div>
)}

export default Kanban