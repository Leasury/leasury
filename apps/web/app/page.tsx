import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="text-center">
                {/* Logo */}
                <div className="mb-8">
                    <h1 className="text-6xl font-bold text-white mb-2">
                        🎲 Leasury
                    </h1>
                    <p className="text-purple-200 text-lg">
                        Local Multiplayer Party Games
                    </p>
                </div>

                {/* Tagline */}
                <p className="text-white/60 max-w-md mx-auto mb-12">
                    Jackbox-style digital board games. One screen for everyone,
                    phones as controllers. No app downloads required.
                </p>

                {/* Demo Button */}
                <Link
                    href="/demo"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white text-xl font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                >
                    <span>🎮</span>
                    <span>Play Demo</span>
                </Link>

                {/* Subtitle */}
                <p className="text-white/40 text-sm mt-6">
                    Test the real-time sync between browser tabs
                </p>
            </div>
        </div>
    );
}
