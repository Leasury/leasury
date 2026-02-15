import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
    return (
        <header className="w-full py-4 px-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="Leasury"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                    />
                    <span className="text-xl font-bold text-[#141413]">
                        leasury
                    </span>
                </Link>

                {/* Navigation */}
                <Link
                    href="/games"
                    className="bg-[#141413] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#2a2a28] transition-colors text-sm"
                >
                    Browse Games
                </Link>
            </div>
        </header>
    );
}
