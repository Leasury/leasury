'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/app/components/Header';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

const CrosshairIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <circle cx="12" cy="12" r="10" /><line x1="22" y1="12" x2="18" y2="12" />
        <line x1="6" y1="12" x2="2" y2="12" /><line x1="12" y1="6" x2="12" y2="2" />
        <line x1="12" y1="22" x2="12" y2="18" />
    </svg>
);

const EyeOffIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const ZapIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const TrophyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
);

const stepIcons = [EyeOffIcon, ZapIcon, ShieldIcon, CrosshairIcon, TrophyIcon];

const steps = [
    'Each round, secretly plan 2 moves and 1 shooting direction on your phone.',
    'When all players submit, moves and shots resolve simultaneously on the shared screen.',
    'A danger zone shrinks the hexagonal arena each round — stay inside or take damage.',
    'Last player standing with HP wins! Eliminated players watch the battle unfold.',
];

function HexHero() {
    const hexes = [
        { q: 0, r: 0, fill: '#D97757', delay: 0 },
        { q: 1, r: -1, fill: '#6A9BCC', delay: 0.1 },
        { q: -1, r: 1, fill: '#788C5D', delay: 0.2 },
        { q: 1, r: 0, fill: '#F0EFEA', delay: 0.05 },
        { q: -1, r: 0, fill: '#F0EFEA', delay: 0.15 },
        { q: 0, r: 1, fill: '#F4A261', delay: 0.25 },
        { q: 0, r: -1, fill: '#F0EFEA', delay: 0.1 },
        { q: 2, r: -1, fill: '#E8E6DC', delay: 0.3 },
        { q: -2, r: 1, fill: '#E8E6DC', delay: 0.35 },
        { q: 2, r: -2, fill: '#E63946', delay: 0.4, opacity: 0.5 },
        { q: -2, r: 2, fill: '#E63946', delay: 0.45, opacity: 0.5 },
        { q: 1, r: 1, fill: '#F0EFEA', delay: 0.2 },
        { q: -1, r: -1, fill: '#F0EFEA', delay: 0.2 },
    ];
    const HEX = 26;
    const W = 220;
    const H = 200;
    const CX = W / 2;
    const CY = H / 2;

    function hexPts(x: number, y: number) {
        return Array.from({ length: 6 }, (_, i) => {
            const a = (Math.PI / 180) * (60 * i);
            return `${(x + HEX * Math.cos(a)).toFixed(1)},${(y + HEX * Math.sin(a)).toFixed(1)}`;
        }).join(' ');
    }

    function hexXY(q: number, r: number) {
        return {
            x: HEX * 1.5 * q + CX,
            y: HEX * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r) + CY,
        };
    }

    return (
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
            {hexes.map(({ q, r, fill, delay, opacity }, i) => {
                const { x, y } = hexXY(q, r);
                const isPlayer = q === 0 && r === 0;
                return (
                    <motion.polygon
                        key={i}
                        points={hexPts(x, y)}
                        fill={fill}
                        opacity={opacity ?? 1}
                        stroke={isPlayer ? '#D97757' : '#E8E6DC'}
                        strokeWidth={isPlayer ? 2 : 1}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: opacity ?? 1, scale: 1 }}
                        transition={{ delay, duration: 0.4, ease: 'easeOut' }}
                        style={{ transformOrigin: `${x}px ${y}px` }}
                    />
                );
            })}
            <motion.circle cx={CX} cy={CY} r={12} fill="#D97757" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.35, ease: 'easeOut' }} style={{ transformOrigin: `${CX}px ${CY}px` }} />
            <motion.text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="bold" fill="white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>3</motion.text>
        </svg>
    );
}

export default function MindshotLandingPage() {
    const device = useDeviceDetection();

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="max-w-[1100px] mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-10 md:gap-16">
                <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex justify-center md:justify-start mb-4">
                        <HexHero />
                    </div>

                    <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-bold mb-2">
                        Mindshot
                    </motion.h1>

                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-foreground text-lg mb-6">
                        Battle Royale on a hexagonal grid. Plan your moves in secret, then watch chaos unfold simultaneously.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col gap-3">
                        {device === 'unknown' ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin w-6 h-6 border-2 border-border border-t-accent rounded-full" />
                            </div>
                        ) : device === 'desktop' ? (
                            <>
                                <Button asChild className="rounded-full px-8 py-4 h-auto text-lg font-bold bg-accent text-accent-foreground hover:bg-accent-hover shadow-lg hover:shadow-xl">
                                    <Link href="/host?game=mindshot">Host Mindshot</Link>
                                </Button>
                                <Button asChild variant="outline" className="rounded-full px-8 py-4 h-auto text-lg font-bold shadow-md hover:shadow-lg">
                                    <Link href="/join">Join a Game</Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button asChild className="rounded-full px-8 py-4 h-auto text-lg font-bold bg-accent text-accent-foreground hover:bg-accent-hover shadow-lg hover:shadow-xl">
                                    <Link href="/join">Join a Game</Link>
                                </Button>
                                <Button asChild variant="outline" className="rounded-full px-8 py-4 h-auto text-lg font-bold shadow-md hover:shadow-lg">
                                    <Link href="/host?game=mindshot">Host Mindshot</Link>
                                </Button>
                            </>
                        )}
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex-1 w-full">
                    <h3 className="text-lg font-bold mb-4">How to Play</h3>
                    <div className="bg-card rounded-2xl p-7 shadow-md">
                        {steps.map((step, i) => {
                            const Icon = stepIcons[i];
                            return (
                                <div key={i}>
                                    {i > 0 && <Separator className="my-4" />}
                                    <div className="flex items-center gap-3 text-accent">
                                        <Icon />
                                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent text-accent-foreground text-[13px] font-bold flex items-center justify-center">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-foreground leading-snug">{step}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
