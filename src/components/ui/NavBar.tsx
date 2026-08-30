import Image from 'next/image'
import icon from "@/app/icon.svg"
import UserMenu from '@/components/ui/UserMenu'

type Props = {
    userName: string;
}

function NavBar({ userName }: Props) {
    return (
        <header className="relative z-50 px-1 pt-2">
            <nav className="mx-5 flex items-center justify-between rounded-xl border border-primary/30 bg-navbar px-3 py-2 shadow-lg backdrop-blur-2xl">
                <Image src={icon} alt="Kanban logo" width={34} height={34} />
                <UserMenu userName={userName} />
            </nav>
        </header>
    )
}
export default NavBar
