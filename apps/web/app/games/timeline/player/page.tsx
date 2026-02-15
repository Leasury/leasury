'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PartySocket from 'partysocket';
import TimelinePlayer from '@/components/games/timeline/TimelinePlayer';
import type { RoomState, TimelineGameState } from '@leasury/game-logic';

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

function TimelinePlayerContent() {
    const searchParams = useSearchParams();
    const roomCode = searchParams.get('room');

    const [roomState, setRoomState] = useState<RoomState | null>(null);
    const [gameState, setGameState] = useState<TimelineGameState | null>(null);
    const [socket, setSocket] = useState<PartySocket | null>(null);
    const [playerName, setPlayerName] = useState('Player');

    useEffect(() => {
        if (!roomCode) {
            window.location.href = '/join';
            return;
        }

        const conn = new PartySocket({
            host: PARTYKIT_HOST,
            room: roomCode.toLowerCase(),
        });

        conn.addEventListener('open', () => {
            conn.send(JSON.stringify({
                type: 'join',
                playerName: playerName
            }));
        });

        conn.addEventListener('message', (evt) => {
            try {
                const data = JSON.parse(evt.data as string);
                if (data.type === 'sync') {
                    setRoomState(data.room);
                    setGameState(data.game);
                }
            } catch (e) {
                console.error('Failed to parse message:', e);
            }
        });

        setSocket(conn);
        (window as any).__partySocket = conn;

        return () => {
            conn.close();
            delete (window as any).__partySocket;
        };
    }, [roomCode, playerName]);

    if (!roomState || !gameState) {
        return (
            <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#E8E6DC] border-t-white rounded-full" />
            </div>
        );
    }

    return <TimelinePlayer state={{ room: roomState, game: gameState }} />;
}

export default function TimelinePlayerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#2A2A2A]" />}>
            <TimelinePlayerContent />
        </Suspense>
    );
}
