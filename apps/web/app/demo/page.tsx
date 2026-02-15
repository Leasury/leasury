'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PartySocket from 'partysocket';
import type { DemoGameState, DemoMessage } from '@leasury/game-logic';

const PARTYKIT_HOST =
    process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

// Generate a random 6-character room code
function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar chars
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

function DemoPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomFromUrl = searchParams.get('room');

    const [mode, setMode] = useState<'landing' | 'join' | 'in-room'>(
        roomFromUrl ? 'in-room' : 'landing'
    );
    const [roomCode, setRoomCode] = useState(roomFromUrl || '');
    const [inputCode, setInputCode] = useState('');
    const [gameState, setGameState] = useState<DemoGameState | null>(null);
    const [socket, setSocket] = useState<PartySocket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<
        'connecting' | 'connected' | 'disconnected'
    >('connecting');
    const [copied, setCopied] = useState(false);

    // Connect to room when in-room mode
    useEffect(() => {
        if (mode !== 'in-room' || !roomCode) return;

        const conn = new PartySocket({
            host: PARTYKIT_HOST,
            room: roomCode.toLowerCase(),
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
    }, [mode, roomCode]);

    const sendMessage = useCallback(
        (message: DemoMessage) => {
            if (socket) {
                socket.send(JSON.stringify(message));
            }
        },
        [socket]
    );

    const createRoom = () => {
        const code = generateRoomCode();
        setRoomCode(code);
        setMode('in-room');
        router.push(`/demo?room=${code}`);
    };

    const joinRoom = () => {
        if (inputCode.trim()) {
            const code = inputCode.trim().toUpperCase();
            setRoomCode(code);
            setMode('in-room');
            router.push(`/demo?room=${code}`);
        }
    };

    const copyRoomLink = async () => {
        const url = `${window.location.origin}/demo?room=${roomCode}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const increment = () => sendMessage({ type: 'increment' });
    const decrement = () => sendMessage({ type: 'decrement' });

    // Landing Screen
    if (mode === 'landing') {
        return (
            <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#E8E6DC] max-w-md w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#141413] mb-2">
                            🎮 Demo Game
                        </h1>
                        <p className="text-[#B0AEA5] text-sm">
                            Test real-time sync across devices
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={createRoom}
                            className="w-full bg-[#141413] hover:bg-[#2a2a28] text-white font-semibold py-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                            🎲 Create New Room
                        </button>

                        <button
                            onClick={() => setMode('join')}
                            className="w-full bg-[#F0EFEA] hover:bg-[#E8E6DC] text-[#141413] font-semibold py-4 rounded-xl transition-all duration-200 hover:scale-105 border border-[#E8E6DC]"
                        >
                            🔗 Join Existing Room
                        </button>
                    </div>

                    <a
                        href="/"
                        className="block text-center text-[#B0AEA5] hover:text-[#141413] text-sm mt-8 transition-colors"
                    >
                        ← Back to Home
                    </a>
                </div>
            </div>
        );
    }

    // Join Room Screen
    if (mode === 'join') {
        return (
            <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#E8E6DC] max-w-md w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#141413] mb-2">
                            🔗 Join Room
                        </h1>
                        <p className="text-[#B0AEA5] text-sm">
                            Enter the room code to connect
                        </p>
                    </div>

                    <div className="space-y-4">
                        <input
                            type="text"
                            value={inputCode}
                            onChange={(e) =>
                                setInputCode(e.target.value.toUpperCase())
                            }
                            placeholder="ABC123"
                            maxLength={6}
                            className="w-full bg-[#F0EFEA] text-[#141413] text-2xl font-bold text-center py-4 rounded-xl border border-[#E8E6DC] focus:border-[#D97757] focus:outline-none focus:ring-2 focus:ring-[#D97757]/20 placeholder-[#B0AEA5]"
                        />

                        <button
                            onClick={joinRoom}
                            disabled={inputCode.trim().length < 4}
                            className="w-full bg-[#141413] hover:bg-[#2a2a28] disabled:bg-[#B0AEA5] disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg"
                        >
                            Join Room
                        </button>

                        <button
                            onClick={() => setMode('landing')}
                            className="w-full bg-[#F0EFEA] hover:bg-[#E8E6DC] text-[#141413] font-semibold py-3 rounded-xl transition-all duration-200"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // In Room Screen
    return (
        <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#E8E6DC] max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-[#141413] mb-2">
                        🎮 Demo Game
                    </h1>
                    <p className="text-[#B0AEA5] text-sm">
                        Testing PartyKit + Next.js Integration
                    </p>
                </div>

                {/* Room Code Display */}
                <div className="bg-[#F0EFEA] rounded-xl p-4 mb-6">
                    <p className="text-[#B0AEA5] text-xs text-center mb-2">
                        Room Code
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white rounded-lg py-3 px-4 text-center border border-[#E8E6DC]">
                            <span className="text-[#141413] text-2xl font-bold tracking-wider">
                                {roomCode}
                            </span>
                        </div>
                        <button
                            onClick={copyRoomLink}
                            className="bg-[#D97757] hover:bg-[#CC785C] text-white px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                            title="Copy room link"
                        >
                            {copied ? '✓' : '📋'}
                        </button>
                    </div>
                    <p className="text-[#B0AEA5] text-xs text-center mt-2">
                        Share this code to invite others
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
                    <span className="text-[#141413] text-sm capitalize">
                        {connectionStatus}
                    </span>
                </div>

                {gameState ? (
                    <>
                        {/* Counter Display */}
                        <div className="bg-[#F0EFEA] rounded-2xl p-8 mb-6">
                            <div className="text-7xl font-bold text-[#141413] text-center tabular-nums">
                                {gameState.counter}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={decrement}
                                className="flex-1 bg-[#141413] hover:bg-[#2a2a28] text-white text-4xl font-bold py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                            >
                                −
                            </button>
                            <button
                                onClick={increment}
                                className="flex-1 bg-[#D97757] hover:bg-[#CC785C] text-white text-4xl font-bold py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                            >
                                +
                            </button>
                        </div>

                        {/* Players Info */}
                        <div className="bg-[#F0EFEA] rounded-xl p-4">
                            <p className="text-[#B0AEA5] text-sm text-center">
                                <span className="font-semibold text-[#141413]">
                                    {gameState.connectedPlayers.length}
                                </span>{' '}
                                player
                                {gameState.connectedPlayers.length !== 1
                                    ? 's'
                                    : ''}{' '}
                                connected
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-[#B0AEA5] py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-[#E8E6DC] border-t-[#141413] rounded-full mx-auto mb-4" />
                        Connecting to server...
                    </div>
                )}

                {/* Back Link */}
                <a
                    href="/demo"
                    onClick={(e) => {
                        e.preventDefault();
                        setMode('landing');
                        setRoomCode('');
                        setInputCode('');
                        router.push('/demo');
                    }}
                    className="block text-center text-[#B0AEA5] hover:text-[#141413] text-sm mt-6 transition-colors"
                >
                    ← Leave Room
                </a>
            </div>
        </div>
    );
}

// Wrap in Suspense to satisfy Next.js requirements for useSearchParams
export default function DemoPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-[#E8E6DC] border-t-[#141413] rounded-full" />
                </div>
            }
        >
            <DemoPageContent />
        </Suspense>
    );
}
