'use client';

import { useState, useEffect } from 'react';
import type { RoomState, MindshotGameState, HexDirection, MindshotPlan } from '@lesury/game-logic';
import { PLAYER_COLORS } from '@lesury/game-logic';

// ─── Direction Layout ─────────────────────────────────────────────────────────
//
// Flat-top hex direction picker layout:
//      [NW]  [NE]
//   [W]   ●   [E]
//      [SW]  [SE]

const DIR_GRID: (HexDirection | null)[][] = [
    [null, 'NW', 'NE'],
    ['W', null, 'E'],
    [null, 'SW', 'SE'],
];

const DIR_ARROWS: Record<HexDirection, string> = {
    NW: '↖',
    NE: '↗',
    W: '←',
    E: '→',
    SW: '↙',
    SE: '↘',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sendMessage(msg: object) {
    (window as any).__partySocket?.send(JSON.stringify(msg));
}

// ─── Direction Picker Component ───────────────────────────────────────────────

interface DirectionPickerProps {
    label: string;
    selected: HexDirection | null;
    onSelect: (dir: HexDirection) => void;
    disabled?: boolean;
    accentColor?: string;
    compact?: boolean;
}

function DirectionPicker({ label, selected, onSelect, disabled, accentColor, compact }: DirectionPickerProps) {
    const btnSize = compact ? 'w-10 h-10 text-lg' : 'w-14 h-14 text-2xl';

    return (
        <div className="flex flex-col items-center gap-2 w-full max-w-[200px]">
            <span className="text-[#B0AEA5] text-xs font-bold uppercase tracking-widest text-center h-6">
                {label}
            </span>
            <div className="grid grid-cols-3 gap-1.5 w-max">
                {DIR_GRID.map((row, ri) =>
                    row.map((dir, ci) => {
                        if (!dir) {
                            return (
                                <div
                                    key={`${ri}-${ci}`}
                                    className={`${btnSize} flex items-center justify-center`}
                                >
                                    {ri === 1 && ci === 1 && (
                                        <div className="w-2 h-2 rounded-full bg-[#E8E6DC]" />
                                    )}
                                </div>
                            );
                        }
                        const isSelected = selected === dir;
                        return (
                            <button
                                key={dir}
                                onClick={() => !disabled && onSelect(dir)}
                                disabled={disabled}
                                className={`${btnSize} rounded-xl font-bold flex items-center justify-center transition-all`}
                                style={{
                                    backgroundColor: isSelected
                                        ? (accentColor ?? '#D97757')
                                        : '#F0EFEA',
                                    color: isSelected ? 'white' : '#141413',
                                    opacity: disabled ? 0.5 : 1,
                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                                }}
                            >
                                {DIR_ARROWS[dir]}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface MindshotPlayerProps {
    state: {
        room: RoomState;
        game: MindshotGameState;
    };
    myPlayerId: string;
}

export default function MindshotPlayer({ state, myPlayerId }: MindshotPlayerProps) {
    const { room, game } = state;

    const [move1, setMove1] = useState<HexDirection | null>(null);
    const [move2, setMove2] = useState<HexDirection | null>(null);
    const [shoot, setShoot] = useState<HexDirection | null>(null);

    const myPlayer = game.players[myPlayerId];
    const myColor = myPlayer ? (PLAYER_COLORS[myPlayer.colorIndex] ?? '#D97757') : '#D97757';
    const isEliminated = myPlayer?.status === 'eliminated';

    // Reset plan state when a new planning phase starts
    useEffect(() => {
        if (game.phase === 'planning') {
            setMove1(null);
            setMove2(null);
            setShoot(null);
        }
    }, [game.phase, game.round]);

    const handleSubmit = () => {
        if (!move1 || !move2 || !shoot) return;
        const plan: MindshotPlan = {
            moves: [move1, move2],
            shootDirection: shoot,
        };
        sendMessage({ type: 'submit_plan', plan });
    };

    const handlePlayAgain = () => {
        sendMessage({ type: 'play_again' });
    };

    // ── Lobby screen ────────────────────────────────────────────────────────
    if (game.phase === 'lobby') {
        return (
            <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center gap-6 p-6">
                <div className="text-6xl">🎯</div>
                <h1 className="text-3xl font-bold text-[#141413]">Mindshot</h1>
                <p className="text-[#B0AEA5] text-center max-w-xs">
                    Look at the shared screen — Waiting for the host to start the game.
                </p>
                <div className="flex items-center gap-2 mt-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-[#E8E6DC]">
                    <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: myColor }} />
                    <span className="text-[#141413] font-medium">
                        {room.players.find((p) => p.id === myPlayerId)?.name ?? 'You'}
                    </span>
                </div>
            </div>
        );
    }

    // ── Eliminated screen ───────────────────────────────────────────────────
    if (isEliminated && game.phase !== 'game_over') {
        return (
            <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center gap-6 p-6">
                <div className="text-7xl">💀</div>
                <h2 className="text-3xl font-bold text-[#141413]">Eliminated</h2>
                <p className="text-[#B0AEA5] text-center max-w-[250px]">
                    You have been defeated! Watch the rest of the battle unfold on the shared screen.
                </p>
            </div>
        );
    }

    // ── Game Over screen ────────────────────────────────────────────────────
    if (game.phase === 'game_over') {
        const isWinner = game.winnerId === myPlayerId;
        return (
            <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center gap-6 p-6">
                <div className="text-8xl mb-4">{isWinner ? '🏆' : '💀'}</div>
                <h2 className="text-3xl font-bold text-[#141413]">
                    {isWinner ? 'Victory!' : 'Defeat'}
                </h2>
                <button
                    onClick={handlePlayAgain}
                    className="bg-[#D97757] text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-[#CC785C] transition-colors mt-8 shadow-lg active:scale-95"
                >
                    Play Again
                </button>
            </div>
        );
    }

    // ── Resolving / waiting screen ──────────────────────────────────────────
    if (game.phase === 'resolving') {
        return (
            <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center gap-6 p-6">
                <div
                    className="w-20 h-20 rounded-full animate-pulse shadow-[0_0_30px_rgba(0,0,0,0.15)] flex items-center justify-center"
                    style={{ backgroundColor: myColor }}
                >
                    <span className="text-3xl text-white font-bold tracking-widest uppercase">
                        {myPlayer?.id.slice(0, 2) ?? 'Me'}
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-[#141413] mt-4">Look up! 📺</h2>
                <p className="text-[#B0AEA5] text-center max-w-[250px]">
                    The round is resolving. Watch the shared screen to see what happens.
                </p>
                {myPlayer && (
                    <div className="flex gap-2 mt-6 bg-white px-6 py-3 rounded-full shadow-sm border border-[#E8E6DC]">
                        {Array.from({ length: 3 }, (_, i) => (
                            <span
                                key={i}
                                className="text-2xl"
                                style={{ opacity: i < myPlayer.hp ? 1 : 0.2, color: '#E63946' }}
                            >
                                ♥
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ── Planning phase ──────────────────────────────────────────────────────
    const planSubmitted = game.plans[myPlayerId] !== null;

    if (planSubmitted) {
        return (
            <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center gap-6 p-6">
                <div className="text-7xl">✓</div>
                <h2 className="text-3xl font-bold text-[#141413]">Locked In</h2>
                <p className="text-[#B0AEA5] text-center">Waiting for others to finish...</p>
                {myPlayer && (
                    <div className="flex gap-2 mt-6 bg-white px-6 py-3 rounded-full shadow-sm border border-[#E8E6DC]">
                        {Array.from({ length: 3 }, (_, i) => (
                            <span
                                key={i}
                                className="text-2xl"
                                style={{ opacity: i < myPlayer.hp ? 1 : 0.2, color: '#E63946' }}
                            >
                                ♥
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const allSelected = move1 && move2 && shoot;

    return (
        <div className="min-h-screen bg-[#FAF9F5] flex flex-col relative w-full overflow-hidden">
            {/* Round header */}
            <div className="flex items-center justify-between p-5 bg-white shadow-sm z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: myColor }} />
                    <div>
                        <p className="text-[10px] text-[#B0AEA5] uppercase tracking-wider font-bold">Round {game.round}</p>
                        <p className="text-lg font-bold text-[#141413] leading-none">Plan Moves</p>
                    </div>
                </div>
                {myPlayer && (
                    <div className="flex gap-1">
                        {Array.from({ length: 3 }, (_, i) => (
                            <span
                                key={i}
                                className="text-lg"
                                style={{ opacity: i < myPlayer.hp ? 1 : 0.2, color: '#E63946' }}
                            >
                                ♥
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Scrolling content area for the 3 pickers */}
            <div className="flex-1 overflow-y-auto w-full pb-32">
                <div className="flex flex-col items-center justify-center min-h-full py-8 gap-y-10 px-4">

                    {/* Top row: 2 moves side-by-side or stacked on very small screens */}
                    <div className="flex justify-center gap-4 w-full max-w-md bg-white p-5 rounded-3xl border border-[#E8E6DC] shadow-sm">
                        <DirectionPicker
                            label="Move 1"
                            selected={move1}
                            onSelect={setMove1}
                            accentColor={myColor}
                            compact
                        />
                        <div className="w-px bg-[#F0EFEA] self-stretch mx-1" />
                        <DirectionPicker
                            label="Move 2"
                            selected={move2}
                            onSelect={setMove2}
                            accentColor={myColor}
                            compact
                        />
                    </div>

                    {/* Bottom: Shoot */}
                    <div className="flex justify-center w-full max-w-[240px] bg-white p-6 rounded-3xl border border-[#E8E6DC] shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E63946]/30 to-transparent" />
                        <DirectionPicker
                            label="Shoot"
                            selected={shoot}
                            onSelect={setShoot}
                            accentColor="#E63946"
                        />
                    </div>
                </div>
            </div>

            {/* Fixed bottom action bar */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#FAF9F5] via-[#FAF9F5] to-transparent z-20 pointer-events-none pb-8">
                <button
                    onClick={handleSubmit}
                    disabled={!allSelected}
                    className="w-full max-w-sm mx-auto flex items-center justify-center p-4 rounded-2xl font-bold text-xl transition-all pointer-events-auto"
                    style={{
                        backgroundColor: allSelected ? myColor : '#E8E6DC',
                        color: allSelected ? 'white' : '#B0AEA5',
                        cursor: allSelected ? 'pointer' : 'not-allowed',
                        boxShadow: allSelected ? `0 8px 24px ${myColor}40` : 'none',
                        transform: allSelected ? 'translateY(0)' : 'translateY(2px)',
                    }}
                >
                    {allSelected ? 'Confirm & Send' : 'Select all 3 to confirm'}
                </button>
            </div>
        </div>
    );
}
