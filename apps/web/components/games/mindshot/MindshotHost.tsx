'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { generateRoomUrl } from '@lesury/game-logic';
import type { RoomState, MindshotGameState, MindshotFrameEvent, HexCoord } from '@lesury/game-logic';
import { generateHexGrid, hexKey, hexRing, PLAYER_COLORS } from '@lesury/game-logic';

// ─── SVG Constants ────────────────────────────────────────────────────────────

const HEX_SIZE = 42;
const SVG_W = 760;
const SVG_H = 680;
const SVG_CX = SVG_W / 2;
const SVG_CY = SVG_H / 2;

// Frame auto-advance delay in ms
const FRAME_DELAY_MS = 1000;

// ─── Hex → Pixel Conversion (flat-top) ───────────────────────────────────────

function hexToPixel(q: number, r: number): { x: number; y: number } {
    const x = HEX_SIZE * 1.5 * q + SVG_CX;
    const y = HEX_SIZE * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r) + SVG_CY;
    return { x, y };
}

function hexPolygonPoints(cx: number, cy: number, size: number): string {
    return Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 180) * (60 * i);
        return `${(cx + size * Math.cos(angle)).toFixed(2)},${(cy + size * Math.sin(angle)).toFixed(2)}`;
    }).join(' ');
}

// ─── Cell Fill Colors ─────────────────────────────────────────────────────────

function cellFill(status: string): string {
    if (status === 'danger') return '#E63946';
    if (status === 'warning') return '#F4A261';
    return '#F0EFEA';
}

// ─── Frame Event Description ──────────────────────────────────────────────────

function describeEvent(event: MindshotFrameEvent): string {
    switch (event.kind) {
        case 'move_step':
            return `Player moving…`;
        case 'shoot':
            return event.hitPlayerId
                ? `Hit!`
                : `Shot missed`;
        case 'zone_update':
            return 'Danger zone expands!';
        case 'damage':
            return `Zone damage — ${event.damagedPlayerIds.length} player(s) hurt!`;
        case 'elimination':
            return `${event.eliminatedPlayerIds.length} player(s) eliminated!`;
        default:
            return '';
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MindshotHostProps {
    state: {
        room: RoomState;
        game: MindshotGameState;
    };
    socket?: any;
}

const ALL_CELLS = generateHexGrid();

export default function MindshotHost({ state, socket: propSocket }: MindshotHostProps) {
    const { room, game } = state;
    const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Settings state
    const [selectedHp, setSelectedHp] = useState(3);
    const [shrinkSpeed, setShrinkSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

    const getSocket = () => propSocket ?? (typeof window !== 'undefined' ? (window as any).__partySocket : null);

    // Auto-advance frames in the resolving phase
    useEffect(() => {
        if (game.phase !== 'resolving') return;

        advanceTimerRef.current = setTimeout(() => {
            getSocket()?.send(JSON.stringify({ type: 'next_frame' }));
        }, FRAME_DELAY_MS);

        return () => {
            if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
        };
    }, [game.phase, game.currentFrame]);

    // QR code generation for lobby screen
    useEffect(() => {
        if (game.phase !== 'lobby' || !canvasRef.current) return;
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const url = generateRoomUrl('mindshot', room.roomCode, baseUrl);
        QRCode.toCanvas(
            canvasRef.current,
            url,
            { width: 220, margin: 2, color: { dark: '#141413', light: '#F0EFEA' } },
            (err) => { if (err) console.error('QR generation failed:', err); }
        );
    }, [game.phase, room.roomCode]);

    // Determine which state to render — current frame or live state
    const displayState =
        game.phase === 'resolving' && game.frames.length > 0
            ? game.frames[game.currentFrame]
            : null;

    const displayPlayers = displayState ? displayState.players : game.players;
    const displayCells = displayState ? displayState.cells : game.cells;
    const currentEvent = displayState ? displayState.event : null;

    // Count ready players (non-null plans)
    const alivePlayers = Object.values(game.players).filter((p) => p.status === 'alive');
    const readyCount = Object.values(game.plans).filter((p) => p !== null).length;

    const handleStartGame = () => {
        getSocket()?.send(JSON.stringify({
            type: 'start_game',
            maxHp: selectedHp,
            shrinkSpeed,
        }));
    };

    // ── Lobby / Settings Screen ────────────────────────────────────────────────
    if (game.phase === 'lobby') {
        const nonHostPlayers = room.players.filter((p: any) => !p.isHost && p.name !== 'Host');

        return (
            <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center p-6">
                <div className="flex gap-8 max-w-5xl w-full">
                    {/* LEFT: QR Code + Room Code + Players */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 bg-muted rounded-3xl p-8 shadow-2xl flex flex-col"
                    >
                        <p className="text-muted-foreground text-center text-sm mb-4">
                            Scan to join on mobile
                        </p>
                        <div className="flex justify-center mb-6">
                            <canvas
                                ref={canvasRef}
                                width={220}
                                height={220}
                                className="rounded-xl"
                            />
                        </div>

                        {/* Room Code */}
                        <div className="bg-card rounded-xl p-4 mb-6 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Room Code</p>
                            <p className="text-4xl font-bold tracking-widest text-foreground tabular-nums">
                                {room.roomCode}
                            </p>
                        </div>

                        {/* Player list with kick buttons */}
                        <div className="flex-1">
                            <p className="text-sm font-bold text-foreground mb-2">
                                Players ({nonHostPlayers.length})
                            </p>
                            {nonHostPlayers.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    Waiting for players to join...
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {nonHostPlayers.map((p: any) => (
                                        <div
                                            key={p.id}
                                            className="bg-card px-3 py-2 rounded-xl text-sm font-bold text-foreground flex items-center gap-2"
                                        >
                                            <span className="text-lg">{p.avatar || '👤'}</span>
                                            <span className="flex-1">{p.name}</span>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Remove ${p.name} from the game?`)) {
                                                        getSocket()?.send(JSON.stringify({ type: 'kick', playerId: p.id }));
                                                    }
                                                }}
                                                className="text-muted-foreground hover:text-red-500 transition-colors text-lg px-1"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* RIGHT: Settings + Start */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 bg-muted rounded-3xl p-8 shadow-2xl flex flex-col"
                    >
                        <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
                            Mindshot
                        </h1>
                        <p className="text-muted-foreground text-center mb-8">Configure your game</p>

                        {/* Max HP Slider */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-foreground mb-2">
                                Starting HP:{' '}
                                <span className="text-accent tabular-nums">{selectedHp}</span>
                                {' '}
                                <span className="text-muted-foreground font-normal">
                                    {'♥'.repeat(selectedHp)}
                                </span>
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={5}
                                value={selectedHp}
                                onChange={(e) => setSelectedHp(Number(e.target.value))}
                                className="w-full accent-accent"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>1 (Fast)</span>
                                <span>5 (Tanky)</span>
                            </div>
                        </div>

                        {/* Zone Shrink Speed */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-foreground mb-2">
                                Zone Speed
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['slow', 'normal', 'fast'] as const).map((speed) => (
                                    <button
                                        key={speed}
                                        onClick={() => setShrinkSpeed(speed)}
                                        className={`px-4 py-3 rounded-xl font-bold text-sm transition-all capitalize ${shrinkSpeed === speed
                                            ? 'bg-accent text-accent-foreground shadow-md'
                                            : 'bg-card text-foreground hover:bg-border'
                                            }`}
                                    >
                                        {speed === 'slow' ? '🐢 Slow' : speed === 'normal' ? '⚡ Normal' : '🔥 Fast'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1" />

                        {/* Disabled info / Start Button */}
                        {nonHostPlayers.length < 2 ? (
                            <div className="w-full bg-border text-muted-foreground px-6 py-4 rounded-xl font-bold text-lg text-center">
                                Need at least 2 players
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleStartGame}
                                className="w-full bg-accent text-accent-foreground px-6 py-4 rounded-xl font-bold text-lg hover:bg-accent-hover transition-colors cursor-pointer"
                            >
                                Start Game
                            </button>
                        )}
                    </motion.div>
                </div>
            </div>
        );
    }

    // ── Game Over Screen ───────────────────────────────────────────────────────
    if (game.phase === 'game_over') {
        const winner = room.players.find((p) => p.id === game.winnerId);
        return (
            <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-muted rounded-3xl p-12 text-center max-w-md w-full shadow-2xl"
                >
                    <div className="text-7xl mb-4">🏆</div>
                    {winner ? (
                        <>
                            <h2 className="text-4xl font-bold text-foreground mb-2">
                                {winner.name} Wins!
                            </h2>
                            <p className="text-accent text-xl font-semibold">Last one standing!</p>
                        </>
                    ) : (
                        <h2 className="text-4xl font-bold text-foreground">Draw!</h2>
                    )}
                    <p className="text-muted-foreground text-sm mt-6">
                        Players can request a rematch from their phones.
                    </p>
                </motion.div>
            </div>
        );
    }

    // ── Gameplay Screen (planning / resolving) ─────────────────────────────────
    return (
        <div className="min-h-screen bg-[#2A2A2A] flex flex-col items-center justify-center select-none overflow-hidden">
            {/* Header bar */}
            <div className="w-full flex items-center justify-between px-8 py-4 absolute top-0 left-0 right-0">
                <div className="text-white/60 text-sm font-mono uppercase tracking-widest">
                    MINDSHOT
                </div>
                {game.round > 0 && (
                    <div className="text-white/60 text-sm font-mono">
                        Round {game.round}
                    </div>
                )}
                <div className="text-white/40 text-sm font-mono">
                    {room.roomCode}
                </div>
            </div>

            {/* Phase banner */}
            <div className="absolute top-20 left-0 right-0 flex justify-center pointer-events-none z-10">
                {game.phase === 'planning' && (
                    <div className="bg-accent text-accent-foreground px-6 py-2 rounded-xl font-bold text-lg shadow-lg">
                        Planning Phase — {readyCount}/{alivePlayers.length} ready
                    </div>
                )}
                {game.phase === 'resolving' && currentEvent && (
                    <div className="bg-[#2A2A2A]/80 border border-white/20 text-white px-6 py-2 rounded-xl font-semibold text-lg backdrop-blur-sm shadow-xl">
                        {describeEvent(currentEvent)}
                    </div>
                )}
            </div>

            {/* Hex grid SVG */}
            <div className="flex-1 flex items-center justify-center w-full pt-12">
                <svg
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    className="max-h-[calc(100vh-160px)] w-auto"
                    style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.4))' }}
                >
                    {/* Hex tiles */}
                    {ALL_CELLS.map(({ q, r }) => {
                        const key = hexKey({ q, r });
                        const { x, y } = hexToPixel(q, r);
                        const status = displayCells[key] ?? 'normal';
                        const fill = cellFill(status);
                        const ring = hexRing({ q, r });
                        const isOuter = ring === 4;
                        return (
                            <polygon
                                key={key}
                                points={hexPolygonPoints(x, y, HEX_SIZE - 2)}
                                fill={fill}
                                stroke={isOuter ? '#888' : '#D0CEC4'}
                                strokeWidth={1}
                                style={{ transition: 'fill 0.4s ease' }}
                            />
                        );
                    })}

                    {/* Player tokens */}
                    {Object.values(displayPlayers).map((player) => {
                        if (player.status === 'eliminated') return null;
                        const { x, y } = hexToPixel(player.position.q, player.position.r);
                        const color = PLAYER_COLORS[player.colorIndex] ?? '#D97757';
                        return (
                            <g
                                key={player.id}
                                style={{
                                    transform: `translate(${x}px, ${y}px)`,
                                    transition: 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                }}
                            >
                                <circle r={16} fill="rgba(0,0,0,0.25)" cy={2} />
                                <circle r={15} fill={color} />
                                <text
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize={13}
                                    fontWeight="bold"
                                    fill="white"
                                    style={{ userSelect: 'none' }}
                                >
                                    {player.hp}
                                </text>
                                <g transform="translate(0, 22)">
                                    {Array.from({ length: selectedHp || 3 }, (_, i) => (
                                        <text
                                            key={i}
                                            x={(i - Math.floor((selectedHp || 3) / 2)) * 12}
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            fontSize={9}
                                            fill={i < player.hp ? color : 'rgba(255,255,255,0.2)'}
                                        >
                                            ♥
                                        </text>
                                    ))}
                                </g>
                            </g>
                        );
                    })}

                    {/* Eliminated player ghost markers */}
                    {Object.values(displayPlayers).map((player) => {
                        if (player.status !== 'eliminated') return null;
                        const { x, y } = hexToPixel(player.position.q, player.position.r);
                        const color = PLAYER_COLORS[player.colorIndex] ?? '#D97757';
                        return (
                            <g key={`elim-${player.id}`} opacity={0.3}>
                                <circle cx={x} cy={y} r={10} fill={color} />
                                <text
                                    x={x}
                                    y={y}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize={10}
                                    fill="white"
                                >
                                    ✕
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Player legend */}
            <div className="flex gap-4 pb-6 flex-wrap justify-center px-4">
                {room.players
                    .filter((p) => !p.isHost)
                    .map((roomPlayer) => {
                        const gamePlayer = game.players[roomPlayer.id];
                        if (!gamePlayer) return null;
                        const color = PLAYER_COLORS[gamePlayer.colorIndex] ?? '#D97757';
                        const isEliminated = gamePlayer.status === 'eliminated';
                        return (
                            <div
                                key={roomPlayer.id}
                                className="flex items-center gap-2 text-sm"
                                style={{ opacity: isEliminated ? 0.4 : 1 }}
                            >
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-white/80 font-medium">{roomPlayer.name}</span>
                                <span className="text-white/40">
                                    {Array.from({ length: gamePlayer.hp }, () => '♥').join('')}
                                </span>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
