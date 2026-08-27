'use client'

import { Card, Column } from "@/generated/prisma/client"
import { BoardWithColumnsAndCards } from "@/lib/board"
import NewColumnForm from "./NewColumnForm"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import KanbanColumn from "./KanbanColumn"
import WorkspaceSwitcher from "./WorkspaceSwitcher"
import { useState } from "react"

type Props = {
    board: BoardWithColumnsAndCards;
    workspaces: {
        id: string;
        title: string;
    }[];
}

function Kanban({ board, workspaces }: Props) {
    const [cards, setCards] = useState<Card[]>(board.columns.flatMap((column) => column.cards))
    const [cardDeleteError, setCardDeleteError] = useState<boolean>(false)
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
    const [isSavingColumn, setIsSavingColumn] = useState(false)
    const [columnEditError, setColumnEditError] = useState(false)

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
        if (!cardIdToDelete) return

        try {
            const response = await fetch(`/api/cards/${cardIdToDelete}`, {
                method: "DELETE",
            })
            if (!response.ok) {
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
            setColumnEditError(true)
            return
        }

        setColumnEditError(false)
        setIsSavingColumn(true)

        try {
            const response = await fetch(`/api/columns/${columnId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: trimmedTitle }),
            })

            if (!response.ok) {
                setColumnEditError(true)
                return
            }

            const updatedColumn: Column = await response.json()
            setColumns((currentColumns) => currentColumns.map((column) =>
                column.id === columnId ? updatedColumn : column
            ))
            setEditingColumnId(null)
            setEditingColumnTitle("")
        } catch {
            setColumnEditError(true)
        } finally {
            setIsSavingColumn(false)
        }
    }

    async function handleCardTitleSave(cardId: string) {
        const trimmedTitle = editingCardTitle.trim()
        if (!trimmedTitle) {
            setEditingCardId(null)
            return
        }

        setCards(cards.map((card) => (card.id === cardId ? { ...card, title: trimmedTitle } : card)))
        setEditingCardId(null)

        try {
            const response = await fetch(`/api/cards/${cardId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: trimmedTitle }),
            })
            if (!response.ok) setCardDeleteError(true)
        } catch (error) {
            setCardDeleteError(true)
        }
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

        setCards(
            cards.map((c) =>
                c.id === draggedCardId ? { ...c, columnId: targetColumnId, position: newPosition } : c
            )
        )

        try {
            const response = await fetch(`/api/cards/${draggedCardId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ columnId: targetColumnId, position: newPosition }),
                })
            if (!response.ok) setCardDeleteError(true)
        } catch (error) {
            setCardDeleteError(true)
        }

        setDraggedCardId(null)
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
            if (!response.ok) setColumnDeleteError(true)
        } catch (error) {
            setColumnDeleteError(true)
        }
    }

    return (
        <section className="relative z-0 mx-5 mt-4 min-h-[80vh] overflow-hidden rounded-2xl border border-border border-t-2 border-t-primary bg-surface shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface px-6 py-4">
                <WorkspaceSwitcher
                    workspaces={workspaces}
                    activeWorkspaceId={board.id}
                />

                <button
                    type="button"
                    disabled={newColumnButton}
                    onClick={() => setNewColumnButton(true)}
                    className="hover-lift rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                    New column
                </button>
            </div>

            <div className="flex items-start justify-start gap-5 overflow-x-auto p-6">
                {columns.map((column) => {
                    const columnCards = cards.filter((card) => card.columnId === column.id)
                    const isDragOver = dragOverColumnId === column.id && Boolean(draggedColumnId || draggedCardId)

                    return (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            cards={columnCards}
                            columns={columns}
                            isDragOver={isDragOver}
                            isColumnDragging={draggedColumnId === column.id}
                            draggedCardId={draggedCardId}
                            onDragOverColumn={setDragOverColumnId}
                            onDropOnColumn={(colId) => {
                                setDragOverColumnId(null)
                                if (draggedColumnId) {
                                    handleColumnDrop(colId)
                                } else {
                                    handleCardDrop(colId)
                                }
                            }}
                            onColumnDragStart={setDraggedColumnId}
                            onColumnDragEnd={() => setDraggedColumnId(null)}
                            editingColumnId={editingColumnId}
                            editingColumnTitle={editingColumnTitle}
                            isSavingColumn={isSavingColumn}
                            columnEditError={columnEditError}
                            onStartEditColumn={(col) => {
                                setColumnEditError(false)
                                setEditingColumnId(col.id)
                                setEditingColumnTitle(col.title)
                            }}
                            onEditColumnTitleChange={setEditingColumnTitle}
                            onSaveColumnTitle={handleColumnTitleSave}
                            onCancelEditColumn={() => {
                                setEditingColumnId(null)
                                setEditingColumnTitle("")
                                setColumnEditError(false)
                            }}
                            onDeleteColumnClick={(colId) => {
                                setColumnIdToDelete(colId)
                                setColumnDeleteAlert(true)
                            }}
                            editingCardId={editingCardId}
                            editingCardTitle={editingCardTitle}
                            onCardDragStart={setDraggedCardId}
                            onCardDragEnd={() => setDraggedCardId(null)}
                            onStartEditCard={(card) => {
                                setEditingCardId(card.id)
                                setEditingCardTitle(card.title)
                            }}
                            onEditCardTitleChange={setEditingCardTitle}
                            onSaveCardTitle={handleCardTitleSave}
                            onCancelEditCard={() => setEditingCardId(null)}
                            onDeleteCardClick={(cardId) => {
                                setCardIdToDelete(cardId)
                                setCardDeleteAlert(true)
                            }}
                            activeColumnForCard={activeColumnForCard}
                            onActivateNewCardForm={setActiveColumnForCard}
                            onCancelNewCardForm={() => setActiveColumnForCard(null)}
                            onCardCreate={handleCardCreate}
                        />
                    )
                })}

                {newColumnButton && (
                    <NewColumnForm
                        boardId={board.id}
                        onCreate={handleColumnCreate}
                        onCancel={() => setNewColumnButton(false)}
                    />
                )}
            </div>

            {cardDeleteAlert && (
                <ConfirmDialog
                    message="Delete this card?"
                    hasError={cardDeleteError}
                    onConfirm={handleCardDelete}
                    onCancel={() => {
                        setCardDeleteAlert(false)
                        setCardIdToDelete(null)
                    }}
                />
            )}

            {columnDeleteAlert && (
                <ConfirmDialog
                    message="Delete this column?"
                    hasError={columnDeleteError}
                    onConfirm={handleColumnDelete}
                    onCancel={() => {
                        setColumnDeleteAlert(false)
                        setColumnIdToDelete(null)
                    }}
                />
            )}
        </section>
    )
}

export default Kanban
