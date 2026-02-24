'use client';

import Header from '@/app/components/Header';
import Button from '@/app/components/Button';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

export default function TheLineLandingPage() {
    const device = useDeviceDetection();

    return (
        <div className="min-h-screen bg-[#FAF9F5]">
            <Header />

            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Game Header */}
                <div className="text-center mb-12">
                    <div className="text-7xl mb-4">📏</div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        The Line
                    </h1>
                    <p className="text-[#B0AEA5] text-lg max-w-2xl mx-auto">
                        Place events in order by weight, speed, population, and more. Can you find the right spot on the line?
                    </p>
                </div>

                {/* Device-Aware Actions */}
                {device === 'desktop' ? (
                    <div className="bg-white rounded-2xl p-8 shadow-md mb-8 text-center">
                        <div className="text-5xl mb-4">🖥️</div>
                        <h2 className="text-2xl font-bold mb-3">Host on PC/TV</h2>
                        <p className="text-[#B0AEA5] mb-6">
                            Start The Line and display the game on the big screen.
                        </p>
                        <Button href="/host?game=the-line" className="w-full max-w-md mx-auto">
                            Host The Line
                        </Button>
                    </div>
                ) : device === 'mobile' ? (
                    <div className="bg-white rounded-2xl p-8 shadow-md mb-8 text-center">
                        <div className="text-5xl mb-4">📱</div>
                        <h2 className="text-2xl font-bold mb-3">Join on Mobile</h2>
                        <p className="text-[#B0AEA5] mb-6">
                            Scan a QR code or enter a room code to join the game.
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

                {/* How to Play */}
                <div className="bg-[#F0EFEA] rounded-2xl p-8">
                    <h3 className="text-xl font-bold mb-4">How to Play</h3>
                    <ol className="space-y-3 text-[#141413]">
                        <li className="flex gap-3">
                            <span className="font-bold">1.</span>
                            <span>The host chooses a category (Weight, Speed, etc.) and number of rounds</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">2.</span>
                            <span>Each player gets an event card — you see the title but not the value</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">3.</span>
                            <span>Use the arrow buttons to find the right spot on the line</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">4.</span>
                            <span>Press PLACE to confirm — correct placement earns a point!</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">5.</span>
                            <span>Wrong or right, the card stays on the line. Most points wins!</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
