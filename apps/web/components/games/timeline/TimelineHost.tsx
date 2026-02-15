'use client';

import { useEffect, useState } from 'react';
import type { TimelineGameState, PlacedEvent } from '@leasury/game-logic';
import { formatEventValue, getCategoryIcon } from '@leasury/game-logic';

interface TimelineHostProps {
    state: {
        room: any;
        game: TimelineGameState;
    };
}

export default function TimelineHost({ state }: TimelineHostProps) {
    const { game } = state;
    const [revealingCardId, setRevealingCardId] = useState<string | null>(null);

    // Trigger card flip animation when status changes to 'revealing'
    useEffect(() => {
        if (game.status === 'revealing' && game.activeEvent) {
            setRevealingCardId(game.activeEvent.id);

            // Auto-advance to next turn after animation
            setTimeout(() => {
                setRevealingCardId(null);
                const socket = (window as any).__partySocket;
                if (socket) {
                    socket.send(JSON.stringify({ type: 'nextTurn' }));
                }
            }, 3000);
        }
    }, [game.status, game.activeEvent]);

    const getStatusBar = () => {
        if (game.mode === 'coop') {
            const hearts = '❤️'.repeat(game.lives) + '🤍'.repeat(Math.max(0, 3 - game.lives));
            return (
                <div className="flex items-center justify-between">
                    <div className="text-2xl">{hearts}</div>
                    <div className="text-lg font-bold">
                        {game.cardsPlaced} / {game.cardsGoal} cards
                    </div>
                </div>
            );
        } else {
            // Competitive mode - show scores
            return (
                <div className="flex gap-6">
                    {Object.entries(game.playerScores).map(([playerId, score]) => (
                        <div
                            key={playerId}
                            className={`px-4 py-2 rounded-lg ${playerId === game.activePlayerId
                                ? 'bg-[#D97757] text-white'
                                : 'bg-[#F0EFEA]'
                                }`}
                        >
                            <span className="font-bold">{playerId}: </span>
                            <span>{score}pts</span>
                        </div>
                    ))}
                </div>
            );
        }
    };

    const renderCard = (event: PlacedEvent, index: number, isActive: boolean = false) => {
        const isRevealing = revealingCardId === event.id;
        const showValue = !isActive || game.status === 'revealing' || isRevealing;

        // Determine card color
        let cardBg = 'bg-[#FAF9F5]';
        if (isRevealing) {
            cardBg = event.wasCorrect ? 'bg-green-100' : 'bg-red-100';
        } else if (!event.wasCorrect && !isActive) {
            cardBg = 'bg-gray-200 opacity-70';
        }

        return (
            <div
                key={event.id || `card-${index}`}
                className={`${cardBg} rounded-2xl p-6 min-w-[280px] shadow-lg border-2 border-[#E8E6DC] transition-all duration-300 ${isRevealing ? 'scale-105' : ''
                    }`}
                style={{
                    transform: isRevealing ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transformStyle: 'preserve-3d',
                }}
            >
                <div className="text-center">
                    <div className="text-3xl mb-2">{getCategoryIcon(event.category)}</div>
                    <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                    <div className="text-3xl font-bold text-[#D97757] tabular-nums">
                        {showValue ? formatEventValue(event) : '???'}
                    </div>
                    {event.description && showValue && (
                        <p className="text-xs text-[#B0AEA5] mt-2">{event.description}</p>
                    )}
                </div>
            </div>
        );
    };

    if (game.status === 'gameOver') {
        return (
            <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center">
                <div className="bg-white rounded-3xl p-12 text-center max-w-2xl">
                    <div className="text-7xl mb-6">🎉</div>
                    <h1 className="text-4xl font-bold mb-4">
                        {game.winner === 'team' ? 'Team Victory!' :
                            game.winner ? `${game.winner} Wins!` : 'Game Over'}
                    </h1>
                    {game.mode === 'coop' && (
                        <p className="text-xl text-[#B0AEA5] mb-6">
                            {game.winner ?
                                `You placed ${game.cardsPlaced} cards successfully!` :
                                'Better luck next time!'}
                        </p>
                    )}
                    <button
                        onClick={() => window.location.href = '/games/timeline'}
                        className="bg-[#D97757] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#CC785C]"
                    >
                        Play Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#2A2A2A] text-white p-8">
            {/* Status Bar */}
            <div className="max-w-7xl mx-auto mb-8">
                {getStatusBar()}
            </div>

            {/* Timeline */}
            <div className="max-w-7xl mx-auto mb-12">
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-4 items-center min-w-max">
                        {game.placedEvents.map((event, index) => {
                            // Check if active card should be inserted here
                            const showActiveHere =
                                game.status === 'placing' &&
                                game.activeEvent &&
                                game.proposedPosition === index;

                            return (
                                <div key={`slot-${index}`} className="flex gap-4 items-center">
                                    {showActiveHere && game.activeEvent && (
                                        <>
                                            {renderCard(
                                                { ...game.activeEvent, placedBy: '', wasCorrect: false } as PlacedEvent,
                                                -1,
                                                true
                                            )}
                                            <div className="text-4xl">→</div>
                                        </>
                                    )}
                                    {renderCard(event, index)}
                                    {index < game.placedEvents.length - 1 && (
                                        <div className="text-4xl">→</div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Active card at end */}
                        {game.status === 'placing' &&
                            game.activeEvent &&
                            game.proposedPosition === game.placedEvents.length && (
                                <>
                                    <div className="text-4xl">→</div>
                                    {renderCard(
                                        { ...game.activeEvent, placedBy: '', wasCorrect: false } as PlacedEvent,
                                        -1,
                                        true
                                    )}
                                </>
                            )}
                    </div>
                </div>
            </div>

            {/* Active Card Zone */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-[#3A3A3A] rounded-3xl p-8 text-center">
                    {game.status === 'placing' && game.activeEvent ? (
                        <>
                            <p className="text-lg text-[#B0AEA5] mb-4">
                                Current Turn: <span className="font-bold text-white">{game.activePlayerId || 'Player'}</span>
                            </p>
                            <p className="text-[#B0AEA5]">
                                Use your phone to place the card on the timeline
                            </p>
                        </>
                    ) : game.status === 'revealing' ? (
                        <p className="text-xl">Revealing card...</p>
                    ) : (
                        <p className="text-xl text-[#B0AEA5]">Waiting for next turn...</p>
                    )}
                </div>
            </div>
        </div>
    );
}
