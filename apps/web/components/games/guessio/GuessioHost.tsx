'use client';

import { RoomState, GuessioGameState } from '@lesury/game-logic';
import GameLayout from '@/components/layout/GameLayout';

interface GuessioHostProps {
    state: {
        room: RoomState;
        game: GuessioGameState;
    };
}

export default function GuessioHost({ state }: GuessioHostProps) {
    const { room, game } = state;

    const handleStartGame = () => {
        const socket = (window as any).__partySocket;
        if (socket) {
            // Simplified team assignment for now: split players down the middle
            const nonHostPlayers = room.players.filter((p) => !p.isHost);
            // Default 2 teams
            const teamIds = ['teamA', 'teamB'];
            socket.send(
                JSON.stringify({
                    type: 'start_game',
                    teamIds,
                })
            );
        }
    };

    const handleNextTurn = () => {
        const socket = (window as any).__partySocket;
        if (socket) {
            socket.send(JSON.stringify({ type: 'next_turn' }));
        }
    };

    return (
        <GameLayout backUrl="/games/guessio" theme="light">
            <div className="flex flex-col items-center justify-center p-8 bg-[#FAF9F5] min-h-screen font-sans">
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#E8E6DC] max-w-4xl w-full">
                    <h1 className="text-4xl font-bold text-center mb-8">Guessio - Host</h1>

                    {room.status === 'waiting' && (
                        <div className="text-center">
                            <h2 className="text-2xl mb-4">Waiting for players to join...</h2>
                            <p className="text-[#B0AEA5] mb-6">
                                {room.players.length} player(s) connected. We need at least 4.
                            </p>
                            <button
                                onClick={handleStartGame}
                                disabled={room.players.length < 5} // Wait, 1 host + 4 players = 5
                                className="bg-[#D97757] hover:bg-[#CC785C] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xl font-bold py-4 px-8 rounded-2xl transition-all"
                            >
                                Start Game ({room.players.length - 1}/4 ready)
                            </button>
                        </div>
                    )}

                    {room.status === 'playing' && game && (
                        <div>
                            {/* Scoreboard */}
                            <div className="flex justify-between mb-8">
                                {Object.keys(game.scores || {}).map((teamId) => (
                                    <div key={teamId} className="bg-[#F0EFEA] rounded-2xl p-6 text-center flex-1 mx-2">
                                        <h3 className="text-xl font-bold mb-2">{teamId}</h3>
                                        <div className="text-6xl font-bold tabular-nums">
                                            {game.scores[teamId]}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Game State Info */}
                            <div className="bg-[#F0EFEA] rounded-2xl p-6 mb-8 text-center">
                                <h3 className="text-2xl font-bold capitalize mb-2 border-b pb-2">Status: {game.status}</h3>
                                <p className="text-lg">Active Player: {game.players?.[game.activePlayerId]?.name || game.activePlayerId}</p>
                                <p className="text-lg">Category: <span className="font-bold capitalize">{game.activeCategory}</span></p>

                                {game.status === 'recording_resolution' && (
                                    <div className="mt-4 p-4 bg-yellow-100 rounded-xl">
                                        <p className="text-xl">Word: <strong>{game.chosenWord}</strong></p>
                                        <p className="text-xl">Bet: <strong>{game.chosenBet} points</strong></p>
                                        <p className="text-2xl font-bold mt-2 animate-pulse text-red-500">Timer Running: 60s</p>
                                    </div>
                                )}

                                {game.status === 'scoring' && (
                                    <div className="mt-4">
                                        <p className="text-2xl font-bold mb-4">Result: {game.roundResult}</p>
                                        <button
                                            onClick={handleNextTurn}
                                            className="bg-[#141413] hover:bg-[#2a2a28] text-white text-xl font-bold py-4 px-8 rounded-2xl"
                                        >
                                            Next Turn
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Board Visualization (Simple list for now) */}
                            <div className="text-left">
                                <h4 className="text-xl font-bold mb-2">The Board (First 10 steps)</h4>
                                <div className="flex gap-2 overflow-x-auto pb-4">
                                    {game.board?.slice(0, 10).map((cat, idx) => (
                                        <div key={idx} className="bg-gray-200 min-w-[100px] p-2 rounded text-center text-sm capitalize">
                                            {idx}: {cat}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </GameLayout>
    );
}
