'use client';

import { useState, useEffect } from 'react';
import type { TimelineGameState } from '@leasury/game-logic';
import { getCategoryIcon, getCategoryLabel } from '@leasury/game-logic';
import GameLayout from '@/components/layout/GameLayout';

interface TimelinePlayerProps {
    state: {
        room: any;
        game: TimelineGameState;
    };
}

export default function TimelinePlayer({ state }: TimelinePlayerProps) {
    const { room, game } = state;
    const [playerId, setPlayerId] = useState('');

    useEffect(() => {
        // Get player ID from room
        const player = room.players.find((p: any) => !p.isHost);
        if (player) {
            setPlayerId(player.id);
        }
    }, [room.players]);

    const isMyTurn = game.activePlayerId === playerId;
    const socket = (window as any).__partySocket;

    const handleMove = (direction: 'left' | 'right') => {
        if (!socket || !isMyTurn) return;
        socket.send(JSON.stringify({ type: 'moveCard', direction }));
    };

    const handlePlace = () => {
        if (!socket || !isMyTurn) return;
        socket.send(JSON.stringify({ type: 'placeCard' }));
    };

    // Game Over
    if (game.status === 'gameOver') {
        return (
            <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-8 text-center max-w-md">
                    <div className="text-6xl mb-4">
                        {game.winner === playerId ? '🏆' : game.winner === 'team' ? '🎉' : '😐'}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                        {game.winner === 'team' ? 'Team Victory!' :
                            game.winner === playerId ? 'You Win!' : 'Game Over'}
                    </h2>
                    {game.mode === 'competitive' && (
                        <p className="text-xl text-[#B0AEA5] mb-4">
                            Your Score: {game.playerScores[playerId] || 0} points
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Waiting for turn
    if (!isMyTurn) {
        return (
            <GameLayout backUrl="/games/timeline" theme="dark" backLabel="← Back">
                <div className="flex items-center justify-center p-6" style={{ minHeight: 'calc(100vh - 60px)' }}>
                    <div className="text-center">
                        <div className="text-6xl mb-6 opacity-50">⏳</div>
                        <p className="text-white text-2xl font-bold mb-2">
                            {game.activePlayerId || 'Another player'} is playing
                        </p>
                        <p className="text-[#B0AEA5] text-lg">
                            Watch the main screen...
                        </p>
                        {game.mode === 'competitive' && (
                            <div className="mt-6 bg-[#3A3A3A] rounded-xl p-4">
                                <p className="text-[#B0AEA5] text-sm">Your Score</p>
                                <p className="text-white text-3xl font-bold">
                                    {game.playerScores[playerId] || 0}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </GameLayout>
        );
    }

    // Active turn - show event and controls
    if (!game.activeEvent) {
        return (
            <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#2A2A2A] flex flex-col">
            {/* Event Info - Top 1/3 */}
            <div className="flex-1 flex items-center justify-center p-8 border-b border-[#3A3A3A]">
                <div className="text-center max-w-md">
                    <div className="text-7xl mb-4">{getCategoryIcon(game.activeEvent.category)}</div>
                    <h2 className="text-white text-3xl font-bold mb-2">
                        {game.activeEvent.title}
                    </h2>
                    <p className="text-[#B0AEA5] text-lg">
                        {getCategoryLabel(game.activeEvent.category)}
                    </p>
                    {game.activeEvent.description && (
                        <p className="text-[#B0AEA5] text-sm mt-4">
                            {game.activeEvent.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Controls - Bottom 2/3 */}
            <div className="flex-[2] flex flex-col items-center justify-center p-8">
                {/* Arrow Buttons */}
                <div className="flex gap-6 mb-8 w-full max-w-md">
                    <button
                        onClick={() => handleMove('left')}
                        className="flex-1 bg-[#E8D5B7] hover:bg-[#D4C4A8] active:bg-[#C0B094] 
                                   text-[#141413] font-bold text-6xl rounded-2xl py-16
                                   shadow-lg transition-all active:scale-95"
                        disabled={game.status !== 'placing'}
                    >
                        ⬅
                    </button>
                    <button
                        onClick={() => handleMove('right')}
                        className="flex-1 bg-[#E8D5B7] hover:bg-[#D4C4A8] active:bg-[#C0B094]
                                   text-[#141413] font-bold text-6xl rounded-2xl py-16
                                   shadow-lg transition-all active:scale-95"
                        disabled={game.status !== 'placing'}
                    >
                        ➡
                    </button>
                </div>

                {/* Place Button */}
                <button
                    onClick={handlePlace}
                    className="bg-[#7BC47F] hover:bg-[#6AB069] active:bg-[#5A9A58]
                               text-white font-bold text-2xl rounded-2xl py-6 px-16
                               shadow-lg transition-all active:scale-95 w-full max-w-md"
                    disabled={game.status !== 'placing'}
                >
                    ✓ PLACE
                </button>

                {/* Hint */}
                <p className="text-[#B0AEA5] text-sm mt-6 text-center max-w-md">
                    Use arrows to position the card on the timeline, then press PLACE to confirm.
                    Keep your eyes on the main screen!
                </p>
            </div>
        </div>
    );
}
