'use client'

import { Card } from "@/generated/prisma/client"
import { useSortable } from "@dnd-kit/react/sortable"
import { DeleteIcon, GripVertical } from "lucide-react"

type KanbanCardProps = {
  card: Card;
  index: number;
  isEditing: boolean;
  editingTitle: string;
  onStartEdit: (card: Card) => void;
  onEditChange: (title: string) => void;
  onSaveEdit: (cardId: string) => void;
  onCancelEdit: () => void;
  onDeleteClick: (cardId: string) => void;
}

export default function KanbanCard({
  card,
  index,
  isEditing,
  editingTitle,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onDeleteClick,
}: KanbanCardProps) {
  const {
    ref,
    handleRef,
    isDragging,
    isDropping,
    isDropTarget,
  } = useSortable({
    id: `card:${card.id}`,
    index,
    group: card.columnId,
    type: "card",
    accept: "card",
    disabled: isEditing,
    data: {
      kind: "card",
      cardId: card.id,
      title: card.title,
    },
    transition: {
      duration: 220,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      idle: true,
    },
  })

  return (
    <div
      ref={ref}
      className={`flex items-center justify-between rounded-xl border p-4 text-foreground select-none transition-[transform,opacity,box-shadow,border-color,background-color] duration-200 ${isDragging
        ? "scale-[0.98] opacity-35 shadow-none border-primary"
        : "scale-100 opacity-100 shadow-sm bg-surface-elevated border-border"
        } ${isDropTarget ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-surface-muted" : ""} ${isDropping ? "animate-drop-settle" : ""}`}
    >
      {!isEditing && (
        <button
          ref={handleRef}
          type="button"
          aria-label={`Move card ${card.title}`}
          title="Drag to move card"
          className="mr-2 shrink-0 touch-none cursor-grab rounded-md p-0.5 text-foreground-muted transition-colors hover:bg-primary-light hover:text-primary active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
      )}

      {isEditing ? (
        <input
          type="text"
          className="mr-2 w-full rounded border border-border bg-input px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          value={editingTitle}
          onChange={(event) => onEditChange(event.target.value)}
          onBlur={() => onSaveEdit(card.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSaveEdit(card.id)
            if (event.key === "Escape") onCancelEdit()
          }}
          autoFocus
        />
      ) : (
        <span
          className="mr-2 min-w-0 flex-1 cursor-pointer break-words hover:underline"
          title="Click to edit card title"
          onClick={() => onStartEdit(card)}
        >
          {card.title}
        </span>
      )}

      {!isEditing && (
        <button
          type="button"
          aria-label={`Delete card ${card.title}`}
          className="shrink-0 cursor-pointer rounded p-1 text-foreground-muted hover:bg-danger-light hover:text-danger"
          onClick={() => onDeleteClick(card.id)}
        >
          <DeleteIcon className="size-4" />
        </button>
      )}
    </div>
  )
}
