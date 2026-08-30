'use client'

import { Card } from "@/generated/prisma/client"
import { Plus, X } from "lucide-react"
import { useState, type FormEvent, type KeyboardEvent } from "react"

type Props = {
  card: Card;
  onClose: () => void;
  onSave: (card: Card) => void;
}

const priorities = [
  { value: "NONE", label: "No priority" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
]

export default function CardDetailsModal({ card, onClose, onSave }: Props) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const [priority, setPriority] = useState(card.priority)
  const [labels, setLabels] = useState(
    card.labels.split(",").map((label) => label.trim()).filter(Boolean)
  )
  const [labelInput, setLabelInput] = useState("")
  const [dueDate, setDueDate] = useState(
    card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 10) : ""
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function mergeLabels(pendingInput: string) {
    const mergedLabels = [...labels]
    const pendingLabels = pendingInput.split(",").map((label) => label.trim()).filter(Boolean)

    for (const label of pendingLabels) {
      if (!mergedLabels.some((currentLabel) => currentLabel.toLowerCase() === label.toLowerCase())) {
        mergedLabels.push(label)
      }
    }

    return mergedLabels
  }

  function addLabel() {
    if (!labelInput.trim()) return
    const mergedLabels = mergeLabels(labelInput)

    if (mergedLabels.length > 8 || mergedLabels.some((label) => label.length > 24)) {
      setError("Use up to 8 labels with 24 characters each.")
      return
    }

    setLabels(mergedLabels)
    setLabelInput("")
    setError(null)
  }

  function handleLabelKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      addLabel()
    }

    if (event.key === "Backspace" && !labelInput && labels.length > 0) {
      setLabels((currentLabels) => currentLabels.slice(0, -1))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      setError("Card title is required.")
      return
    }

    const labelsToSave = mergeLabels(labelInput)
    if (labelsToSave.length > 8 || labelsToSave.some((label) => label.length > 24)) {
      setError("Use up to 8 labels with 24 characters each.")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description,
          priority,
          labels: labelsToSave,
          dueDate: dueDate || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error ?? "Unable to save card details.")
      }

      onSave(await response.json())
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save card details.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/65 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-details-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose()
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-border border-t-2 border-t-primary bg-surface p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="card-details-title" className="text-lg font-semibold text-foreground">
              Card details
            </h2>
            <p className="mt-0.5 text-xs text-foreground-muted">Keep the task clear and easy to scan.</p>
          </div>
          <button
            type="button"
            aria-label="Close card details"
            disabled={isSaving}
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-foreground-muted transition hover:bg-surface-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1 text-xs font-semibold text-foreground-muted">
            TITLE
            <input
              value={title}
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-lg border border-border bg-input px-3 py-2 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold text-foreground-muted">
            DESCRIPTION
            <textarea
              value={description}
              maxLength={2000}
              rows={3}
              placeholder="Add a short description..."
              onChange={(event) => setDescription(event.target.value)}
              className="resize-none rounded-lg border border-border bg-input px-3 py-2 text-sm font-normal leading-relaxed text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <span className="self-end text-[10px] font-normal text-foreground-muted">{description.length}/2000</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-foreground-muted">
              PRIORITY
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="h-9 rounded-lg border border-border bg-input px-2.5 text-sm font-normal text-foreground outline-none transition focus:border-primary"
              >
                {priorities.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-foreground-muted">
              DUE DATE
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="h-9 min-w-0 rounded-lg border border-border bg-input px-2.5 text-sm font-normal text-foreground outline-none transition focus:border-primary"
              />
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground-muted">LABELS</span>
            <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-border bg-input px-2 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
              {labels.map((label) => (
                <span key={label} className="flex max-w-36 items-center gap-1 rounded-md border border-primary-border bg-primary-light px-2 py-1 text-xs font-medium text-primary">
                  <span className="truncate">{label}</span>
                  <button
                    type="button"
                    aria-label={`Remove label ${label}`}
                    onClick={() => setLabels((currentLabels) => currentLabels.filter((item) => item !== label))}
                    className="cursor-pointer rounded-sm hover:text-primary-hover"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              {labels.length < 8 && (
                <input
                  value={labelInput}
                  maxLength={24}
                  placeholder={labels.length ? "Add another..." : "Type a label..."}
                  onChange={(event) => setLabelInput(event.target.value)}
                  onKeyDown={handleLabelKeyDown}
                  onBlur={addLabel}
                  className="h-6 min-w-28 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-muted"
                />
              )}
              {labelInput && (
                <button type="button" aria-label="Add label" onMouseDown={(event) => event.preventDefault()} onClick={addLabel} className="cursor-pointer rounded p-1 text-primary hover:bg-primary-light">
                  <Plus className="size-3.5" />
                </button>
              )}
            </div>
            <span className="text-[10px] text-foreground-muted">Press Enter or comma to add a label · {labels.length}/8</span>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-danger-border bg-danger-light px-3 py-2 text-center text-xs text-danger">{error}</p>
        )}

        <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-medium text-foreground-muted transition hover:bg-surface-elevated hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="hover-lift cursor-pointer rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  )
}
