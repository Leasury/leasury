import Link from 'next/link';

export default function ZoomLandingPage() {
    return (
        <main className="min-h-screen bg-[#FAF9F5] flex flex-col items-center py-20 px-6 font-sans text-[#1A1A1A]">
            <div className="max-w-3xl w-full text-center">
                <div className="text-8xl mb-8">🔍</div>
                <h1 className="text-6xl font-black tracking-tight mb-4 uppercase">Zoom-Out</h1>
                <p className="text-2xl text-[#B0AEA5] font-medium mb-12">
                    Digital Zen Edition. Can you recognize the object in extreme detail?
                </p>

                <div className="bg-white rounded-3xl p-10 shadow-xl border border-[#E8E6DC] text-left mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="text-[#D97757]">✨</span> How to Play
                    </h2>
                    <ul className="space-y-4 text-lg text-[#1A1A1A]/80 font-medium">
                        <li className="flex items-start gap-3">
                            <span className="font-bold text-[#D97757]">1.</span>
                            Host a game on your TV or main display.
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="font-bold text-[#D97757]">2.</span>
                            Players join using the room code on their phones.
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="font-bold text-[#D97757]">3.</span>
                            A 4K image will slowly zoom out over 90 seconds.
                            The faster you type the right answer, the more points you get!
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/games/zoom/host"
                        className="bg-[#1A1A1A] text-white px-10 py-5 rounded-2xl font-bold text-2xl hover:bg-[#333] transition-transform hover:scale-105 shadow-xl"
                    >
                        Host Zoom 📺
                    </Link>
                    <Link
                        href="/join"
                        className="bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] px-10 py-5 rounded-2xl font-bold text-2xl hover:bg-[#F5F5F5] transition-transform hover:scale-105 shadow-xl"
                    >
                        Join Game 📱
                    </Link>
                </div>
            </div>

            <div className="mt-20 text-[#B0AEA5] font-medium border border-[#E8E6DC] rounded-xl px-6 py-3 bg-white shadow-sm flex items-center gap-2 max-w-lg text-sm text-center">
                <span className="text-xl">⚠️</span> MVP Demo Version: Typing exactly matching words is required. Example answers for testing: &quot;kocka&quot;, &quot;mince&quot;, &quot;jahoda&quot;.
            </div>
        </main>
    );
}
