'use client'

import { Card, Column } from "@/generated/prisma/client"
import { BoardWithColumnsAndCards } from "@/lib/board"
import NewColumnForm from "./NewColumnForm"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import KanbanColumn from "./KanbanColumn"
import WorkspaceSwitcher from "./WorkspaceSwitcher"
import { useState } from "react"
import { DragDropProvider, DragOverlay, type DragEndEvent } from "@dnd-kit/react"
import { isSortable } from "@dnd-kit/react/sortable"
import { X } from "lucide-react"

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

    const [dragError, setDragError] = useState<string | null>(null)

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
        } catch {
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
        } catch {
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
        } catch {
            setCardDeleteError(true)
        }
    }

    async function persistCards(updatedCards: Card[], previousCards: Card[]) {
        const previousById = new Map(previousCards.map((card) => [card.id, card]))
        const changedCards = updatedCards.filter((card) => {
            const previousCard = previousById.get(card.id)
            return previousCard && (
                previousCard.columnId !== card.columnId ||
                previousCard.position !== card.position
            )
        })

        try {
            const response = await fetch("/api/cards", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    updates: changedCards.map((card) => ({
                        id: card.id,
                        columnId: card.columnId,
                        position: card.position,
                    }))
                }),
            })

            if (!response.ok) {
                throw new Error("Unable to persist card order.")
            }
        } catch {
            setCards(previousCards)
            setDragError("Unable to save the new card position. Please try again.")
        }
    }

    async function persistColumns(updatedColumns: Column[], previousColumns: Column[]) {
        const previousById = new Map(previousColumns.map((column) => [column.id, column]))
        const changedColumns = updatedColumns.filter((column) =>
            previousById.get(column.id)?.position !== column.position
        )

        try {
            const response = await fetch("/api/columns", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    updates: changedColumns.map((column) => ({
                        id: column.id,
                        position: column.position,
                    }))
                }),
            })

            if (!response.ok) {
                throw new Error("Unable to persist column order.")
            }
        } catch {
            setColumns(previousColumns)
            setDragError("Unable to save the new column position. Please try again.")
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { source, target } = event.operation
        if (event.canceled || !source || !isSortable(source)) return

        setDragError(null)

        if (source.type === "column") {
            const columnId = String(source.id).replace(/^column:/, "")
            const currentIndex = columns.findIndex((column) => column.id === columnId)
            if (currentIndex === -1 || currentIndex === source.index) return

            const previousColumns = columns
            const reorderedColumns = [...columns]
            const [movedColumn] = reorderedColumns.splice(currentIndex, 1)
            reorderedColumns.splice(source.index, 0, movedColumn)

            const positionedColumns = reorderedColumns.map((column, index) => ({
                ...column,
                position: (index + 1) * 100,
            }))

            setColumns(positionedColumns)
            void persistColumns(positionedColumns, previousColumns)
            return
        }

        if (source.type !== "card" || !target) return

        const cardId = String(source.id).replace(/^card:/, "")
        const initialColumnId = source.initialGroup == null
            ? ""
            : String(source.initialGroup)

        if (!initialColumnId) return

        let targetColumnId = initialColumnId
        let targetIndex = source.initialIndex
        const targetId = String(target.id)

        if (isSortable(target) && target.type === "card" && target.group != null) {
            targetColumnId = String(target.group)
            targetIndex = target.index
        }

        if (targetId.startsWith("column-drop:")) {
            targetColumnId = targetId.replace(/^column-drop:/, "")
            targetIndex = cards.filter((card) =>
                card.columnId === targetColumnId && card.id !== cardId
            ).length
        }

        if (!columns.some((column) => column.id === targetColumnId)) return

        const groupedCards = new Map(columns.map((column) => [
            column.id,
            cards
                .filter((card) => card.columnId === column.id)
                .sort((first, second) => first.position - second.position),
        ]))

        const sourceCards = [...(groupedCards.get(initialColumnId) ?? [])]
        const movedCardIndex = sourceCards.findIndex((card) => card.id === cardId)
        if (movedCardIndex === -1) return

        const [movedCard] = sourceCards.splice(movedCardIndex, 1)

        if (initialColumnId === targetColumnId) {
            const insertAt = Math.max(0, Math.min(targetIndex, sourceCards.length))
            sourceCards.splice(insertAt, 0, movedCard)
            groupedCards.set(initialColumnId, sourceCards)
        } else {
            const targetCards = [...(groupedCards.get(targetColumnId) ?? [])]
            const insertAt = Math.max(0, Math.min(targetIndex, targetCards.length))
            targetCards.splice(insertAt, 0, { ...movedCard, columnId: targetColumnId })
            groupedCards.set(initialColumnId, sourceCards)
            groupedCards.set(targetColumnId, targetCards)
        }

        const previousCards = cards
        const positionedCards = columns.flatMap((column) =>
            (groupedCards.get(column.id) ?? []).map((card, index) => ({
                ...card,
                columnId: column.id,
                position: (index + 1) * 100,
            }))
        )

        const previousCard = previousCards.find((card) => card.id === cardId)
        const updatedCard = positionedCards.find((card) => card.id === cardId)
        if (
            previousCard?.columnId === updatedCard?.columnId &&
            previousCard?.position === updatedCard?.position
        ) return

        setCards(positionedCards)
        void persistCards(positionedCards, previousCards)
    }

    return (
        <DragDropProvider
            onDragOver={(event) => {
                if (event.operation.source?.type === "card") {
                    event.preventDefault()
                }
            }}
            onDragEnd={handleDragEnd}
        >
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
                    {columns.map((column, columnIndex) => {
                        const columnCards = cards
                            .filter((card) => card.columnId === column.id)
                            .sort((first, second) => first.position - second.position)

                        return (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                index={columnIndex}
                                cards={columnCards}
                                columns={columns}
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

                {dragError && (
                    <div className="relative mx-6 mb-4 rounded-lg border border-danger-border bg-danger-light px-9 py-2 text-center text-xs font-medium text-danger shadow-sm">
                        <button
                            type="button"
                            aria-label="Dismiss drag and drop error"
                            onClick={() => setDragError(null)}
                            className="absolute left-2 top-1.5 flex size-5 cursor-pointer items-center justify-center rounded transition-colors hover:bg-danger/10"
                        >
                            <X className="size-3.5" />
                        </button>
                        {dragError}
                    </div>
                )}

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

            <DragOverlay
                dropAnimation={{
                    duration: 220,
                    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                }}
            >
                {(source) => {
                    const data = source.data as { kind?: string; title?: string }

                    if (data.kind === "column") {
                        return (
                            <div className="w-72 rotate-1 rounded-xl border-2 border-primary bg-surface-muted p-4 font-semibold uppercase text-foreground shadow-2xl">
                                {data.title}
                            </div>
                        )
                    }

                    return (
                        <div className="w-64 rotate-1 rounded-xl border-2 border-primary bg-surface-elevated p-4 font-medium text-foreground shadow-2xl">
                            {data.title}
                        </div>
                    )
                }}
            </DragOverlay>
        </DragDropProvider>
    )
}

export default Kanban
