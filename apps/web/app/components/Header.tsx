import Link from 'next/link';

export default function Header() {
    return (
        <header className="w-full py-4 px-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-[#141413]">
                    <span className="text-2xl">⊙</span>
                    <span>leasury</span>
                </Link>

                {/* Navigation */}
                <Link
                    href="/games"
                    className="bg-[#141413] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#2a2a28] transition-colors"
                >
                    Browse Games
                </Link>
            </div>
        </header>
    );
}
