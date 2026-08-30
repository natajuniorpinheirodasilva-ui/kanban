'use client'

import { Card } from "@/generated/prisma/client"
import { useSortable } from "@dnd-kit/react/sortable"
import { AlignLeft, CalendarDays, GripVertical, Pencil, Trash2 } from "lucide-react"

type KanbanCardProps = {
  card: Card;
  index: number;
  isEditing: boolean;
  editingTitle: string;
  onStartEdit: (card: Card) => void;
  onEditChange: (title: string) => void;
  onSaveEdit: (cardId: string) => void;
  onCancelEdit: () => void;
  onOpenDetails: (card: Card) => void;
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
  onOpenDetails,
  onDeleteClick,
}: KanbanCardProps) {
  const labels = card.labels.split(",").filter(Boolean)
  const dueDate = card.dueDate ? new Date(card.dueDate) : null
  const isOverdue = dueDate ? dueDate.getTime() < new Date().setHours(0, 0, 0, 0) : false
  const priorityStyles: Record<string, string> = {
    LOW: "bg-sky-500",
    MEDIUM: "bg-amber-500",
    HIGH: "bg-danger",
  }
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
      className={`group flex items-start rounded-lg border px-2.5 py-2.5 text-foreground select-none transition-[transform,opacity,box-shadow,border-color,background-color] duration-200 ${isDragging
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
          className="mr-1.5 mt-0.5 shrink-0 touch-none cursor-grab rounded p-0.5 text-foreground-muted transition-colors hover:bg-primary-light hover:text-primary active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
      )}

      <div className="min-w-0 flex-1 py-0.5">
      {isEditing ? (
        <input
          type="text"
          className="w-full rounded border border-border bg-input px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
        <button
          type="button"
          className="block w-full cursor-pointer break-words text-left text-sm font-semibold leading-snug hover:text-primary"
          title="Open card details"
          onClick={() => onOpenDetails(card)}
        >
          {card.title}
        </button>
      )}

      {!isEditing && (card.priority !== "NONE" || labels.length > 0 || dueDate || card.description) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
          {card.priority !== "NONE" && (
            <span className="flex items-center gap-1 font-medium text-foreground-muted">
              <span className={`size-1.5 rounded-full ${priorityStyles[card.priority] ?? priorityStyles.LOW}`} />
              {card.priority.toLowerCase()}
            </span>
          )}
          {labels.slice(0, 2).map((label) => (
            <span key={label} className="max-w-20 truncate rounded bg-primary-light px-1.5 py-0.5 font-medium text-primary">
              {label}
            </span>
          ))}
          {labels.length > 2 && <span className="text-foreground-muted">+{labels.length - 2}</span>}
          {card.description && <AlignLeft className="size-3.5 text-foreground-muted" aria-label="Has description" />}
          {dueDate && (
            <span className={`flex items-center gap-1 ${isOverdue ? "text-danger" : "text-foreground-muted"}`}>
              <CalendarDays className="size-3.5" />
              {dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      )}
      </div>

      {!isEditing && (
        <div className="ml-1 flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            type="button"
            aria-label={`Rename card ${card.title}`}
            title="Rename card"
            className="cursor-pointer rounded p-1 text-foreground-muted transition hover:bg-primary-light hover:text-primary"
            onClick={() => onStartEdit(card)}
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label={`Delete card ${card.title}`}
            className="cursor-pointer rounded p-1 text-foreground-muted transition hover:bg-danger-light hover:text-danger"
            onClick={() => onDeleteClick(card.id)}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
