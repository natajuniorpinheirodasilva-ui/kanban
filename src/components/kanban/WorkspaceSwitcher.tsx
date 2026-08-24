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

function WorkspaceSwitcher({ workspaces, activeWorkspaceId }: Props) {
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)
    const [title, setTitle] = useState('')
    const [hasError, setHasError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

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
                        className={`rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-primary ${hasError ? 'border-danger' : 'border-black/15'}`}
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
                    className="hover-lift rounded-lg border border-black/10 px-3 py-2 text-sm text-gray-600 hover:bg-black/5 disabled:opacity-50 cursor-pointer"
                >
                    Cancel
                </button>
            </form>
        )
    }

    return (
        <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Workspace</span>
                <select
                    value={activeWorkspaceId}
                    onChange={(event) => handleWorkspaceChange(event.target.value)}
                    className="min-w-44 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
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
                + New workspace
            </button>
        </div>
    )
}

export default WorkspaceSwitcher
