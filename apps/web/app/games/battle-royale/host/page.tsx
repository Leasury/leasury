'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePartyRoom } from '@/hooks/usePartyRoom';
import BattleRoyaleHost from '@/components/games/battle-royale/BattleRoyaleHost';
import type { BattleRoyaleGameState } from '@lesury/game-logic';
import { generateRoomCode } from '@lesury/game-logic';

function BattleRoyaleHostContent() {
    const searchParams = useSearchParams();
    const roomParam = searchParams.get('room');

    const [roomCode] = useState(() => roomParam || generateRoomCode());

    useEffect(() => {
        if (!roomParam && roomCode) {
            window.history.replaceState({}, '', `/games/battle-royale/host?room=${roomCode}`);
        }
    }, [roomParam, roomCode]);

    const { roomState, gameState, socket } = usePartyRoom<BattleRoyaleGameState>(roomCode, {
        asHost: true,
        gameType: 'battle-royale',
    });

    if (!roomState || !gameState || roomState.gameType !== 'battle-royale') {
        return (
            <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
            </div>
        );
    }

    return <BattleRoyaleHost state={{ room: roomState, game: gameState }} socket={socket} />;
}

export default function BattleRoyaleHostPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#2A2A2A]" />}>
            <BattleRoyaleHostContent />
        </Suspense>
    );
}
