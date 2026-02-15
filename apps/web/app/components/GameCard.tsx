'use client';

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
}: GameCardProps) {
    if (featured) {
        return (
            <Link
                href={comingSoon ? '#' : href}
                className={`block ${comingSoon ? 'cursor-not-allowed pointer-events-none' : ''}`}
            >
                <div className="bg-[#141413] text-white p-8 rounded-2xl hover:scale-[1.02] transition-all duration-200">
                    <div className="flex items-start gap-4">
                        <div className="text-5xl">{emoji}</div>
                        <div className="flex-1">
                            <div className="text-xs text-[#D97757] font-semibold uppercase mb-2">
                                Featured Game
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{title}</h3>
                            <p className="text-gray-300 mb-4">{description}</p>
                            <button className="bg-white text-[#141413] px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                Play Now →
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={comingSoon ? '#' : href}
            className={`block ${comingSoon ? 'cursor-not-allowed opacity-75 pointer-events-none' : ''}`}
        >
            <div className="bg-[#F0EFEA] p-6 rounded-2xl hover:scale-[1.02] transition-all duration-200 h-full relative">
                {comingSoon && (
                    <div className="absolute top-4 right-4 bg-[#B0AEA5] text-white text-xs px-3 py-1 rounded-full font-semibold">
                        Coming Soon
                    </div>
                )}
                <div className="text-4xl mb-3">{emoji}</div>
                <h3 className="text-xl font-bold mb-2 text-[#141413]">
                    {title}
                </h3>
                <p className="text-[#B0AEA5] text-sm mb-4 line-clamp-2">
                    {description}
                </p>
                {(players || duration) && (
                    <div className="flex items-center gap-4 text-sm text-[#B0AEA5]">
                        {players && (
                            <div className="flex items-center gap-1">
                                <span>👥</span>
                                <span>{players}</span>
                            </div>
                        )}
                        {duration && (
                            <div className="flex items-center gap-1">
                                <span>⏱</span>
                                <span>{duration}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}
