'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { FormEvent } from 'react'

type Workspace = {
    id: string;
    title: string;
}

type Props = {
    workspaces: Workspace[];
    activeWorkspaceId: string;
}

type DeleteError = 'lastWorkspace' | 'unexpected' | null

function WorkspaceSwitcher({ workspaces, activeWorkspaceId }: Props) {
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)
    const [title, setTitle] = useState('')
    const [hasError, setHasError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<DeleteError>(null)

    async function handleWorkspaceDelete() {
        setDeleteError(null)
        setIsDeleting(true)

        try {
            const response = await fetch(
                `/api/boards/${activeWorkspaceId}`,
                {
                    method: "DELETE"
                }
            )
            if (!response.ok) {
                const data = await response.json().catch(() => null)

                if (response.status === 409 || data?.error === 'Cannot delete the last workspace.') {
                    setDeleteError('lastWorkspace')
                } else {
                    setDeleteError('unexpected')
                }

                setIsDeleting(false)
                return
            }

            const data = await response.json()
            router.replace(`/board/${data.nextWorkspaceId}`)
        } catch {
            setDeleteError('unexpected')
            setIsDeleting(false)
        }
    }

    function handleWorkspaceChange(workspaceId: string) {
        if (workspaceId !== activeWorkspaceId) {
            router.push(`/board/${workspaceId}`)
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: trimmedTitle })
            })

            if (!response.ok) {
                setHasError(true)
                setIsSubmitting(false)
                return
            }

            const workspace = await response.json()
            router.push(`/board/${workspace.id}`)
        } catch {
            setHasError(true)
            setIsSubmitting(false)
        }
    }

    if (isCreating) {
        return (
            <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-2">
                <div>
                    <input
                        autoFocus
                        type="text"
                        value={title}
                        placeholder="Workspace name"
                        onChange={(event) => setTitle(event.target.value)}
                        className={`rounded-lg border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary ${hasError ? 'border-danger' : 'border-border'}`}
                    />
                    {hasError && (
                        <p className="mt-1 text-xs text-danger">Please enter a valid name.</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="hover-lift rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                    {isSubmitting ? 'Creating...' : 'Create'}
                </button>

                <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                        setIsCreating(false)
                        setTitle('')
                        setHasError(false)
                    }}
                    className="hover-lift rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground-muted hover:bg-surface-elevated hover:text-foreground disabled:opacity-50 cursor-pointer"
                >
                    Cancel
                </button>
            </form>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Workspace</span>
                    <select
                        value={activeWorkspaceId}
                        onChange={(event) => handleWorkspaceChange(event.target.value)}
                        className="min-w-44 rounded-lg border border-border bg-input px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
                    >
                        {workspaces.map((workspace) => (
                            <option key={workspace.id} value={workspace.id}>
                                {workspace.title}
                            </option>
                        ))}
                    </select>
                </label>

                <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                    className="hover-lift rounded-lg border border-primary-border bg-primary-light px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white cursor-pointer"
                >
                    New workspace
                </button>
                <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleWorkspaceDelete}
                    className="hover-lift rounded-lg border border-primary-border bg-primary-light px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                    {isDeleting ? 'Deleting...' : 'Remove this workspace'}
                </button>
            </div>

            {deleteError && (
                <div className="relative rounded-lg border border-danger-border bg-danger-light px-9 py-2 text-center text-xs font-medium text-danger shadow-sm">
                    <button
                        type="button"
                        aria-label="Dismiss error"
                        onClick={() => setDeleteError(null)}
                        className="absolute left-2 top-1.5 flex size-5 items-center justify-center rounded text-base leading-none text-danger transition-colors hover:bg-danger/10 cursor-pointer"
                    >
                        ×
                    </button>

                    <p>
                        {deleteError === 'lastWorkspace'
                            ? 'You cannot delete your only workspace.'
                            : 'Something went wrong. Please try again.'}
                    </p>
                </div>
            )}
        </div>
    )
}

export default WorkspaceSwitcher
