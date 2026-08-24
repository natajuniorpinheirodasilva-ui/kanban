import Image from 'next/image'
import icon from "@/app/icon.svg"
import UserMenu from '@/components/ui/UserMenu'

type Props = {
    userName: string;
}

function NavBar({ userName }: Props) {
    return (
        <header className="relative z-50 px-1 pt-2">
            <nav className="mx-5 flex items-center justify-between p-2 bg-translucid rounded-lg shadow backdrop-blur-2xl bg-primary bg-translucid">
                <Image src={icon} alt="Kanban logo" width={42} height={42} />
                <UserMenu userName={userName} />
            </nav>
        </header>
    )
}
export default NavBar
