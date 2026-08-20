'use client'

import Image from 'next/image'
import icon from "@/app/icon.svg"
import { LogOutIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

function NavBar() { 

    const router = useRouter()

    async function handleLogout() {
        const response = await fetch(
            "/api/auth/logout",
            {
                method: "POST",
            })
            if(!response.ok) return
            router.replace("/signup")
    }

    return (
    <header className="px-1 pt-2">
        <nav className="bg-red-500/60 mx-auto flex items-center justify-between p-2 bg-translucid rounded shadow backdrop-blur-2xl">
            <Image src={icon} alt="Kanban logo" width={42} height={42}/>
            <button
            onClick={handleLogout}
            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded border border-primary-border bg-primary-light px-4 py-2 text-primary shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/30 active:translate-y-0 cursor-pointer"
            >
                <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                <LogOutIcon className="relative size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:rotate-6" />
                <span className="relative">Logout</span>
            </button>
        </nav>
    </header>
  )
}
export default NavBar
