'use client'

import { Card } from "@/generated/prisma/client"
import { DeleteIcon } from "lucide-react";

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
      className={`flex items-center justify-between border rounded-xl p-4 text-foreground cursor-grab select-none active:cursor-grabbing transition-all duration-200 ${isDragging
        ? "opacity-60 scale-105 shadow-md bg-primary-light border-primary-border"
        : "opacity-100 scale-100 shadow-sm bg-surface-elevated border-border"
        }`}
    >
      {isEditing ? (
        <input
          type="text"
          className="bg-input border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full mr-2"
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

      {!isEditing && (
        <button
          onClick={() => onDeleteClick(card.id)}
        >
          <DeleteIcon className="size-4 text-sm normal-case tracking-normal font-bold text-foreground-muted cursor-pointer hover:text-danger hover:rounded shrink-0" />
        </button>
      )}
    </div>
  )
}
