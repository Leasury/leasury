'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { TheLineGameState, PlacedTheLineEvent } from '@lesury/game-logic';
import { getCategories } from '@lesury/game-logic';
import type { RoomState } from '@lesury/game-logic';

interface TheLineHostProps {
    state: {
        room: RoomState;
        game: TheLineGameState;
    };
}

export default function TheLineHost({ state }: TheLineHostProps) {
    const { room, game } = state;
    const timelineRef = useRef<HTMLDivElement>(null);
    const [selectedCategory, setSelectedCategory] = useState('Weight');
    const [selectedRounds, setSelectedRounds] = useState(5);
    const categories = getCategories();

    const playerName = (id: string) =>
        room.players.find((p: { id: string; name: string }) => p.id === id)?.name ?? id;

    const socket = typeof window !== 'undefined' ? (window as any).__partySocket : null;

    // Auto-scroll to keep active slot centered
    useEffect(() => {
        if (game.status === 'playing' && timelineRef.current) {
            const container = timelineRef.current;
            const cardWidth = 144;
            const gap = 12;
            const scrollPosition = game.cursorIndex * (cardWidth + gap + 8);
            const containerCenter = container.offsetWidth / 2;
            const scrollTo = scrollPosition - containerCenter + cardWidth / 2;

            container.scrollTo({
                left: Math.max(0, scrollTo),
                behavior: 'smooth',
            });
        }
    }, [game.cursorIndex, game.status]);

    // ─── Setup Screen ─────────────────────────────────────────────────────────

    if (game.status === 'setup') {
        const nonHostPlayers = room.players.filter((p: any) => !p.isHost);

        return (
            <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#F0EFEA] rounded-3xl p-8 max-w-lg w-full shadow-2xl"
                >
                    <h1 className="text-3xl font-bold text-[#141413] mb-2 text-center">The Line</h1>
                    <p className="text-[#B0AEA5] text-center mb-8">Configure your game</p>

                    {/* Category Select */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-[#141413] mb-2">
                            Category
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${selectedCategory === cat
                                        ? 'bg-[#D97757] text-white shadow-md'
                                        : 'bg-white text-[#141413] hover:bg-[#E8E6DC]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rounds Selector */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-[#141413] mb-2">
                            Rounds: <span className="text-[#D97757] tabular-nums">{selectedRounds}</span>
                        </label>
                        <input
                            type="range"
                            min={3}
                            max={10}
                            value={selectedRounds}
                            onChange={(e) => setSelectedRounds(Number(e.target.value))}
                            className="w-full accent-[#D97757]"
                        />
                        <div className="flex justify-between text-xs text-[#B0AEA5] mt-1">
                            <span>3</span>
                            <span>10</span>
                        </div>
                    </div>

                    {/* Players */}
                    <div className="mb-6">
                        <p className="text-sm font-bold text-[#141413] mb-2">
                            Players ({nonHostPlayers.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {nonHostPlayers.map((p: any) => (
                                <span
                                    key={p.id}
                                    className="bg-white px-3 py-1 rounded-full text-sm font-bold text-[#141413]"
                                >
                                    {p.name}
                                </span>
                            ))}
                            {nonHostPlayers.length === 0 && (
                                <span className="text-[#B0AEA5] text-sm">Waiting for players to join...</span>
                            )}
                        </div>
                    </div>

                    {/* Room Code */}
                    <div className="bg-white rounded-xl p-4 mb-6 text-center">
                        <p className="text-xs text-[#B0AEA5] mb-1">Room Code</p>
                        <p className="text-3xl font-bold tracking-widest text-[#141413] tabular-nums">
                            {room.roomCode}
                        </p>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={() => {
                            if (!socket || nonHostPlayers.length === 0) return;
                            socket.send(JSON.stringify({
                                type: 'start_game',
                                category: selectedCategory,
                                roundLimit: selectedRounds,
                                playerIds: nonHostPlayers.map((p: any) => p.id),
                            }));
                        }}
                        disabled={nonHostPlayers.length === 0}
                        className="w-full bg-[#D97757] text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-[#CC785C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Start Game
                    </button>
                </motion.div>
            </div>
        );
    }

    // ─── Game Over Screen ─────────────────────────────────────────────────────

    if (game.status === 'finished') {
        const sortedScores = Object.entries(game.scores).sort(([, a], [, b]) => b - a);
        const winnerId = sortedScores[0]?.[0];

        return (
            <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#F0EFEA] rounded-3xl p-12 text-center max-w-2xl shadow-2xl"
                >
                    <div className="text-7xl mb-6">🏆</div>
                    <h1 className="text-4xl font-bold mb-2 text-[#141413]">
                        {winnerId ? `${playerName(winnerId)} Wins!` : 'Game Over'}
                    </h1>
                    <p className="text-[#B0AEA5] mb-8">
                        Category: {game.selectedCategory} · {game.roundLimit} rounds
                    </p>

                    <div className="space-y-2 mb-8">
                        {sortedScores.map(([pid, score], idx) => (
                            <motion.div
                                key={pid}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`flex justify-between items-center p-4 rounded-xl ${idx === 0 ? 'bg-[#D97757] text-white' : 'bg-white'
                                    }`}
                            >
                                <span className="font-bold">
                                    #{idx + 1} {playerName(pid)}
                                </span>
                                <span className="font-bold tabular-nums">
                                    {score} pts
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    <button
                        onClick={() => (window.location.href = '/games/the-line')}
                        className="bg-[#D97757] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#CC785C] transition-colors shadow-lg"
                    >
                        Play Again
                    </button>
                </motion.div>
            </div>
        );
    }

    // ─── Gameplay Screen ──────────────────────────────────────────────────────

    const isRevealing = game.status === 'revealing';
    const lastAction = game.last_action;
    const resultColor = lastAction?.result === 'success' ? 'bg-green-500/10' : lastAction?.result === 'fail' ? 'bg-red-500/10' : '';

    return (
        <div className={`min-h-screen bg-[#2A2A2A] flex flex-col transition-colors duration-500 ${isRevealing ? resultColor : ''}`}>
            {/* Top Bar — Scores & Round */}
            <div className="bg-[#1E1E1E] border-b border-[#3A3A3A] py-3 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Player scores */}
                    <div className="flex gap-2">
                        {game.playQueue.map((pid) => (
                            <div
                                key={pid}
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${pid === game.activePlayerId
                                    ? 'bg-[#D97757] text-white shadow-md scale-105'
                                    : 'bg-[#3A3A3A] text-[#B0AEA5]'
                                    }`}
                            >
                                {playerName(pid)}: <span className="tabular-nums">{game.scores[pid] ?? 0}</span>
                            </div>
                        ))}
                    </div>

                    {/* Round counter */}
                    <div className="text-[#B0AEA5] font-bold tabular-nums">
                        Round {game.roundIndex} / {game.roundLimit}
                    </div>
                </div>
            </div>

            {/* Center — The Line */}
            <div className="flex-1 flex items-center relative overflow-hidden">
                <div
                    ref={timelineRef}
                    className="w-full overflow-x-auto px-12 py-8"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <div className="relative min-w-max">
                        {/* Horizontal line */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#3A3A3A] -translate-y-1/2" />

                        {/* Cards and slots */}
                        <div className="relative z-10 flex items-center gap-3">
                            <AnimatePresence mode="popLayout">
                                {game.line.map((event, index) => {
                                    const showSlotHere =
                                        game.status === 'playing' &&
                                        game.activeEvent &&
                                        game.cursorIndex === index;

                                    return (
                                        <div key={`slot-${event.id}`} className="flex items-center gap-3">
                                            {/* Cursor slot before this card */}
                                            {showSlotHere && game.activeEvent && (
                                                <motion.div
                                                    initial={{ width: 8, opacity: 0 }}
                                                    animate={{ width: 144, opacity: 1 }}
                                                    exit={{ width: 8, opacity: 0 }}
                                                    className="h-48 bg-[#D97757]/20 border-2 border-dashed border-[#D97757] rounded-2xl flex flex-col items-center justify-center flex-shrink-0 overflow-hidden"
                                                >
                                                    {game.activeEvent.imageUrl && (
                                                        <Image src={game.activeEvent.imageUrl} alt={game.activeEvent.title} width={80} height={80} className="object-contain mb-1" />
                                                    )}
                                                    <div className="text-center px-3">
                                                        <p className="text-white font-bold text-sm leading-tight">
                                                            {game.activeEvent.title}
                                                        </p>
                                                        <p className="text-[#D97757] text-xs mt-1">???</p>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {!showSlotHere && (
                                                <div className="w-1 h-8 bg-[#3A3A3A]/50 rounded-full flex-shrink-0" />
                                            )}

                                            {/* Placed card */}
                                            <motion.div
                                                layout
                                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                                className={`w-36 h-48 rounded-2xl p-3 flex flex-col justify-between flex-shrink-0 overflow-hidden ${isRevealing && event.id === lastAction?.eventId
                                                    ? event.wasCorrect
                                                        ? 'bg-green-500/20 border-2 border-green-400'
                                                        : 'bg-red-500/20 border-2 border-red-400'
                                                    : 'bg-[#F0EFEA] border border-[#E8E6DC]'
                                                    }`}
                                            >
                                                <p className="text-[#141413] font-bold text-xs leading-tight">
                                                    {event.title}
                                                </p>
                                                {event.imageUrl && (
                                                    <div className="flex justify-center my-1">
                                                        <Image src={event.imageUrl} alt={event.title} width={64} height={64} className="object-contain" />
                                                    </div>
                                                )}
                                                <div className="text-center">
                                                    <p className="text-[#D97757] font-bold text-lg tabular-nums">
                                                        {event.display_value}
                                                    </p>
                                                    <p className="text-[#B0AEA5] text-[10px]">
                                                        {event.unit}
                                                    </p>
                                                </div>
                                                <p className="text-[#B0AEA5] text-[10px] truncate">
                                                    {event.placedBy === 'system' ? '🌱 Seed' : playerName(event.placedBy)}
                                                </p>
                                            </motion.div>
                                        </div>
                                    );
                                })}

                                {/* Cursor slot at end */}
                                {game.status === 'playing' &&
                                    game.activeEvent &&
                                    game.cursorIndex === game.line.length && (
                                        <>
                                            <div className="w-1 h-8 bg-[#3A3A3A]/50 rounded-full flex-shrink-0" />
                                            <motion.div
                                                initial={{ width: 8, opacity: 0 }}
                                                animate={{ width: 144, opacity: 1 }}
                                                exit={{ width: 8, opacity: 0 }}
                                                className="h-48 bg-[#D97757]/20 border-2 border-dashed border-[#D97757] rounded-2xl flex flex-col items-center justify-center flex-shrink-0 overflow-hidden"
                                            >
                                                {game.activeEvent.imageUrl && (
                                                    <Image src={game.activeEvent.imageUrl} alt={game.activeEvent.title} width={80} height={80} className="object-contain mb-1" />
                                                )}
                                                <div className="text-center px-3">
                                                    <p className="text-white font-bold text-sm leading-tight">
                                                        {game.activeEvent.title}
                                                    </p>
                                                    <p className="text-[#D97757] text-xs mt-1">???</p>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Gradient fade indicators */}
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#2A2A2A] to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#2A2A2A] to-transparent pointer-events-none" />

                {/* Reveal overlay */}
                <AnimatePresence>
                    {isRevealing && lastAction && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                        >
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.2, 1] }}
                                    transition={{ duration: 0.5 }}
                                    className="text-9xl mb-4"
                                >
                                    {lastAction.result === 'success' ? '✅' : '❌'}
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-[#1E1E1E]/90 rounded-2xl p-6 max-w-md mx-4"
                                >
                                    <p className="text-white font-bold text-2xl tabular-nums">
                                        {lastAction.display_value} {lastAction.unit}
                                    </p>
                                    <p className="text-[#B0AEA5] text-sm mt-2 leading-relaxed">
                                        {lastAction.funfact}
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Bar — Active Card & Turn */}
            <div className="bg-[#1E1E1E] border-t border-[#3A3A3A] py-4 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Active card preview */}
                    <div className="flex items-center gap-4">
                        {game.activeEvent && game.status === 'playing' && (
                            <>
                                <div className="bg-[#D97757]/20 rounded-xl px-4 py-3 flex items-center gap-3">
                                    {game.activeEvent.imageUrl && (
                                        <Image src={game.activeEvent.imageUrl} alt={game.activeEvent.title} width={40} height={40} className="object-contain" />
                                    )}
                                    <div>
                                        <p className="text-[#D97757] text-xs font-bold uppercase">Active Card</p>
                                        <p className="text-white font-bold text-lg">{game.activeEvent.title}</p>
                                    </div>
                                </div>
                            </>
                        )}
                        {isRevealing && lastAction && (
                            <div className="bg-[#3A3A3A] rounded-xl px-4 py-3">
                                <p className="text-[#B0AEA5] text-xs font-bold uppercase">
                                    {lastAction.result === 'success' ? '✅ Correct!' : '❌ Wrong!'}
                                </p>
                                <p className="text-white font-bold tabular-nums">
                                    {lastAction.display_value} {lastAction.unit}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Current turn */}
                    <div className="text-right">
                        <p className="text-xs text-[#B0AEA5]">Current Turn</p>
                        <p className="font-bold text-[#D97757] text-lg">
                            {game.activePlayerId ? playerName(game.activePlayerId) : 'Waiting...'}
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
