'use client'

import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

type Workspace = {
    id: string;
    title: string;
}

type Props = {
    workspaces: Workspace[];
    activeWorkspaceId: string;
}

type DeleteError = 'lastWorkspace' | 'unexpected' | null

export default function WorkspaceSwitcher({ workspaces, activeWorkspaceId }: Props) {
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)
    const [title, setTitle] = useState('')
    const [hasError, setHasError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [workspaceDeleteAlert, setWorkspaceDeleteAlert] = useState(false)
    const [deleteError, setDeleteError] = useState<DeleteError>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState('')
    const [isEditingWorkspace, setIsEditingWorkspace] = useState(false)
    const [editError, setEditError] = useState(false)

    const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId)

    function startEditing() {
        setEditTitle(activeWorkspace?.title ?? '')
        setEditError(false)
        setIsEditing(true)
    }

    function cancelEditing() {
        setIsEditing(false)
        setEditTitle('')
        setEditError(false)
    }

    async function handleEdit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const trimmedTitle = editTitle.trim()

        if (!trimmedTitle) {
            setEditError(true)
            return
        }

        setEditError(false)
        setIsEditingWorkspace(true)

        try {
            const response = await fetch(`/api/boards/${activeWorkspaceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: trimmedTitle }),
            })

            if (!response.ok) {
                setEditError(true)
                return
            }

            cancelEditing()
            router.refresh()
        } catch {
            setEditError(true)
        } finally {
            setIsEditingWorkspace(false)
        }
    }

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const trimmedTitle = title.trim()

        if (!trimmedTitle) {
            setHasError(true)
            return
        }

        setHasError(false)
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/boards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: trimmedTitle }),
            })

            if (!response.ok) {
                setHasError(true)
                return
            }

            const workspace = await response.json()
            router.push(`/board/${workspace.id}`)
        } catch {
            setHasError(true)
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleWorkspaceDelete() {
        setDeleteError(null)
        setWorkspaceDeleteAlert(false)
        setIsDeleting(true)

        try {
            const response = await fetch(`/api/boards/${activeWorkspaceId}`, { method: 'DELETE' })

            if (!response.ok) {
                const data = await response.json().catch(() => null)
                setDeleteError(
                    response.status === 409 || data?.error === 'Cannot delete the last workspace.'
                        ? 'lastWorkspace'
                        : 'unexpected'
                )
                return
            }

            const data = await response.json()
            router.replace(`/board/${data.nextWorkspaceId}`)
        } catch {
            setDeleteError('unexpected')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-muted">
                    Workspace
                </span>

                {isCreating ? (
                    <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-1.5">
                        <input
                            autoFocus
                            value={title}
                            maxLength={80}
                            placeholder="Workspace name"
                            onChange={(event) => setTitle(event.target.value)}
                            className={`h-9 w-48 rounded-lg border bg-input px-2.5 text-sm text-foreground outline-none focus:border-primary ${hasError ? 'border-danger' : 'border-border'}`}
                        />
                        <button type="submit" disabled={isSubmitting} aria-label="Create workspace" className="flex size-9 cursor-pointer items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary-hover disabled:opacity-50">
                            {isSubmitting ? <span className="text-[10px]">...</span> : <Check className="size-4" />}
                        </button>
                        <button type="button" disabled={isSubmitting} aria-label="Cancel workspace creation" onClick={() => { setIsCreating(false); setTitle(''); setHasError(false) }} className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-foreground-muted transition hover:bg-surface-muted hover:text-foreground disabled:opacity-50">
                            <X className="size-4" />
                        </button>
                    </form>
                ) : isEditing ? (
                    <form onSubmit={handleEdit} className="flex flex-wrap items-center gap-1.5">
                        <input
                            autoFocus
                            value={editTitle}
                            maxLength={80}
                            onChange={(event) => setEditTitle(event.target.value)}
                            className={`h-9 w-52 rounded-lg border bg-input px-2.5 text-sm font-medium text-foreground outline-none focus:border-primary ${editError ? 'border-danger' : 'border-border'}`}
                        />
                        <button type="submit" disabled={isEditingWorkspace} aria-label="Save workspace name" className="flex size-9 cursor-pointer items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary-hover disabled:opacity-50">
                            {isEditingWorkspace ? <span className="text-[10px]">...</span> : <Check className="size-4" />}
                        </button>
                        <button type="button" disabled={isEditingWorkspace} aria-label="Cancel workspace rename" onClick={cancelEditing} className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-foreground-muted transition hover:bg-surface-muted hover:text-foreground disabled:opacity-50">
                            <X className="size-4" />
                        </button>
                    </form>
                ) : (
                    <>
                        <select
                            id="workspace-select"
                            aria-label="Active workspace"
                            value={activeWorkspaceId}
                            onChange={(event) => {
                                if (event.target.value !== activeWorkspaceId) router.push(`/board/${event.target.value}`)
                            }}
                            className="h-9 w-52 max-w-[55vw] cursor-pointer truncate rounded-lg border border-border bg-input px-2.5 text-sm font-semibold text-foreground outline-none focus:border-primary"
                        >
                            {workspaces.map((workspace) => (
                                <option key={workspace.id} value={workspace.id}>{workspace.title}</option>
                            ))}
                        </select>
                        <button type="button" onClick={startEditing} aria-label="Rename workspace" title="Rename workspace" className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-foreground-muted transition hover:border-primary-border hover:bg-primary-light hover:text-primary">
                            <Pencil className="size-3.5" />
                        </button>
                        <span className="mx-1 hidden h-6 w-px bg-border sm:block" />
                        <button type="button" onClick={() => setIsCreating(true)} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-primary-border bg-primary-light px-2.5 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary hover:text-white">
                            <Plus className="size-3.5" />
                            New
                        </button>
                        <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => { setDeleteError(null); setWorkspaceDeleteAlert(true) }}
                            aria-label="Delete workspace"
                            title="Delete workspace"
                            className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-foreground-muted transition hover:border-danger-border hover:bg-danger-light hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Trash2 className="size-3.5" />
                        </button>
                    </>
                )}
            </div>

            {(hasError && isCreating) || (editError && isEditing) ? (
                <p className="mt-1.5 text-xs text-danger">
                    {isCreating ? 'Enter a valid workspace name.' : 'Unable to rename this workspace.'}
                </p>
            ) : null}

            {deleteError && (
                <div className="relative mt-2 max-w-md rounded-lg border border-danger-border bg-danger-light px-8 py-2 text-center text-xs font-medium text-danger">
                    <button type="button" aria-label="Dismiss error" onClick={() => setDeleteError(null)} className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 hover:bg-danger/10">
                        <X className="size-3.5" />
                    </button>
                    {deleteError === 'lastWorkspace' ? 'You cannot delete your only workspace.' : 'Something went wrong. Please try again.'}
                </div>
            )}

            {workspaceDeleteAlert && (
                <ConfirmDialog
                    message="Delete this workspace?"
                    onConfirm={handleWorkspaceDelete}
                    onCancel={() => { setWorkspaceDeleteAlert(false); setDeleteError(null) }}
                />
            )}
        </div>
    )
}
