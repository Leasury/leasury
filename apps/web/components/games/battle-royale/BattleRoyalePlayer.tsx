'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type {
    RoomState,
    BattleRoyaleGameState,
    Direction,
    PlayerActions,
} from '@lesury/game-logic';
import { PLAYER_COLOR_HEX } from '@lesury/game-logic';
import CommandQueue from './CommandQueue';
import DPad from './DPad';

type SlotValue = Direction | 'stay' | 'skip' | null;

function sendMessage(msg: object) {
    (window as any).__partySocket?.send(JSON.stringify(msg));
}

interface BattleRoyalePlayerProps {
    state: {
        room: RoomState;
        game: BattleRoyaleGameState;
    };
    myPlayerId: string;
}

export default function BattleRoyalePlayer({ state, myPlayerId }: BattleRoyalePlayerProps) {
    const { room, game } = state;

    const [move1, setMove1] = useState<SlotValue>(null);
    const [move2, setMove2] = useState<SlotValue>(null);
    const [shoot, setShoot] = useState<SlotValue>(null);
    const [activeSlot, setActiveSlot] = useState<0 | 1 | 2>(0);
    const [isLocked, setIsLocked] = useState(false);

    const myPlayer = game.players[myPlayerId];
    const myColor = myPlayer ? PLAYER_COLOR_HEX[myPlayer.color] : '#D97757';
    const isEliminated = myPlayer?.status === 'eliminated';

    // Reset plan state when new planning round starts
    useEffect(() => {
        if (game.phase === 'planning') {
            setMove1(null);
            setMove2(null);
            setShoot(null);
            setActiveSlot(0);
            setIsLocked(false);
        }
    }, [game.phase, game.round]);

    const setSlotValue = useCallback((index: 0 | 1 | 2, value: SlotValue) => {
        if (index === 0) setMove1(value);
        else if (index === 1) setMove2(value);
        else setShoot(value);
    }, []);

    const advanceToNextEmptySlot = useCallback((justSetIndex: 0 | 1 | 2) => {
        const values = [move1, move2, shoot];
        for (let offset = 1; offset < 3; offset++) {
            const nextIdx = ((justSetIndex + offset) % 3) as 0 | 1 | 2;
            if (nextIdx === justSetIndex) continue;
            if (values[nextIdx] === null) {
                setActiveSlot(nextIdx);
                return;
            }
        }
    }, [move1, move2, shoot]);

    const handleDirection = useCallback((dir: Direction) => {
        if (isLocked) return;
        setSlotValue(activeSlot, dir);
        advanceToNextEmptySlot(activeSlot);
    }, [activeSlot, isLocked, setSlotValue, advanceToNextEmptySlot]);

    const handleCenter = useCallback(() => {
        if (isLocked) return;
        const value: SlotValue = activeSlot === 2 ? 'skip' : 'stay';
        setSlotValue(activeSlot, value);
        advanceToNextEmptySlot(activeSlot);
    }, [activeSlot, isLocked, setSlotValue, advanceToNextEmptySlot]);

    const handleSlotTap = useCallback((index: 0 | 1 | 2) => {
        if (isLocked) return;
        setActiveSlot(index);
    }, [isLocked]);

    const allFilled = move1 !== null && move2 !== null && shoot !== null;

    const handleLockIn = useCallback(() => {
        if (!allFilled) return;

        if (isLocked) {
            // Unlock
            sendMessage({ type: 'unlock_actions' });
            setIsLocked(false);
            return;
        }

        const actions: PlayerActions = {
            move1: move1 as Direction | 'stay',
            move2: move2 as Direction | 'stay',
            shoot: shoot as Direction | 'skip',
        };
        sendMessage({ type: 'submit_actions', actions });
        setIsLocked(true);
    }, [allFilled, isLocked, move1, move2, shoot]);

    // ── Lobby ────────────────────────────────────────────────────────────────
    if (game.phase === 'lobby') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-6">
                <div className="text-6xl">{'⚔️'}</div>
                <h1 className="text-3xl font-bold text-foreground">Battle Royale</h1>
                <p className="text-muted-foreground text-center max-w-xs">
                    Look at the shared screen — Waiting for the host to start the game.
                </p>
                <div className="flex items-center gap-2 mt-4 bg-card px-5 py-3 rounded-2xl shadow-sm border border-border">
                    <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: myColor }} />
                    <span className="text-foreground font-medium">
                        {room.players.find((p) => p.id === myPlayerId)?.name ?? 'You'}
                    </span>
                </div>
            </div>
        );
    }

    // ── Eliminated ───────────────────────────────────────────────────────────
    if (isEliminated && game.phase !== 'game-over') {
        const placement = game.placements.indexOf(myPlayerId);
        const placeNum = placement >= 0 ? placement + 1 : Object.keys(game.players).length;

        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-6">
                <div className="text-7xl">{'💀'}</div>
                <h2 className="text-3xl font-bold text-foreground">Eliminated</h2>
                <p className="text-accent text-xl font-semibold">
                    {placeNum === 2 ? '2nd' : placeNum === 3 ? '3rd' : `${placeNum}th`} place
                </p>
                <p className="text-muted-foreground text-center max-w-[250px]">
                    Watch the rest of the battle on the shared screen.
                </p>
            </div>
        );
    }

    // ── Game Over ────────────────────────────────────────────────────────────
    if (game.phase === 'game-over') {
        const isWinner = game.winner === myPlayerId;
        const placement = game.placements.indexOf(myPlayerId);
        const placeNum = placement >= 0 ? placement + 1 : 1;

        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-6">
                <div className="text-8xl mb-4">{isWinner ? '🏆' : '💀'}</div>
                <h2 className="text-3xl font-bold text-foreground">
                    {isWinner ? 'Victory!' : game.winner ? `${placeNum === 2 ? '2nd' : placeNum === 3 ? '3rd' : `${placeNum}th`} Place` : 'Draw'}
                </h2>
                {myPlayer && (
                    <div className="bg-card rounded-2xl p-4 w-full max-w-xs">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">Rounds survived</div>
                            <div className="text-foreground font-bold text-right tabular-nums">{myPlayer.stats.roundsSurvived}</div>
                            <div className="text-muted-foreground">Damage dealt</div>
                            <div className="text-foreground font-bold text-right tabular-nums">{myPlayer.stats.damageDealt}</div>
                            <div className="text-muted-foreground">Damage taken</div>
                            <div className="text-foreground font-bold text-right tabular-nums">{myPlayer.stats.damageTaken}</div>
                            <div className="text-muted-foreground">Eliminations</div>
                            <div className="text-foreground font-bold text-right tabular-nums">{myPlayer.stats.eliminations}</div>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => sendMessage({ type: 'play_again' })}
                    className="bg-accent text-accent-foreground px-8 py-4 rounded-xl font-bold text-xl hover:bg-accent-hover transition-colors mt-4 shadow-lg active:scale-95"
                >
                    Play Again
                </button>
            </div>
        );
    }

    // ── Resolution / Waiting ─────────────────────────────────────────────────
    if (game.phase.startsWith('resolution-') || game.phase === 'round-summary') {
        const relevantEvents = game.roundEvents.filter(
            (e) =>
                (e.type === 'move' && e.playerId === myPlayerId) ||
                (e.type === 'shoot' && e.playerId === myPlayerId) ||
                (e.type === 'damage' && e.playerId === myPlayerId) ||
                (e.type === 'shoot' && e.hit === myPlayerId)
        );

        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-6">
                <div
                    className="w-20 h-20 rounded-full animate-pulse shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: myColor }}
                >
                    <span className="text-3xl text-white font-bold">
                        {myPlayer?.name?.[0]?.toUpperCase() ?? '?'}
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mt-4">Look up! {'📺'}</h2>

                {/* Event log */}
                {relevantEvents.length > 0 && (
                    <div className="bg-card rounded-2xl p-4 w-full max-w-xs space-y-2">
                        {relevantEvents.slice(-5).map((evt, i) => (
                            <div key={i} className="text-sm text-muted-foreground">
                                {evt.type === 'move' && `You moved ${evt.direction}`}
                                {evt.type === 'shoot' && evt.playerId === myPlayerId && (
                                    evt.hit
                                        ? `You shot ${evt.direction} \u2014 Hit!`
                                        : `You shot ${evt.direction} \u2014 Miss`
                                )}
                                {evt.type === 'shoot' && evt.hit === myPlayerId && `You were hit!`}
                                {evt.type === 'damage' && `${evt.source === 'zone' ? 'Zone' : 'Shot'} damage: -${evt.amount} HP`}
                            </div>
                        ))}
                    </div>
                )}

                {myPlayer && (
                    <div className="flex gap-2 mt-2 bg-card px-6 py-3 rounded-full shadow-sm border border-border">
                        {Array.from({ length: myPlayer.maxHp }, (_, i) => (
                            <span
                                key={i}
                                className="text-2xl"
                                style={{ opacity: i < myPlayer.hp ? 1 : 0.2, color: '#E63946' }}
                            >
                                {'\u2665'}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ── Planning Phase ───────────────────────────────────────────────────────
    const planSubmitted = game.players[myPlayerId]?.lockedIn;

    if (planSubmitted && isLocked) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-6">
                <div className="text-7xl">{'\u2713'}</div>
                <h2 className="text-3xl font-bold text-foreground">Locked In</h2>
                <p className="text-muted-foreground text-center">Waiting for others to finish...</p>
                <button
                    onClick={handleLockIn}
                    className="bg-card text-foreground px-6 py-3 rounded-xl font-bold border border-border hover:bg-border transition-colors mt-4"
                >
                    Unlock & Edit
                </button>
                {myPlayer && (
                    <div className="flex gap-2 mt-2 bg-card px-6 py-3 rounded-full shadow-sm border border-border">
                        {Array.from({ length: myPlayer.maxHp }, (_, i) => (
                            <span
                                key={i}
                                className="text-2xl"
                                style={{ opacity: i < myPlayer.hp ? 1 : 0.2, color: '#E63946' }}
                            >
                                {'\u2665'}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col relative w-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-card shadow-sm z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: myColor }} />
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Round {game.round}</p>
                        <p className="text-lg font-bold text-foreground leading-none">{myPlayer?.name || 'Plan Moves'}</p>
                    </div>
                </div>
                {myPlayer && (
                    <div className="flex gap-1">
                        {Array.from({ length: myPlayer.maxHp }, (_, i) => (
                            <span
                                key={i}
                                className="text-lg"
                                style={{ opacity: i < myPlayer.hp ? 1 : 0.2, color: '#E63946' }}
                            >
                                {'\u2665'}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto w-full pb-32">
                <div className="flex flex-col items-center justify-center min-h-full py-8 gap-y-8 px-4">
                    {/* Command Queue */}
                    <div className="bg-card p-5 rounded-3xl border border-border shadow-sm w-full max-w-sm">
                        <CommandQueue
                            move1={move1}
                            move2={move2}
                            shoot={shoot}
                            activeSlot={activeSlot}
                            onSlotTap={handleSlotTap}
                            disabled={isLocked}
                            accentColor={myColor}
                        />
                    </div>

                    {/* D-Pad */}
                    <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
                        <DPad
                            onDirection={handleDirection}
                            onCenter={handleCenter}
                            centerLabel={activeSlot === 2 ? 'SKIP' : 'STAY'}
                            disabled={isLocked}
                            accentColor={activeSlot === 2 ? '#E63946' : myColor}
                            selectedDirection={
                                activeSlot === 0 ? move1 :
                                activeSlot === 1 ? move2 :
                                shoot
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Lock In button */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-background via-background to-transparent z-20 pointer-events-none pb-8">
                <button
                    onClick={handleLockIn}
                    disabled={!allFilled}
                    className="w-full max-w-sm mx-auto flex items-center justify-center p-4 rounded-2xl font-bold text-xl transition-all pointer-events-auto active:scale-95"
                    style={{
                        backgroundColor: allFilled ? myColor : '#E8E6DC',
                        color: allFilled ? 'white' : '#B0AEA5',
                        cursor: allFilled ? 'pointer' : 'not-allowed',
                        boxShadow: allFilled ? `0 8px 24px ${myColor}40` : 'none',
                    }}
                >
                    {allFilled ? '🔒 LOCK IN' : 'Select all 3 to lock in'}
                </button>
            </div>
        </div>
    );
}
