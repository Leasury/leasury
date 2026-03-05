'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePartyRoom } from '@/hooks/usePartyRoom';
import MindshotPlayer from '@/components/games/mindshot/MindshotPlayer';
import type { MindshotGameState } from '@lesury/game-logic';

function MindshotPlayerContent() {
    const searchParams = useSearchParams();
    const roomCode = searchParams.get('room');
    const sessionId = searchParams.get('session');

    const { roomState, gameState, myPlayerId } = usePartyRoom<MindshotGameState>(roomCode, {
        sessionKeyPrefix: 'lobby',
    });

    if (!roomCode || !sessionId) {
        if (typeof window !== 'undefined') window.location.href = '/join';
        return null;
    }

    if (!roomState || !gameState) {
        return (
            <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#E8E6DC] border-t-[#141413] rounded-full" />
            </div>
        );
    }

    return (
        <MindshotPlayer
            state={{ room: roomState, game: gameState }}
            myPlayerId={myPlayerId}
        />
    );
}

export default function MindshotPlayerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FAF9F5]" />}>
            <MindshotPlayerContent />
        </Suspense>
    );
}
