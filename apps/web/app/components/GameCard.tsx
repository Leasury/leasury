'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export interface GameCardProps {
    title: string;
    description: string;
    emoji: string;
    players?: string;
    duration?: string;
    href: string;
    featured?: boolean;
    comingSoon?: boolean;
    index?: number;
}

export default function GameCard({
    title,
    description,
    emoji,
    players,
    duration,
    href,
    featured = false,
    comingSoon = false,
    index = 0,
}: GameCardProps) {
    if (featured) {
        return (
            <Link
                href={comingSoon ? '#' : href}
                className={`block ${comingSoon ? 'cursor-not-allowed pointer-events-none' : ''}`}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#141413] text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200"
                >
                    <div className="flex items-start gap-4">
                        <div className="text-5xl">{emoji}</div>
                        <div className="flex-1">
                            <div className="text-xs text-[#D97757] font-semibold uppercase mb-2">
                                Featured Game
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{title}</h3>
                            <p className="text-gray-300 mb-4 line-clamp-2">
                                {description}
                            </p>
                            <button className="bg-white text-[#141413] px-6 py-2 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-md active:scale-[0.98]">
                                Play Now →
                            </button>
                        </div>
                    </div>
                </motion.div>
            </Link>
        );
    }

    const isAvailable = !comingSoon;

    return (
        <Link
            href={comingSoon ? '#' : href}
            className={`block ${comingSoon ? 'cursor-not-allowed' : ''}`}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                    relative bg-[#F0EFEA] p-6 rounded-2xl shadow-md transition-all duration-200 h-full group
                    ${isAvailable
                        ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:bg-white'
                        : 'opacity-60 cursor-not-allowed'
                    }
                `}
            >
                {comingSoon && (
                    <div className="absolute top-4 right-4 bg-[#B0AEA5] text-[#FAF9F5] text-xs font-semibold px-2 py-1 rounded-full">
                        Coming Soon
                    </div>
                )}

                <div className="text-5xl mb-4">{emoji}</div>
                <h3 className="text-xl font-bold text-[#141413] mb-2">
                    {title}
                </h3>
                <p className="text-[#B0AEA5] text-sm mb-4 line-clamp-2">
                    {description}
                </p>

                {(players || duration) && (
                    <div className="flex gap-4 text-sm text-[#B0AEA5]">
                        {players && (
                            <div className="flex items-center gap-1">
                                <span>👥</span>
                                <span>{players}</span>
                            </div>
                        )}
                        {duration && (
                            <div className="flex items-center gap-1">
                                <span>⏱️</span>
                                <span>{duration}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Hover Overlay */}
                {isAvailable && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-[#141413] bg-opacity-90 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <span className="text-[#FAF9F5] font-bold text-lg">
                            Play Now →
                        </span>
                    </motion.div>
                )}
            </motion.div>
        </Link>
    );
}
