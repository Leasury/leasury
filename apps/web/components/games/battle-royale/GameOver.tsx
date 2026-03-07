'use client';

import { motion } from 'framer-motion';
import type { BattleRoyaleGameState, RoomState } from '@lesury/game-logic';
import { PLAYER_COLOR_HEX } from '@lesury/game-logic';

interface GameOverProps {
    state: {
        room: RoomState;
        game: BattleRoyaleGameState;
    };
    onPlayAgain: () => void;
}

export default function GameOver({ state, onPlayAgain }: GameOverProps) {
    const { room, game } = state;
    const winner = game.winner
        ? room.players.find((p) => p.id === game.winner)
        : null;
    const winnerPlayer = game.winner ? game.players[game.winner] : null;

    // Build ranked list from placements
    const ranked = game.placements.map((id, i) => {
        const player = game.players[id];
        const roomPlayer = room.players.find((p) => p.id === id);
        return {
            id,
            name: roomPlayer?.name ?? player?.name ?? id,
            color: player?.color ?? 'blue',
            placement: i + 1,
            stats: player?.stats ?? { damageDealt: 0, damageTaken: 0, roundsSurvived: 0, eliminations: 0 },
        };
    });

    return (
        <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-muted rounded-3xl p-10 max-w-lg w-full shadow-2xl"
            >
                {/* Winner / Draw */}
                <div className="text-center mb-8">
                    <div className="text-7xl mb-4">{winner ? '🏆' : '💥'}</div>
                    {winner ? (
                        <>
                            <h2 className="text-4xl font-bold text-foreground mb-1">
                                {winner.name} Wins!
                            </h2>
                            <p className="text-accent text-lg font-semibold">Last one standing</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-4xl font-bold text-foreground mb-1">Draw!</h2>
                            <p className="text-muted-foreground text-lg">No survivors</p>
                        </>
                    )}
                </div>

                {/* Stats table */}
                {ranked.length > 0 && (
                    <div className="bg-card rounded-2xl overflow-hidden mb-8">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-muted-foreground">
                                    <th className="py-2 px-3 text-left">#</th>
                                    <th className="py-2 px-3 text-left">Player</th>
                                    <th className="py-2 px-3 text-center">Rounds</th>
                                    <th className="py-2 px-3 text-center">Dmg</th>
                                    <th className="py-2 px-3 text-center">Elims</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ranked.map((p) => (
                                    <tr key={p.id} className="border-b border-border/50 last:border-0">
                                        <td className="py-2 px-3 font-bold text-foreground">
                                            {p.placement === 1 ? '🥇' : p.placement === 2 ? '🥈' : p.placement === 3 ? '🥉' : `${p.placement}th`}
                                        </td>
                                        <td className="py-2 px-3">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: PLAYER_COLOR_HEX[p.color] }}
                                                />
                                                <span className="font-medium text-foreground">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 text-center text-muted-foreground tabular-nums">
                                            {p.stats.roundsSurvived}
                                        </td>
                                        <td className="py-2 px-3 text-center text-muted-foreground tabular-nums">
                                            {p.stats.damageDealt}
                                        </td>
                                        <td className="py-2 px-3 text-center text-muted-foreground tabular-nums">
                                            {p.stats.eliminations}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onPlayAgain}
                        className="w-full bg-accent text-accent-foreground px-6 py-4 rounded-xl font-bold text-lg hover:bg-accent-hover transition-colors"
                    >
                        Play Again
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
