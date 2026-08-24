'use client'

import { Card, Column } from "@/generated/prisma/client"
import KanbanCard from "./KanbanCard"
import NewCardForm from "@/components/kanban/NewCardForm"

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
      className={`flex flex-col w-72 gap-3 p-4 rounded-xl shadow-sm shrink-0 border transition-colors duration-200 ${isDragOver ? "bg-primary-light border-primary-border" : "bg-gray-100 border-black/5"
        } min-h-25`}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => onDragOverColumn(column.id)}
      onDrop={() => onDropOnColumn(column.id)}
    >
      <h2
        className={`flex items-center justify-between text-base font-semibold uppercase tracking-wide border-b pb-1 cursor-grab active:cursor-grabbing transition-all duration-200 ${isColumnDragging ? "opacity-40 text-primary-hover" : "opacity-100 text-black/70"
          }`}
        draggable={!isEditingColumn}
        onDragStart={() => onColumnDragStart(column.id)}
        onDragEnd={onColumnDragEnd}
      >
        {isEditingColumn ? (
          <input
            type="text"
            className="bg-white border border-gray-300 rounded px-2 py-0.5 text-sm normal-case text-black focus:outline-none focus:ring-1 focus:ring-black w-full mr-2"
            value={editingColumnTitle}
            onChange={(e) => onEditColumnTitleChange(e.target.value)}
            onBlur={() => onSaveColumnTitle(column.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveColumnTitle(column.id)
              if (e.key === "Escape") onCancelEditColumn()
            }}
            autoFocus
          />
        ) : (
          <span
            className="cursor-pointer hover:underline break-words mr-2 flex-1 min-w-0"
            title="Click to edit column title"
            onClick={() => onStartEditColumn(column)}
          >
            {column.title}
          </span>
        )}

        <button
          className="text-sm normal-case tracking-normal font-bold cursor-pointer hover:bg-black/5 hover:rounded shrink-0"
          onClick={() => onDeleteColumnClick(column.id)}
        >
          Delete Column
        </button>
      </h2>

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
          className="mt-2 w-full text-left text-sm text-gray-500 hover:text-black hover:bg-black/5 p-2 rounded-lg transition cursor-pointer"
          onClick={() => onActivateNewCardForm(column.id)}
        >
          + Add Card
        </button>
      )}
    </div>
  )
}
