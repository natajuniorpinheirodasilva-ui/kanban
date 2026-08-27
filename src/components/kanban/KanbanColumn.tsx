'use client'

import { Card, Column } from "@/generated/prisma/client"
import KanbanCard from "./KanbanCard"
import NewCardForm from "@/components/kanban/NewCardForm"
import { Edit, X } from "lucide-react"

type KanbanColumnProps = {
  column: Column;
  cards: Card[];
  columns: Column[];
  isDragOver: boolean;
  isColumnDragging: boolean;
  draggedCardId: string | null;

  onDragOverColumn: (columnId: string) => void;
  onDropOnColumn: (columnId: string) => void;
  onColumnDragStart: (columnId: string) => void;
  onColumnDragEnd: () => void;

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
  onCardDragStart: (cardId: string) => void;
  onCardDragEnd: () => void;
  onStartEditCard: (card: Card) => void;
  onEditCardTitleChange: (title: string) => void;
  onSaveCardTitle: (cardId: string) => void;
  onCancelEditCard: () => void;
  onDeleteCardClick: (cardId: string) => void;

  activeColumnForCard: string | null;
  onActivateNewCardForm: (columnId: string) => void;
  onCancelNewCardForm: () => void;
  onCardCreate: (card: Card) => void;
}

export default function KanbanColumn({
  column,
  cards,
  columns,
  isDragOver,
  isColumnDragging,
  draggedCardId,
  onDragOverColumn,
  onDropOnColumn,
  onColumnDragStart,
  onColumnDragEnd,
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
  onCardDragStart,
  onCardDragEnd,
  onStartEditCard,
  onEditCardTitleChange,
  onSaveCardTitle,
  onCancelEditCard,
  onDeleteCardClick,
  activeColumnForCard,
  onActivateNewCardForm,
  onCancelNewCardForm,
  onCardCreate,
}: KanbanColumnProps) {
  const isEditingColumn = editingColumnId === column.id
  const isAddingCard = activeColumnForCard === column.id

  return (
    <div
      className={`flex flex-col w-72 gap-3 p-4 rounded-xl shadow-sm shrink-0 border transition-colors duration-200 ${isDragOver ? "bg-primary-light border-primary-border" : "bg-surface-muted border-border"
        } min-h-25`}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => onDragOverColumn(column.id)}
      onDrop={() => onDropOnColumn(column.id)}
    >
      <div
        className={`flex items-center justify-between text-base font-semibold uppercase tracking-wide border-b border-border pb-1 cursor-grab active:cursor-grabbing transition-all duration-200 ${isColumnDragging ? "opacity-40 text-primary-hover" : "opacity-100 text-foreground"
          }`}
        draggable={!isEditingColumn}
        onDragStart={() => onColumnDragStart(column.id)}
        onDragEnd={onColumnDragEnd}
      >
        {isEditingColumn ? (
          <div className="mr-2 flex min-w-0 flex-1 flex-col gap-1 normal-case">
            <input
              type="text"
              disabled={isSavingColumn}
              className={`w-full rounded border bg-input px-2 py-0.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 ${columnEditError ? 'border-danger' : 'border-border'}`}
              value={editingColumnTitle}
              onChange={(e) => onEditColumnTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveColumnTitle(column.id)
                if (e.key === "Escape") onCancelEditColumn()
              }}
              autoFocus
            />
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                disabled={isSavingColumn}
                onClick={() => onSaveColumnTitle(column.id)}
                className="text-primary hover:text-primary-hover disabled:opacity-50 cursor-pointer"
              >
                {isSavingColumn ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                disabled={isSavingColumn}
                onClick={onCancelEditColumn}
                className="text-foreground-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
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
            <span className="min-w-0 break-words">
              {column.title}
            </span>
            <button
              type="button"
              draggable={false}
              aria-label="Rename column"
              title="Rename column"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={() => onStartEditColumn(column)}
              className="ml-1 shrink-0 text-primary hover:text-primary-hover cursor-pointer"
            >
              <Edit className="size-4" />
            </button>
          </div>
        )}

        {!isEditingColumn && (
          <button
            className=""
            onClick={() => onDeleteColumnClick(column.id)}
          >
            <X className="size-4 text-sm normal-case tracking-normal font-bold text-foreground-muted cursor-pointer hover:text-danger hover:rounded shrink-0" />
          </button>
        )}
      </div>

      {cards.map((card) => (
        <KanbanCard
          key={card.id}
          card={card}
          isDragging={draggedCardId === card.id}
          isEditing={editingCardId === card.id}
          editingTitle={editingCardTitle}
          onDragStart={onCardDragStart}
          onDragEnd={onCardDragEnd}
          onStartEdit={onStartEditCard}
          onEditChange={onEditCardTitleChange}
          onSaveEdit={onSaveCardTitle}
          onCancelEdit={onCancelEditCard}
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
          className="hover-lift border border-border mt-2 w-full text-left text-sm text-foreground-muted hover:text-foreground hover:bg-surface-elevated p-2 rounded-lg transition cursor-pointer"
          onClick={() => onActivateNewCardForm(column.id)}
        >
          Add Card
        </button>
      )}
    </div>
  )
}
