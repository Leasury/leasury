'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PartySocket from 'partysocket';
import DemoHost from '@/components/games/demo/DemoHost';
import type { RoomState, DemoGameState } from '@leasury/game-logic';

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

function DemoHostContent() {
    const searchParams = useSearchParams();
    const roomCode = searchParams.get('room');

    const [roomState, setRoomState] = useState<RoomState | null>(null);
    const [gameState, setGameState] = useState<DemoGameState | null>(null);
    const [socket, setSocket] = useState<PartySocket | null>(null);

    useEffect(() => {
        if (!roomCode) {
            // Redirect to demo landing if no room code
            window.location.href = '/games/demo';
            return;
        }

        // Connect to existing room
        const conn = new PartySocket({
            host: PARTYKIT_HOST,
            room: roomCode.toLowerCase(),
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
        // Make socket available for child components
        (window as any).__partySocket = conn;

        return () => {
            conn.close();
            delete (window as any).__partySocket;
        };
    }, [roomCode]);

    if (!roomState || !gameState) {
        return (
            <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#E8E6DC] border-t-[#141413] rounded-full" />
            </div>
        );
    }

    return <DemoHost state={{ room: roomState, game: gameState }} />;
}

export default function DemoHostPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FAF9F5]" />}>
            <DemoHostContent />
        </Suspense>
    );
}
