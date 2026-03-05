'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import type { RoomState, ZoomGameState, ZoomLevel } from '@lesury/game-logic';
import { generateRoomUrl, ZOOM_ROUND_DURATION_MS, PLAYER_COLORS } from '@lesury/game-logic';

export const MOCK_LEVELS: ZoomLevel[] = [
    {
        id: '1',
        imageUrl: '/games/zoom/levels/01_dog.png',
        answers: ['pes', 'pejsek', 'štěně', 'stene', 'dog', 'puppy'],
        funFact: 'Věděli jste, že psí čich je 10 000x až 100 000x citlivější než lidský a psi dokážou cítit i lidské emoce?',
    },
    {
        id: '2',
        imageUrl: '/games/zoom/levels/02_banana.jpg',
        answers: ['banán', 'banan', 'banana'],
        funFact: 'Věděli jste, že banánovník není strom, ale největší bylina na světě, a z botanického hlediska je banán vlastně bobule?',
    },
    {
        id: '3',
        imageUrl: '/games/zoom/levels/03_ant.png',
        answers: ['mravenec', 'ant'],
        funFact: 'Věděli jste, že mravenci nemají plíce a dýchají drobnými průduchy po stranách těla, navíc dokážou unést až 50x více než sami váží?',
    },
    {
        id: '4',
        imageUrl: '/games/zoom/levels/04_sun.jpg',
        answers: ['slunce', 'sluníčko', 'slunicko', 'sun', 'hvězda', 'hvezda', 'star'],
        funFact: 'Věděli jste, že Slunce tvoří 99,86 % veškeré hmoty v naší sluneční soustavě a světlo z něj k nám letí zhruba 8 minut a 20 sekund?',
    },
    {
        id: '5',
        imageUrl: '/games/zoom/levels/05_knife.png',
        answers: ['nůž', 'nuz', 'nožík', 'nozik', 'kudla', 'knife', 'čepel', 'cepel', 'blade'],
        funFact: 'Věděli jste, že nejstarší nalezené kamenné nože pocházejí z doby před 2,6 miliony let (oldovanská kultura) v dnešní Etiopii?',
    },
];

interface ZoomHostProps {
    state: {
        room: RoomState;
        game: ZoomGameState;
    };
    socket?: any;
}

export default function ZoomHost({ state, socket: propSocket }: ZoomHostProps) {
    const { room, game } = state;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const getSocket = () => propSocket ?? (typeof window !== 'undefined' ? (window as any).__partySocket : null);

    // Only active players (non-host) inside the room state
    const connectedPlayers = room.players.filter((p) => !p.isHost);
    const alivePlayers = Object.values(game.players);

    // Local 60fps progress for smooth progress bar and zooming
    const [elapsedMs, setElapsedMs] = useState(0);

    // ── Generate QR Code in Lobby ───────────────────────────────────────────
    useEffect(() => {
        if (game.phase !== 'lobby' || !room.roomCode || !canvasRef.current) return;
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const url = generateRoomUrl('zoom', room.roomCode, baseUrl);

        QRCode.toCanvas(
            canvasRef.current,
            url,
            {
                width: 250,
                margin: 2,
                color: { dark: '#141413', light: '#FAF9F5' },
            },
            (err) => {
                if (err) console.error('QR failed', err);
            }
        );
    }, [game.phase, room.roomCode]);

    // ── Timer loop ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (game.phase !== 'playing' || game.isPaused) {
            return;
        }

        let frameId: number;
        const tick = () => {
            const now = Date.now();
            const elapsed = now - (game.roundStartTime || now);
            setElapsedMs(Math.min(elapsed, ZOOM_ROUND_DURATION_MS));

            // Server also enforces time_up, but host can eagerly broadcast it too to avoid layout jumps
            if (elapsed >= ZOOM_ROUND_DURATION_MS) {
                getSocket()?.send(JSON.stringify({ type: 'time_up' }));
            } else {
                frameId = requestAnimationFrame(tick);
            }
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [game.phase, game.isPaused, game.roundStartTime]);

    // ── Preload images ──────────────────────────────────────────────────────
    useEffect(() => {
        MOCK_LEVELS.forEach(level => {
            const img = new Image();
            img.src = level.imageUrl;
        });
    }, []);

    // ── Actions ─────────────────────────────────────────────────────────────
    const handleStartGame = () => {
        getSocket()?.send(JSON.stringify({
            type: 'start_game',
            levels: MOCK_LEVELS,
        }));
    };

    const handleNextPhase = () => {
        getSocket()?.send(JSON.stringify({ type: 'next_round' }));
    };

    const handlePlayAgain = () => {
        getSocket()?.send(JSON.stringify({ type: 'play_again' }));
    };

    // ── Lobby View ──────────────────────────────────────────────────────────
    if (game.phase === 'lobby') {
        const canStart = connectedPlayers.length > 0;
        return (
            <div className="min-h-screen bg-[#1A1A1A] flex text-white font-sans p-8">
                {/* Left side: Setup & QR */}
                <div className="w-[450px] flex flex-col justify-between h-full bg-[#2A2A2A] rounded-3xl p-8 mr-8 shadow-2xl">
                    <div className="flex flex-col items-center">
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase text-white">Zoom-Out</h1>
                        <p className="text-white/60 mb-8 font-medium">Digital Zen Edition</p>

                        <div className="bg-white p-4 rounded-2xl mb-8 shadow-inner">
                            <canvas ref={canvasRef} width={250} height={250} className="rounded-xl block" style={{ width: 250, height: 250 }} />
                        </div>
                        <p className="text-white/60 mb-2 font-medium">or join at</p>
                        <div className="text-4xl font-mono font-bold tracking-[0.2em] bg-white/5 px-6 py-4 rounded-xl border border-white/10 w-full text-center">
                            {room.roomCode.toUpperCase()}
                        </div>
                    </div>

                    <div className="w-full">
                        <button
                            onClick={handleStartGame}
                            disabled={!canStart}
                            className={`w-full py-5 rounded-2xl font-bold text-2xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] outline-none border-t border-white/20 ${canStart
                                ? 'bg-white text-black hover:scale-[1.02] cursor-pointer'
                                : 'bg-white/10 text-white/30 cursor-not-allowed border-none'
                                }`}
                        >
                            Start Game
                        </button>
                    </div>
                </div>

                {/* Right side: Players */}
                <div className="flex-1 rounded-3xl p-8 flex flex-col flex-wrap content-start gap-4">
                    <h2 className="w-full text-2xl font-bold mb-4 text-white/40 uppercase tracking-widest pl-2">
                        Connected Players ({connectedPlayers.length})
                    </h2>
                    {connectedPlayers.map((p: any) => (
                        <motion.div
                            key={p.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4 min-w-[300px]"
                        >
                            <span className="text-3xl">{p.avatar || '👤'}</span>
                            <span className="font-bold text-2xl">{p.name}</span>
                        </motion.div>
                    ))}
                    {connectedPlayers.length === 0 && (
                        <div className="text-white/20 text-3xl font-bold mt-12 w-full text-center">
                            Waiting for players...
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Playing View ────────────────────────────────────────────────────────
    const currentLevel = game.round > 0 ? game.levels[game.round - 1] : null;

    if (game.phase === 'playing' && currentLevel) {
        // Zoom calculation: start at scale(15), end at scale(1) at 90s
        const progress = elapsedMs / ZOOM_ROUND_DURATION_MS;
        const currentScale = 15 - (progress * 14); // 15 -> 1

        return (
            <div className="min-h-screen bg-black overflow-hidden relative font-sans text-white">
                {/* 4K Image Zoom Container */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        className="w-[80vmin] h-[80vmin] bg-no-repeat bg-center bg-cover rounded-full shadow-[0_0_100px_rgba(0,0,0,1)]"
                        style={{
                            backgroundImage: `url(${currentLevel.imageUrl})`,
                            scale: currentScale,
                            // we use linear easing for smooth zoom without stutters
                            transformOrigin: '50% 50%',
                        }}
                    />
                </div>

                {/* Vignette overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

                {/* Top HUD */}
                <div className="absolute top-10 w-full px-12 flex justify-between items-start pointer-events-none z-10">
                    <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                        <p className="text-white/50 text-sm uppercase tracking-widest font-bold">Round</p>
                        <p className="text-4xl font-extrabold">{game.round} <span className="text-white/30 text-2xl">/ {game.totalRounds}</span></p>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 max-w-2xl mx-12 mt-4">
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white origin-left"
                                style={{ width: `${(1 - progress) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Player Status List */}
                <div className="absolute bottom-12 w-full px-12 flex justify-center gap-6 z-10 flex-wrap pointer-events-none">
                    <AnimatePresence>
                        {alivePlayers.map(p => {
                            const isCorrect = p.guessedCorrectly;
                            return (
                                <motion.div
                                    key={p.id}
                                    layout
                                    className={`px-8 py-4 rounded-2xl flex items-center gap-3 backdrop-blur-md transition-all duration-500 ${isCorrect
                                        ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] scale-110 border border-white'
                                        : 'bg-black/50 text-white/50 border border-white/10'
                                        }`}
                                >
                                    <span className={`font-bold text-xl ${isCorrect ? 'opacity-100' : 'opacity-50'}`}>{p.name}</span>
                                    {isCorrect && (
                                        <span className="text-green-500 font-black text-2xl ml-2 leading-none">✓</span>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // ── Reveal View ─────────────────────────────────────────────────────────
    if (game.phase === 'reveal') {
        const primaryAnswer = currentLevel?.answers[0].toUpperCase() || 'UNKNOWN';

        return (
            <div className="min-h-screen bg-black overflow-hidden relative font-sans text-white">
                {/* 4K Image (Fully revealed) */}
                <div className="absolute inset-0 opacity-40">
                    <div
                        className="w-full h-full bg-no-repeat bg-center bg-cover"
                        style={{ backgroundImage: `url(${currentLevel?.imageUrl})` }}
                    />
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white/50 text-2xl uppercase tracking-[0.5em] font-bold mb-4"
                    >
                        It was...
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
                        className="text-8xl font-black tracking-tight mb-16"
                    >
                        {primaryAnswer}
                    </motion.h2>

                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        onClick={handleNextPhase}
                        className="bg-white text-black px-12 py-5 rounded-2xl font-bold text-2xl hover:scale-105 transition-transform"
                    >
                        Show Leaderboard →
                    </motion.button>
                </div>
            </div>
        );
    }

    // ── Leaderboard View ────────────────────────────────────────────────────
    if (game.phase === 'round_leaderboard') {
        // Sort players by total score descending
        const sortedPlayers = [...alivePlayers].sort((a: any, b: any) => b.score - a.score);

        return (
            <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center py-16 text-white font-sans px-8">
                <h1 className="text-5xl font-black uppercase tracking-widest mb-16">Standings</h1>

                <div className="w-full max-w-4xl space-y-4">
                    {sortedPlayers.map((p: any, index) => {
                        return (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-6">
                                    <span className="text-4xl font-black text-white/20 w-12 text-center">{index + 1}</span>
                                    <span className="text-3xl font-bold">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {p.pointsThisRound > 0 && (
                                        <span className="text-green-400 font-bold text-xl">+{p.pointsThisRound}</span>
                                    )}
                                    <span className="text-4xl font-black tabular-nums">{p.score} <span className="text-xl text-white/40">pts</span></span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-16">
                    <button
                        onClick={handleNextPhase}
                        className="bg-white text-black px-12 py-5 rounded-2xl font-bold text-2xl hover:scale-105 transition-transform"
                    >
                        {game.round >= game.totalRounds ? 'Finish Game' : 'Next Round →'}
                    </button>
                </div>
            </div>
        );
    }

    // ── Game Over View ──────────────────────────────────────────────────────
    if (game.phase === 'game_over') {
        const sortedPlayers = [...alivePlayers].sort((a: any, b: any) => b.score - a.score);
        const winner = sortedPlayers[0];

        return (
            <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center p-8 text-white font-sans">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <div className="text-8xl mb-8">👑</div>
                    <h2 className="text-3xl font-bold text-white/50 uppercase tracking-widest mb-2">Winner</h2>
                    <h1 className="text-7xl font-black mb-6">{winner?.name || 'Nobody'}</h1>
                    <div className="text-yellow-400 text-5xl font-black mb-16">{winner?.score} pts</div>

                    <button
                        onClick={handlePlayAgain}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all"
                    >
                        Back to Lobby
                    </button>
                </motion.div>
            </div>
        );
    }

    return null;
}
