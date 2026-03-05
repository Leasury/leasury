'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePartyRoom } from '@/hooks/usePartyRoom';
import MindshotHost from '@/components/games/mindshot/MindshotHost';
import type { MindshotGameState } from '@lesury/game-logic';
import { generateRoomCode } from '@lesury/game-logic';

function MindshotHostContent() {
    const searchParams = useSearchParams();
    const roomParam = searchParams.get('room');

    // Self-create a room if no ?room param (direct navigation from landing page)
    const [roomCode] = useState(() => roomParam || generateRoomCode());

    // Update URL to include room code for sharing/refreshing
    useEffect(() => {
        if (!roomParam && roomCode) {
            window.history.replaceState({}, '', `/games/mindshot/host?room=${roomCode}`);
        }
    }, [roomParam, roomCode]);

    const { roomState, gameState, socket } = usePartyRoom<MindshotGameState>(roomCode, {
        asHost: true,
        gameType: 'mindshot',
    });

    if (!roomState || !gameState) {
        return (
            <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
            </div>
        );
    }

    return <MindshotHost state={{ room: roomState, game: gameState }} socket={socket} />;
}

export default function MindshotHostPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#2A2A2A]" />}>
            <MindshotHostContent />
        </Suspense>
    );
}
