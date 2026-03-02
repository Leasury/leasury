'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Button from '@/app/components/Button';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

const steps = [
    'The host chooses a category (Weight, Speed, etc.) and number of rounds',
    'Each player gets an event card — you see the title but not the value',
    'Use the arrow buttons to find the right spot on the line',
    'Press PLACE to confirm — correct placement earns a point!',
    'Wrong or right, the card stays on the line. Most points wins!',
];

export default function TheLineLandingPage() {
    const device = useDeviceDetection();

    return (
        <div className="min-h-screen bg-[#FAF9F5]">
            <Header />

            <div className="max-w-md mx-auto px-6 py-8">
                {/* Hero Section */}
                <div className="text-center mb-6">
                    {/* Animated line + cards hero */}
                    <div className="relative h-24 max-w-xs mx-auto mb-4">
                        {/* Horizontal line */}
                        <motion.div
                            className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E8E6DC]"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            style={{ originX: 0 }}
                        />

                        {/* Three cards dropping onto the line */}
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute top-1/2 w-10 h-14 rounded-lg bg-[#F0EFEA] border-2 border-[#E8E6DC] shadow-sm flex items-start justify-center pt-2"
                                style={{ left: `${20 + i * 30}%` }}
                                initial={{ y: -40, opacity: 0 }}
                                animate={{ y: '-50%', opacity: 1 }}
                                transition={{
                                    delay: 0.6 + i * 0.15,
                                    duration: 0.4,
                                    ease: 'easeOut',
                                }}
                            >
                                <div
                                    className="h-1 w-5 rounded-full bg-[#D97757]"
                                    style={{ opacity: 0.6 + i * 0.2 }}
                                />
                            </motion.div>
                        ))}
                    </div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold mb-2"
                    >
                        The Line
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-[#B0AEA5] text-lg"
                    >
                        Place events in order by weight, speed, population, and more. Can you find the right spot on the line?
                    </motion.p>
                </div>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col gap-3 mb-6"
                >
                    {device === 'unknown' ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin w-6 h-6 border-2 border-[#E8E6DC] border-t-[#D97757] rounded-full" />
                        </div>
                    ) : device === 'desktop' ? (
                        <>
                            <Link
                                href="/games/the-line/host"
                                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 active:scale-[0.98] bg-[#D97757] text-white shadow-lg hover:shadow-xl hover:brightness-110"
                            >
                                Host The Line
                            </Link>
                            <Button href="/join" variant="outline">
                                Join a Game
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/join"
                                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 active:scale-[0.98] bg-[#D97757] text-white shadow-lg hover:shadow-xl hover:brightness-110"
                            >
                                Join a Game
                            </Link>
                            <Button href="/games/the-line/host" variant="outline">
                                Host The Line
                            </Button>
                        </>
                    )}
                </motion.div>

                {/* How to Play */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#F0EFEA] rounded-2xl p-6"
                >
                    <h3 className="text-lg font-bold mb-3">How to Play</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {steps.map((step, i) => (
                            <div
                                key={i}
                                className={`flex items-start gap-3${
                                    i === 4 ? ' sm:col-span-2 sm:max-w-[calc(50%-6px)] sm:mx-auto' : ''
                                }`}
                            >
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#D97757] text-white text-sm font-bold flex items-center justify-center mt-0.5">
                                    {i + 1}
                                </span>
                                <span className="text-sm text-[#141413] leading-snug">
                                    {step}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
