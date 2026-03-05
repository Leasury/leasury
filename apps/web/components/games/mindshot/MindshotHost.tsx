'use client';

import { useEffect, useRef } from 'react';
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
}

const ALL_CELLS = generateHexGrid();

export default function MindshotHost({ state }: MindshotHostProps) {
    const { room, game } = state;
    const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-advance frames in the resolving phase
    useEffect(() => {
        if (game.phase !== 'resolving') return;

        advanceTimerRef.current = setTimeout(() => {
            (window as any).__partySocket?.send(JSON.stringify({ type: 'next_frame' }));
        }, FRAME_DELAY_MS);

        return () => {
            if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
        };
    }, [game.phase, game.currentFrame]);

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
        (window as any).__partySocket?.send(JSON.stringify({ type: 'start_game' }));
    };

    return (
        <div className="min-h-screen bg-[#2A2A2A] flex flex-col items-center justify-center select-none overflow-hidden">
            {/* Header bar */}
            <div className="w-full flex items-center justify-between px-8 py-4 absolute top-0 left-0 right-0">
                <div className="text-white/60 text-sm font-mono uppercase tracking-widest">
                    MINDSHOT
                </div>
                {game.phase !== 'lobby' && (
                    <div className="text-white/60 text-sm font-mono">
                        Round {game.round}
                    </div>
                )}
                <div className="text-white/40 text-sm font-mono">
                    {room.roomCode}
                </div>
            </div>

            {/* Phase banner */}
            <div className="absolute top-16 left-0 right-0 flex justify-center pointer-events-none">
                {game.phase === 'planning' && (
                    <div className="bg-[#D97757] text-white px-6 py-2 rounded-xl font-bold text-lg shadow-lg">
                        Planning Phase — {readyCount}/{alivePlayers.length} ready
                    </div>
                )}
                {game.phase === 'resolving' && currentEvent && (
                    <div className="bg-[#2A2A2A]/80 border border-white/20 text-white px-6 py-2 rounded-xl font-semibold text-lg backdrop-blur-sm">
                        {describeEvent(currentEvent)}
                    </div>
                )}
            </div>

            {/* Hex grid SVG */}
            <div className="flex-1 flex items-center justify-center w-full">
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
                                {/* Drop shadow */}
                                <circle r={16} fill="rgba(0,0,0,0.25)" cy={2} />
                                {/* Token body */}
                                <circle r={15} fill={color} />
                                {/* HP text */}
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
                                {/* HP hearts below token */}
                                <g transform="translate(0, 22)">
                                    {Array.from({ length: 3 }, (_, i) => (
                                        <text
                                            key={i}
                                            x={(i - 1) * 12}
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

            {/* Lobby overlay */}
            {game.phase === 'lobby' && (
                <div className="absolute inset-0 bg-[#2A2A2A]/95 flex flex-col items-center justify-center gap-8">
                    <div className="text-7xl">🎯</div>
                    <h1 className="text-5xl font-bold text-white">MINDSHOT</h1>
                    <p className="text-white/60 text-lg">
                        {room.players.filter((p) => !p.isHost).length} player(s) connected
                    </p>
                    {room.players.filter((p) => !p.isHost).length >= 2 ? (
                        <button
                            onClick={handleStartGame}
                            className="bg-[#D97757] text-white px-10 py-4 rounded-xl font-bold text-xl hover:bg-[#CC785C] transition-colors"
                        >
                            Start Game
                        </button>
                    ) : (
                        <p className="text-white/40 text-base">
                            Waiting for at least 2 players…
                        </p>
                    )}
                    <div className="text-white/30 text-sm font-mono">
                        Room: {room.roomCode}
                    </div>
                </div>
            )}

            {/* Game Over overlay */}
            {game.phase === 'game_over' && (
                <div className="absolute inset-0 bg-[#2A2A2A]/95 flex flex-col items-center justify-center gap-8">
                    <div className="text-7xl">🏆</div>
                    {game.winnerId ? (
                        <>
                            <h2 className="text-4xl font-bold text-white">
                                {room.players.find((p) => p.id === game.winnerId)?.name ?? 'Winner'}
                            </h2>
                            <p className="text-[#D97757] text-xl font-semibold">Last one standing!</p>
                        </>
                    ) : (
                        <h2 className="text-4xl font-bold text-white">Draw!</h2>
                    )}
                    <p className="text-white/40 text-sm mt-4">
                        Players can request a rematch from their phones.
                    </p>
                </div>
            )}
        </div>
    );
}
