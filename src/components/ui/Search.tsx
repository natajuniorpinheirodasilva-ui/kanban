'use client'

import { SearchIcon } from "lucide-react"
import { useEffect, useRef } from "react"

type Props = {
    type: string;
    value: string;
    placeholder: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    isOpen: boolean;
}

export default function Search({ type, value, placeholder, onChange, isOpen }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) inputRef.current?.focus()
    }, [isOpen])

    return (
        <div className="relative flex w-full">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
                ref={inputRef}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                tabIndex={isOpen ? 0 : -1}
                className="h-9 w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
        </div>
    )
}
