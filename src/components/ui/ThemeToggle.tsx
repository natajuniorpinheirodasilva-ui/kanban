'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

function ThemeToggle() {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')

        function applyTheme() {
            const savedTheme = localStorage.getItem('theme')
            const shouldUseDark = savedTheme
                ? savedTheme === 'dark'
                : systemTheme.matches

            document.documentElement.classList.toggle('dark', shouldUseDark)
            setIsDark(shouldUseDark)
        }

        function handleSystemThemeChange() {
            if (!localStorage.getItem('theme')) {
                applyTheme()
            }
        }

        applyTheme()
        systemTheme.addEventListener('change', handleSystemThemeChange)

        return () => {
            systemTheme.removeEventListener('change', handleSystemThemeChange)
        }
    }, [])

    function handleToggle() {
        const nextThemeIsDark = !isDark

        setIsDark(nextThemeIsDark)
        document.documentElement.classList.toggle('dark', nextThemeIsDark)
        localStorage.setItem('theme', nextThemeIsDark ? 'dark' : 'light')
    }

    return (
        <button
            type="button"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-pressed={isDark}
            title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
            onClick={handleToggle}
            className={`relative h-6 w-11 rounded-full border shadow-inner transition-colors duration-300 cursor-pointer ${isDark
                ? 'border-primary/70 bg-black'
                : 'border-gray-300 bg-gray-100'
                }`}
        >
            <span
                className={`absolute left-0.5 top-0.5 flex size-5 items-center justify-center rounded-full shadow-sm transition-all duration-300 ${isDark
                    ? 'translate-x-5 bg-zinc-900 text-white'
                    : 'translate-x-0 bg-white text-black'
                    }`}
            >
                {isDark
                    ? <Moon className="size-3" />
                    : <Sun className="size-3" />}
            </span>
        </button>
    )
}

export default ThemeToggle
