'use client';

import { useEffect, useState, useCallback } from 'react';
import PartySocket from 'partysocket';
import type { DemoGameState, DemoMessage } from '@leasury/game-logic';

const PARTYKIT_HOST =
    process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';
const ROOM_ID = 'demo-room';

export default function DemoPage() {
    const [gameState, setGameState] = useState<DemoGameState | null>(null);
    const [socket, setSocket] = useState<PartySocket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<
        'connecting' | 'connected' | 'disconnected'
    >('connecting');

    useEffect(() => {
        const conn = new PartySocket({
            host: PARTYKIT_HOST,
            room: ROOM_ID,
        });

        conn.addEventListener('open', () => {
            console.log('Connected to PartyKit!');
            setConnectionStatus('connected');
        });

        conn.addEventListener('close', () => {
            console.log('Disconnected from PartyKit');
            setConnectionStatus('disconnected');
        });

        conn.addEventListener('message', (event) => {
            try {
                const msg = JSON.parse(event.data) as DemoMessage;
                if (msg.type === 'sync') {
                    setGameState(msg.state);
                }
            } catch (e) {
                console.error('Failed to parse message:', e);
            }
        });

        setSocket(conn);

        return () => {
            conn.close();
        };
    }, []);

    const sendMessage = useCallback(
        (message: DemoMessage) => {
            if (socket) {
                socket.send(JSON.stringify(message));
            }
        },
        [socket]
    );

    const increment = () => sendMessage({ type: 'increment' });
    const decrement = () => sendMessage({ type: 'decrement' });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        🎮 Demo Game
                    </h1>
                    <p className="text-purple-200 text-sm">
                        Testing PartyKit + Next.js Integration
                    </p>
                </div>

                {/* Connection Status */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div
                        className={`w-3 h-3 rounded-full ${connectionStatus === 'connected'
                            ? 'bg-green-400 animate-pulse'
                            : connectionStatus === 'connecting'
                                ? 'bg-yellow-400 animate-pulse'
                                : 'bg-red-400'
                            }`}
                    />
                    <span className="text-white/80 text-sm capitalize">
                        {connectionStatus}
                    </span>
                </div>

                {gameState ? (
                    <>
                        {/* Counter Display */}
                        <div className="bg-black/30 rounded-2xl p-8 mb-6">
                            <div className="text-7xl font-bold text-white text-center tabular-nums">
                                {gameState.counter}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={decrement}
                                className="flex-1 bg-red-500/80 hover:bg-red-500 text-white text-4xl font-bold py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                            >
                                −
                            </button>
                            <button
                                onClick={increment}
                                className="flex-1 bg-green-500/80 hover:bg-green-500 text-white text-4xl font-bold py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                            >
                                +
                            </button>
                        </div>

                        {/* Players Info */}
                        <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-purple-200 text-sm text-center">
                                <span className="font-semibold text-white">
                                    {gameState.connectedPlayers.length}
                                </span>{' '}
                                player
                                {gameState.connectedPlayers.length !== 1
                                    ? 's'
                                    : ''}{' '}
                                connected
                            </p>
                            <p className="text-purple-300/60 text-xs text-center mt-1">
                                Room: {ROOM_ID}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-white/60 py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4" />
                        Connecting to server...
                    </div>
                )}

                {/* Back Link */}
                <a
                    href="/"
                    className="block text-center text-purple-300 hover:text-white text-sm mt-6 transition-colors"
                >
                    ← Back to Home
                </a>
            </div>
        </div>
    );
}
