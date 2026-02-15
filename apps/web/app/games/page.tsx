import Header from '../components/Header';
import GameCard from '../components/GameCard';
import Button from '../components/Button';

export default function GamesPage() {
    return (
        <div className="min-h-screen">
            <Header />

            {/* Page Header */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Games Library
                </h1>
                <p className="text-[#B0AEA5] text-lg">
                    Choose a game to play with friends. More games coming soon!
                </p>
            </section>

            {/* Games Grid */}
            <section className="max-w-7xl mx-auto px-6 pb-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Timeline - Featured */}
                    <div className="md:col-span-2 lg:col-span-2">
                        <GameCard
                            title="Timeline"
                            description="Place historical events in chronological order. Test your knowledge of history with friends!"
                            emoji="⏳"
                            players="2-8"
                            duration="15-25 min"
                            href="/games/timeline"
                            featured
                        />
                    </div>

                    {/* Demo */}
                    <GameCard
                        title="Demo"
                        description="A simple counter sync demo to test real-time connections across devices."
                        emoji="🎮"
                        players="2-12"
                        duration="10-20 min"
                        href="/demo"
                    />

                    {/* Coming Soon Games */}
                    <GameCard
                        title="Mindshot"
                        description="Battle Royale on a 10×10 grid. Plan your moves and shots in this strategic multiplayer game."
                        emoji="🎯"
                        players="2-4"
                        duration="20-30 min"
                        href="/games/mindshot"
                        comingSoon
                    />

                    <GameCard
                        title="Zoom-out"
                        description="A zoomed-in image gradually reveals itself. Race to guess what it is first!"
                        emoji="🔍"
                        players="2-12"
                        duration="10-20 min"
                        href="/games/zoom-out"
                        comingSoon
                    />

                    <GameCard
                        title="Spectrum"
                        description="Find the hidden target on a scale between two opposites. Tune in to your team's thinking!"
                        emoji="⚖️"
                        players="3-8"
                        duration="15-25 min"
                        href="/games/spectrum"
                        comingSoon
                    />
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-[#F0EFEA] py-16">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Have a game idea?
                    </h2>
                    <p className="text-[#B0AEA5] mb-8">
                        We're always looking to expand our library. Let us know
                        what games you'd love to play!
                    </p>
                    <Button href="mailto:hello@leasury.com">
                        Suggest a Game
                    </Button>
                </div>
            </section>

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
