'use client'

import { Card, Column } from "@/generated/prisma/client"
import KanbanCard from "./KanbanCard"
import NewCardForm from "@/components/kanban/NewCardForm"
import { useDroppable } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"
import { Edit, GripVertical, X } from "lucide-react"

type KanbanColumnProps = {
  column: Column;
  index: number;
  cards: Card[];
  columns: Column[];

  editingColumnId: string | null;
  editingColumnTitle: string;
  isSavingColumn: boolean;
  columnEditError: boolean;
  onStartEditColumn: (column: Column) => void;
  onEditColumnTitleChange: (title: string) => void;
  onSaveColumnTitle: (columnId: string) => void;
  onCancelEditColumn: () => void;
  onDeleteColumnClick: (columnId: string) => void;

  editingCardId: string | null;
  editingCardTitle: string;
  onStartEditCard: (card: Card) => void;
  onEditCardTitleChange: (title: string) => void;
  onSaveCardTitle: (cardId: string) => void;
  onCancelEditCard: () => void;
  onOpenCardDetails: (card: Card) => void;
  onDeleteCardClick: (cardId: string) => void;

  activeColumnForCard: string | null;
  onActivateNewCardForm: (columnId: string) => void;
  onCancelNewCardForm: () => void;
  onCardCreate: (card: Card) => void;
}

export default function KanbanColumn({
  column,
  index,
  cards,
  columns,
  editingColumnId,
  editingColumnTitle,
  isSavingColumn,
  columnEditError,
  onStartEditColumn,
  onEditColumnTitleChange,
  onSaveColumnTitle,
  onCancelEditColumn,
  onDeleteColumnClick,
  editingCardId,
  editingCardTitle,
  onStartEditCard,
  onEditCardTitleChange,
  onSaveCardTitle,
  onCancelEditCard,
  onOpenCardDetails,
  onDeleteCardClick,
  activeColumnForCard,
  onActivateNewCardForm,
  onCancelNewCardForm,
  onCardCreate,
}: KanbanColumnProps) {
  const isEditingColumn = editingColumnId === column.id
  const isAddingCard = activeColumnForCard === column.id

  const {
    ref: sortableRef,
    handleRef,
    isDragging,
    isDropping,
    isDropTarget: isColumnDropTarget,
  } = useSortable({
    id: `column:${column.id}`,
    index,
    type: "column",
    accept: "column",
    disabled: {
      draggable: isEditingColumn,
    },
    data: {
      kind: "column",
      columnId: column.id,
      title: column.title,
    },
    transition: {
      duration: 240,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      idle: true,
    },
  })

  const {
    ref: cardDropRef,
    isDropTarget: isCardDropTarget,
  } = useDroppable({
    id: `column-drop:${column.id}`,
    type: "card-column",
    accept: "card",
    collisionPriority: 1,
    data: {
      kind: "column-drop",
      columnId: column.id,
    },
  })

  return (
    <div
      ref={sortableRef}
      className={`flex min-h-24 w-72 shrink-0 flex-col gap-2.5 rounded-xl border p-3 shadow-sm transition-[transform,opacity,box-shadow,border-color,background-color] duration-200 ${isDragging
        ? "scale-[0.98] border-primary bg-primary-light opacity-35 shadow-none"
        : "scale-100 border-border bg-surface-muted opacity-100"
        } ${isColumnDropTarget ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-surface" : ""} ${isDropping ? "animate-drop-settle" : ""}`}
    >
      <div className="flex items-start justify-between border-b border-border pb-2 text-sm font-semibold uppercase tracking-wide text-foreground">
        {isEditingColumn ? (
          <div className="mr-2 flex min-w-0 flex-1 flex-col gap-1 normal-case">
            <input
              type="text"
              disabled={isSavingColumn}
              className={`w-full rounded border bg-input px-2 py-0.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 ${columnEditError ? "border-danger" : "border-border"}`}
              value={editingColumnTitle}
              onChange={(event) => onEditColumnTitleChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onSaveColumnTitle(column.id)
                if (event.key === "Escape") onCancelEditColumn()
              }}
              autoFocus
            />
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                disabled={isSavingColumn}
                onClick={() => onSaveColumnTitle(column.id)}
                className="cursor-pointer text-primary hover:text-primary-hover disabled:opacity-50"
              >
                {isSavingColumn ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                disabled={isSavingColumn}
                onClick={onCancelEditColumn}
                className="cursor-pointer text-foreground-muted hover:text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            {columnEditError && (
              <p className="text-xs font-normal text-danger">Unable to rename column.</p>
            )}
          </div>
        ) : (
          <div className="mr-2 flex min-w-0 flex-1 items-center">
            <button
              ref={handleRef}
              type="button"
              aria-label={`Move column ${column.title}`}
              title="Drag to reorder column"
              className="mr-1 shrink-0 touch-none cursor-grab rounded-md p-0.5 text-foreground-muted transition-colors hover:bg-primary-light hover:text-primary active:cursor-grabbing"
            >
              <GripVertical className="size-3.5" />
            </button>
            <span className="min-w-0 break-words">{column.title}</span>
            <button
              type="button"
              aria-label="Rename column"
              title="Rename column"
              onClick={() => onStartEditColumn(column)}
              className="ml-1 shrink-0 cursor-pointer text-primary hover:text-primary-hover"
            >
              <Edit className="size-3.5" />
            </button>
          </div>
        )}

        {!isEditingColumn && (
          <button
            type="button"
            aria-label={`Delete column ${column.title}`}
            className="shrink-0 cursor-pointer rounded p-1 text-foreground-muted hover:bg-danger-light hover:text-danger"
            onClick={() => onDeleteColumnClick(column.id)}
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div
        ref={cardDropRef}
        className={`flex min-h-14 flex-col gap-2 rounded-lg transition-[background-color,box-shadow] duration-200 ${isCardDropTarget
          ? "bg-primary/8 shadow-[inset_0_0_0_2px_var(--primary-border)]"
          : ""
          }`}
      >
        {cards.map((card, cardIndex) => (
          <KanbanCard
            key={card.id}
            card={card}
            index={cardIndex}
            isEditing={editingCardId === card.id}
            editingTitle={editingCardTitle}
            onStartEdit={onStartEditCard}
            onEditChange={onEditCardTitleChange}
            onSaveEdit={onSaveCardTitle}
            onCancelEdit={onCancelEditCard}
            onOpenDetails={onOpenCardDetails}
            onDeleteClick={onDeleteCardClick}
          />
        ))}

        {isAddingCard ? (
          <NewCardForm
            columns={columns}
            initialColumnId={column.id}
            onCreate={onCardCreate}
            onCancel={onCancelNewCardForm}
          />
        ) : (
          <button
            type="button"
            className="hover-lift mt-1 w-full cursor-pointer rounded-lg border border-border px-2.5 py-2 text-left text-xs font-medium text-foreground-muted transition hover:bg-surface-elevated hover:text-foreground"
            onClick={() => onActivateNewCardForm(column.id)}
          >
            Add Card
          </button>
        )}
      </div>
    </div>
  )
}
