import Header from '@/app/components/Header';
import Button from '@/app/components/Button';

export default function DemoLandingPage() {
    return (
        <div className="min-h-screen bg-[#FAF9F5]">
            <Header />

            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Game Header */}
                <div className="text-center mb-12">
                    <div className="text-7xl mb-4">🎮</div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Demo Game
                    </h1>
                    <p className="text-[#B0AEA5] text-lg max-w-2xl mx-auto">
                        A simple counter sync demo to test real-time connections across devices.
                    </p>
                </div>

                {/* Choice Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Host Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow">
                        <div className="text-5xl mb-4 text-center">🖥️</div>
                        <h2 className="text-2xl font-bold mb-3 text-center">
                            Host Game
                        </h2>
                        <p className="text-[#B0AEA5] mb-6 text-center">
                            Start a game session on your PC or TV. Show a QR code for others to join.
                        </p>
                        <Button href="/games/demo/host" className="w-full">
                            I'm the Host
                        </Button>
                    </div>

                    {/* Join Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow">
                        <div className="text-5xl mb-4 text-center">📱</div>
                        <h2 className="text-2xl font-bold mb-3 text-center">
                            Join Game
                        </h2>
                        <p className="text-[#B0AEA5] mb-6 text-center">
                            Join an existing game by scanning a QR code or entering a room code.
                        </p>
                        <Button href="/games/demo/player" variant="outline" className="w-full">
                            I'm a Player
                        </Button>
                    </div>
                </div>

                {/* How It Works */}
                <div className="bg-[#F0EFEA] rounded-2xl p-8">
                    <h3 className="text-xl font-bold mb-4">How It Works</h3>
                    <ol className="space-y-3 text-[#141413]">
                        <li className="flex gap-3">
                            <span className="font-bold">1.</span>
                            <span>Host creates a room and displays a QR code</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">2.</span>
                            <span>Players scan the code or enter the room code manually</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">3.</span>
                            <span>Host starts the game when everyone is ready</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">4.</span>
                            <span>All devices sync in real-time using PartyKit</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
