'use client'

import { LogOutIcon, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type Props = {
    userName: string;
}

function UserMenu({ userName }: Props) {
    const router = useRouter()
    const menuRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [])

    async function handleLogout() {
        setIsLoggingOut(true)

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
            })

            if (!response.ok) {
                setIsLoggingOut(false)
                return
            }

            router.replace('/signup')
        } catch {
            setIsLoggingOut(false)
        }
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                aria-label="Open user menu"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((open) => !open)}
                className="hover-lift flex size-10 items-center justify-center rounded-full bg-black text-white shadow-sm cursor-pointer"
            >
                <User className="size-5" />
            </button>

            {isOpen && (
                <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-black/10 bg-surface p-2 shadow-xl"
                >
                    <div className="border-b border-black/10 px-3 py-2">
                        <p className="text-xs text-gray-500">Hello,</p>
                        <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                    </div>

                    <button
                        type="button"
                        role="menuitem"
                        disabled={isLoggingOut}
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-danger transition-colors hover:bg-danger-light disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                        <LogOutIcon className="size-4" />
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            )}
        </div>
    )
}

export default UserMenu
