'use client';

import Header from './components/Header';
import Button from './components/Button';
import GameCard from './components/GameCard';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

export default function Home() {
    const device = useDeviceDetection();

    return (
        <div className="min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Turn any screen into a{' '}
                            <span className="text-[#D97757]">game night</span>
                        </h1>
                        <p className="text-[#B0AEA5] text-lg mb-8">
                            Play board games together using your phones as
                            controllers. No apps to install, just scan and
                            play.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {device === 'mobile' ? (
                                /* Mobile: Show Join Game button */
                                <Button href="/join">Join Game</Button>
                            ) : (
                                /* PC: Show Browse Games */
                                <Button href="/games">Explore Games</Button>
                            )}
                            <Button href="/games/timeline" variant="outline">
                                Try Timeline Free
                            </Button>
                        </div>
                    </div>

                    {/* Illustration */}
                    <div className="flex justify-center">
                        <div className="relative">
                            {/* Main Screen */}
                            <div className="bg-white border-4 border-[#141413] rounded-2xl p-8 w-80 h-52 flex items-center justify-center shadow-lg">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">🎮</div>
                                    <div className="text-sm font-semibold">
                                        Game Screen
                                    </div>
                                </div>
                            </div>
                            {/* Left Phone */}
                            <div
                                className="absolute -left-8 bottom-4 bg-white border-4 border-[#141413] rounded-xl w-16 h-24 flex items-center justify-center shadow-lg"
                                style={{
                                    animation: 'float-phone 3s ease-in-out infinite'
                                }}
                            >
                                <div className="text-2xl">📱</div>
                            </div>
                            {/* Right Phone */}
                            <div
                                className="absolute -right-8 bottom-4 bg-white border-4 border-[#141413] rounded-xl w-16 h-24 flex items-center justify-center shadow-lg"
                                style={{
                                    animation: 'float-phone 3s ease-in-out infinite 0.5s'
                                }}
                            >
                                <div className="text-2xl">📱</div>
                            </div>
                            {/* Animated Dots (connection indicator) */}
                            <div className="absolute top-1/2 -left-20 flex gap-1.5">
                                <div
                                    className="w-2 h-2 rounded-full bg-[#D97757]"
                                    style={{
                                        animation: 'pulse-dot 1.5s ease-in-out infinite'
                                    }}
                                ></div>
                                <div
                                    className="w-2 h-2 rounded-full bg-[#D97757]"
                                    style={{
                                        animation: 'pulse-dot 1.5s ease-in-out infinite 0.3s'
                                    }}
                                ></div>
                                <div
                                    className="w-2 h-2 rounded-full bg-[#D97757]"
                                    style={{
                                        animation: 'pulse-dot 1.5s ease-in-out infinite 0.6s'
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-[#F0EFEA] py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        How It Works
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl text-center shadow-md hover:shadow-xl transition-shadow">
                            <div className="text-5xl mb-4">📺</div>
                            <h3 className="text-xl font-bold mb-3">
                                Open on TV
                            </h3>
                            <p className="text-[#B0AEA5]">
                                Launch any game on your big screen or computer.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl text-center shadow-md hover:shadow-xl transition-shadow">
                            <div className="text-5xl mb-4">📱</div>
                            <h3 className="text-xl font-bold mb-3">
                                Scan QR Code
                            </h3>
                            <p className="text-[#B0AEA5]">
                                Players scan with their phones to join
                                instantly.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl text-center shadow-md hover:shadow-xl transition-shadow">
                            <div className="text-5xl mb-4">🎉</div>
                            <h3 className="text-xl font-bold mb-3">
                                Play Together
                            </h3>
                            <p className="text-[#B0AEA5]">
                                Use your phone as a personal controller.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Game */}
            <section className="max-w-7xl mx-auto px-6 py-16">
                <GameCard
                    title="Timeline"
                    description="Place historical events in chronological order. Test your knowledge of history with friends!"
                    emoji="⏳"
                    href="/games/timeline"
                    featured
                />
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
