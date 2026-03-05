'use client';

import { useState, useEffect } from 'react';
import type { RoomState, MindshotGameState, HexDirection, MindshotPlan } from '@lesury/game-logic';
import { PLAYER_COLORS } from '@lesury/game-logic';

// ─── Direction Layout ─────────────────────────────────────────────────────────
//
// Flat-top hex direction picker layout:
//
//      [NW]  [NE]
//   [W]   ●   [E]
//      [SW]  [SE]
//
// Implemented as a 3×3 CSS grid with center empty

const DIR_GRID: (HexDirection | null)[][] = [
    [null,  'NW', 'NE'],
    ['W',   null,  'E'],
    [null,  'SW', 'SE'],
];

const DIR_ARROWS: Record<HexDirection, string> = {
    NW: '↖',
    NE: '↗',
    W:  '←',
    E:  '→',
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
}

function DirectionPicker({ label, selected, onSelect, disabled, accentColor }: DirectionPickerProps) {
    return (
        <div className="flex flex-col items-center gap-3">
            <span className="text-[#B0AEA5] text-sm font-medium uppercase tracking-wide">
                {label}
            </span>
            <div className="grid grid-cols-3 gap-2">
                {DIR_GRID.map((row, ri) =>
                    row.map((dir, ci) => {
                        if (!dir) {
                            return (
                                <div
                                    key={`${ri}-${ci}`}
                                    className="w-14 h-14 flex items-center justify-center"
                                >
                                    {ri === 1 && ci === 1 && (
                                        <div className="w-3 h-3 rounded-full bg-[#E8E6DC]" />
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
                                className="w-14 h-14 rounded-xl font-bold text-2xl flex items-center justify-center transition-all"
                                style={{
                                    backgroundColor: isSelected
                                        ? (accentColor ?? '#D97757')
                                        : '#F0EFEA',
                                    color: isSelected ? 'white' : '#141413',
                                    opacity: disabled ? 0.5 : 1,
                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
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

type PlanStep = 'move1' | 'move2' | 'shoot' | 'submitted';

export default function MindshotPlayer({ state, myPlayerId }: MindshotPlayerProps) {
    const { room, game } = state;

    const [move1, setMove1] = useState<HexDirection | null>(null);
    const [move2, setMove2] = useState<HexDirection | null>(null);
    const [shoot, setShoot] = useState<HexDirection | null>(null);
    const [step, setStep] = useState<PlanStep>('move1');

    const myPlayer = game.players[myPlayerId];
    const myColor = myPlayer ? (PLAYER_COLORS[myPlayer.colorIndex] ?? '#D97757') : '#D97757';
    const isEliminated = myPlayer?.status === 'eliminated';

    // Reset plan state when a new planning phase starts
    useEffect(() => {
        if (game.phase === 'planning') {
            setMove1(null);
            setMove2(null);
            setShoot(null);
            setStep('move1');
        }
    }, [game.phase, game.round]);

    const handleMove1 = (dir: HexDirection) => {
        setMove1(dir);
        setStep('move2');
    };

    const handleMove2 = (dir: HexDirection) => {
        setMove2(dir);
        setStep('shoot');
    };

    const handleShoot = (dir: HexDirection) => {
        setShoot(dir);
    };

    const handleSubmit = () => {
        if (!move1 || !move2 || !shoot) return;
        const plan: MindshotPlan = {
            moves: [move1, move2],
            shootDirection: shoot,
        };
        sendMessage({ type: 'submit_plan', plan });
        setStep('submitted');
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
                <p className="text-[#B0AEA5] text-center">
                    Waiting for the host to start the game…
                </p>
                <div className="flex items-center gap-2 mt-4">
                    <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: myColor }} />
                    <span className="text-[#B0AEA5] text-sm">
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
                <div className="text-6xl">💀</div>
                <h2 className="text-2xl font-bold text-[#141413]">Eliminated</h2>
                <p className="text-[#B0AEA5] text-center">
                    Watch the battle unfold on the shared screen.
                </p>
            </div>
        );
    }

    // ── Game Over screen ────────────────────────────────────────────────────
    if (game.phase === 'game_over') {
        const isWinner = game.winnerId === myPlayerId;
        return (
            <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center gap-6 p-6">
                <div className="text-6xl">{isWinner ? '🏆' : '💀'}</div>
                <h2 className="text-2xl font-bold text-[#141413]">
                    {isWinner ? 'You won!' : 'Better luck next time'}
                </h2>
                <button
                    onClick={handlePlayAgain}
                    className="bg-[#D97757] text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-[#CC785C] transition-colors mt-4"
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
                    className="w-16 h-16 rounded-full animate-pulse"
                    style={{ backgroundColor: myColor }}
                />
                <p className="text-[#141413] font-semibold text-lg">Round resolving…</p>
                <p className="text-[#B0AEA5] text-sm text-center">
                    Watch the shared screen to see what happens!
                </p>
                {myPlayer && (
                    <div className="flex gap-2 mt-2">
                        {Array.from({ length: 3 }, (_, i) => (
                            <span
                                key={i}
                                className="text-xl"
                                style={{ opacity: i < myPlayer.hp ? 1 : 0.2, color: myColor }}
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
    const planSubmitted = step === 'submitted' || game.plans[myPlayerId] !== null;

    if (planSubmitted) {
        return (
            <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center gap-6 p-6">
                <div className="text-5xl">✓</div>
                <h2 className="text-2xl font-bold text-[#141413]">Plan submitted!</h2>
                <p className="text-[#B0AEA5] text-center">Waiting for other players…</p>
                {myPlayer && (
                    <div className="flex gap-2 mt-2">
                        {Array.from({ length: 3 }, (_, i) => (
                            <span
                                key={i}
                                className="text-xl"
                                style={{ opacity: i < myPlayer.hp ? 1 : 0.2, color: myColor }}
                            >
                                ♥
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF9F5] flex flex-col p-6 gap-6">
            {/* Round header */}
            <div className="flex items-center justify-between pt-2">
                <div>
                    <p className="text-xs text-[#B0AEA5] uppercase tracking-wide">Round</p>
                    <p className="text-2xl font-bold text-[#141413]">{game.round}</p>
                </div>
                {myPlayer && (
                    <div className="flex gap-1">
                        {Array.from({ length: 3 }, (_, i) => (
                            <span
                                key={i}
                                className="text-xl"
                                style={{ opacity: i < myPlayer.hp ? 1 : 0.2, color: myColor }}
                            >
                                ♥
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Step indicator */}
            <div className="flex gap-3 justify-center">
                {(['move1', 'move2', 'shoot'] as const).map((s, i) => (
                    <div
                        key={s}
                        className="flex items-center gap-1.5"
                    >
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                            style={{
                                backgroundColor:
                                    step === s
                                        ? myColor
                                        : (step === 'shoot' && s !== 'shoot') || (step === 'move2' && s === 'move1')
                                        ? '#788C5D'
                                        : '#E8E6DC',
                                color:
                                    step === s || (step === 'shoot' && s !== 'shoot') || (step === 'move2' && s === 'move1')
                                        ? 'white'
                                        : '#B0AEA5',
                            }}
                        >
                            {i + 1}
                        </div>
                        <span
                            className="text-xs"
                            style={{ color: step === s ? '#141413' : '#B0AEA5' }}
                        >
                            {s === 'move1' ? 'Move 1' : s === 'move2' ? 'Move 2' : 'Shoot'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Direction pickers */}
            <div className="flex flex-col gap-8 items-center flex-1 justify-center">
                {step === 'move1' && (
                    <DirectionPicker
                        label="Choose first move"
                        selected={move1}
                        onSelect={handleMove1}
                        accentColor={myColor}
                    />
                )}

                {step === 'move2' && (
                    <DirectionPicker
                        label="Choose second move"
                        selected={move2}
                        onSelect={handleMove2}
                        accentColor={myColor}
                    />
                )}

                {step === 'shoot' && (
                    <>
                        <DirectionPicker
                            label="Choose shoot direction"
                            selected={shoot}
                            onSelect={handleShoot}
                            accentColor="#E63946"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!shoot}
                            className="px-8 py-4 rounded-xl font-bold text-lg text-white transition-all"
                            style={{
                                backgroundColor: shoot ? myColor : '#E8E6DC',
                                color: shoot ? 'white' : '#B0AEA5',
                                cursor: shoot ? 'pointer' : 'not-allowed',
                            }}
                        >
                            Confirm & Send
                        </button>
                    </>
                )}
            </div>

            {/* Chosen plan preview */}
            {(move1 || move2 || shoot) && (
                <div className="bg-[#F0EFEA] rounded-2xl p-4 flex justify-around">
                    <div className="text-center">
                        <p className="text-xs text-[#B0AEA5] uppercase tracking-wide mb-1">Move 1</p>
                        <p className="text-2xl font-bold" style={{ color: move1 ? myColor : '#E8E6DC' }}>
                            {move1 ? DIR_ARROWS[move1] : '?'}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-[#B0AEA5] uppercase tracking-wide mb-1">Move 2</p>
                        <p className="text-2xl font-bold" style={{ color: move2 ? myColor : '#E8E6DC' }}>
                            {move2 ? DIR_ARROWS[move2] : '?'}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-[#B0AEA5] uppercase tracking-wide mb-1">Shoot</p>
                        <p className="text-2xl font-bold" style={{ color: shoot ? '#E63946' : '#E8E6DC' }}>
                            {shoot ? DIR_ARROWS[shoot] : '?'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
