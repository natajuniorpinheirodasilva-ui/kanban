'use client'

import { useEffect } from 'react'

function ThemeInitializer() {
    useEffect(() => {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')

        function applyTheme() {
            const savedTheme = localStorage.getItem('theme')
            const shouldUseDark = savedTheme
                ? savedTheme === 'dark'
                : systemTheme.matches

            document.documentElement.classList.toggle('dark', shouldUseDark)
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

    return null
}

export default ThemeInitializer
