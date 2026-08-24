'use client'

import { Card } from "@/generated/prisma/client"

type KanbanCardProps = {
  card: Card;
  isDragging: boolean;
  isEditing: boolean;
  editingTitle: string;
  onDragStart: (cardId: string) => void;
  onDragEnd: () => void;
  onStartEdit: (card: Card) => void;
  onEditChange: (title: string) => void;
  onSaveEdit: (cardId: string) => void;
  onCancelEdit: () => void;
  onDeleteClick: (cardId: string) => void;
}

export default function KanbanCard({
  card,
  isDragging,
  isEditing,
  editingTitle,
  onDragStart,
  onDragEnd,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onDeleteClick,
}: KanbanCardProps) {
  return (
    <div
      draggable={!isEditing}
      onDragStart={() => onDragStart(card.id)}
      onDragEnd={onDragEnd}
      className={`flex items-center justify-between border rounded-xl p-4 text-black cursor-grab select-none active:cursor-grabbing transition-all duration-200 ${isDragging
          ? "opacity-60 scale-105 shadow-md bg-primary-light border-primary-border"
          : "opacity-100 scale-100 shadow-sm bg-white border-black/10"
        }`}
    >
      {isEditing ? (
        <input
          type="text"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black w-full mr-2"
          value={editingTitle}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={() => onSaveEdit(card.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSaveEdit(card.id)
            if (e.key === "Escape") onCancelEdit()
          }}
          autoFocus
        />
      ) : (
        <span
          className="cursor-pointer hover:underline break-words mr-2 flex-1 min-w-0"
          title="Click to edit card title"
          onClick={() => onStartEdit(card)}
        >
          {card.title}
        </span>
      )}

      <button
        className="text-sm normal-case tracking-normal font-bold cursor-pointer hover:bg-black/5 hover:rounded p-1 shrink-0"
        onClick={() => onDeleteClick(card.id)}
      >
        Delete
      </button>
    </div>
  )
}
