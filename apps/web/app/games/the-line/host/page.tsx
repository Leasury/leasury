'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePartyRoom } from '@/hooks/usePartyRoom';
import TheLineHost from '@/components/games/the-line/TheLineHost';
import type { TheLineGameState } from '@lesury/game-logic';

function TheLineHostContent() {
    const searchParams = useSearchParams();
    const roomCode = searchParams.get('room');

    const { roomState, gameState } = usePartyRoom<TheLineGameState>(roomCode, {
        asHost: true,
        gameType: 'the-line',
    });

    if (!roomCode) {
        if (typeof window !== 'undefined') window.location.href = '/games/the-line';
        return null;
    }

    if (!roomState || !gameState) {
        return (
            <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#E8E6DC] border-t-white rounded-full" />
            </div>
        );
    }

    return <TheLineHost state={{ room: roomState, game: gameState }} />;
}

export default function TheLineHostPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#2A2A2A]" />}>
            <TheLineHostContent />
        </Suspense>
    );
}
