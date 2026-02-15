import Header from '../../components/Header';
import Button from '../../components/Button';

export default function TimelinePage() {
    return (
        <div className="min-h-screen">
            <Header />

            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Game Header */}
                <div className="text-center mb-12">
                    <div className="text-7xl mb-4">⏳</div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Timeline
                    </h1>
                    <p className="text-[#B0AEA5] text-lg max-w-2xl mx-auto">
                        Place historical events in chronological order. Test
                        your knowledge of history with friends!
                    </p>
                </div>

                {/* Game Info */}
                <div className="bg-[#F0EFEA] rounded-2xl p-8 mb-8">
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-3xl mb-2">👥</div>
                            <div className="font-semibold mb-1">Players</div>
                            <div className="text-[#B0AEA5]">2-8</div>
                        </div>
                        <div>
                            <div className="text-3xl mb-2">⏱</div>
                            <div className="font-semibold mb-1">Duration</div>
                            <div className="text-[#B0AEA5]">15-25 min</div>
                        </div>
                        <div>
                            <div className="text-3xl mb-2">🎯</div>
                            <div className="font-semibold mb-1">Difficulty</div>
                            <div className="text-[#B0AEA5]">Medium</div>
                        </div>
                    </div>
                </div>

                {/* Placeholder Content */}
                <div className="bg-white border-2 border-dashed border-[#E8E6DC] rounded-2xl p-12 text-center mb-8">
                    <div className="text-5xl mb-4">🚧</div>
                    <h2 className="text-2xl font-bold mb-3">
                        Game Coming Soon
                    </h2>
                    <p className="text-[#B0AEA5] mb-6">
                        We're working hard to bring Timeline to life. Check
                        back soon!
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button href="/games">Browse Other Games</Button>
                        <Button href="/demo" variant="outline">
                            Try Demo Instead
                        </Button>
                    </div>
                </div>

                {/* How to Play */}
                <div className="prose max-w-none">
                    <h2 className="text-2xl font-bold mb-4">How to Play</h2>
                    <div className="bg-[#F0EFEA] rounded-xl p-6 space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">
                                1. Get your cards
                            </h3>
                            <p className="text-[#B0AEA5]">
                                Each player receives 4 historical event cards
                                showing only the event description.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">
                                2. Place in order
                            </h3>
                            <p className="text-[#B0AEA5]">
                                On your turn, place one of your cards on the
                                timeline where you think it belongs
                                chronologically.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">
                                3. Reveal and score
                            </h3>
                            <p className="text-[#B0AEA5]">
                                The date is revealed! If you placed it
                                correctly, keep playing. If wrong, draw a new
                                card.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">4. Win!</h3>
                            <p className="text-[#B0AEA5]">
                                First player to get rid of all their cards wins!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-[#E8E6DC] py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#B0AEA5]">
                            <span className="text-xl">⊙</span>
                            <span className="font-semibold">leasury</span>
                        </div>
                        <div className="text-sm text-[#B0AEA5]">
                            © 2025 Leasury. Board games, reimagined.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
