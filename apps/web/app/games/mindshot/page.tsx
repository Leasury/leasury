'use client';

import Header from '@/app/components/Header';
import Button from '@/app/components/Button';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

export default function MindshotLandingPage() {
    const device = useDeviceDetection();

    return (
        <div className="min-h-screen bg-[#FAF9F5]">
            <Header />

            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Game Header */}
                <div className="text-center mb-12">
                    <div className="text-7xl mb-4">🎯</div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Mindshot</h1>
                    <p className="text-[#B0AEA5] text-lg max-w-2xl mx-auto">
                        Battle Royale on a hexagonal grid. Plan your moves in secret, then watch chaos unfold.
                    </p>
                </div>

                {/* Device-Aware Actions */}
                {device === 'desktop' ? (
                    <div className="bg-white rounded-2xl p-8 shadow-md mb-8 text-center">
                        <div className="text-5xl mb-4">🖥️</div>
                        <h2 className="text-2xl font-bold mb-3">Host on PC/TV</h2>
                        <p className="text-[#B0AEA5] mb-6">
                            Display the hexagonal game board on a shared screen. Players join on their phones.
                        </p>
                        <Button href="/host?game=mindshot" className="w-full max-w-md mx-auto">
                            Host Mindshot
                        </Button>
                    </div>
                ) : device === 'mobile' ? (
                    <div className="bg-white rounded-2xl p-8 shadow-md mb-8 text-center">
                        <div className="text-5xl mb-4">📱</div>
                        <h2 className="text-2xl font-bold mb-3">Join on Mobile</h2>
                        <p className="text-[#B0AEA5] mb-6">
                            Scan a QR code or enter a room code to join the battle.
                        </p>
                        <Button href="/join" className="w-full">
                            Join Game
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-12 shadow-md mb-8 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-[#E8E6DC] border-t-[#141413] rounded-full mx-auto mb-4" />
                        <p className="text-[#B0AEA5]">Detecting device...</p>
                    </div>
                )}

                {/* How It Works */}
                <div className="bg-[#F0EFEA] rounded-2xl p-8">
                    <h3 className="text-xl font-bold mb-4">How It Works</h3>
                    <ol className="space-y-3 text-[#141413]">
                        <li className="flex gap-3">
                            <span className="font-bold">1.</span>
                            <span>Each round, secretly plan 2 moves and 1 shooting direction on your phone.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">2.</span>
                            <span>When all players submit, moves and shots resolve simultaneously on the shared screen.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">3.</span>
                            <span>A danger zone shrinks the hexagonal arena each round — stay inside or take damage.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">4.</span>
                            <span>Last player standing with HP wins!</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
