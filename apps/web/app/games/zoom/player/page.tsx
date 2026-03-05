'use client';

import { Suspense } from 'react';
import RoomPlayer from '@/components/room/RoomPlayer';
import ZoomPlayer from '@/components/games/zoom/ZoomPlayer';
import type { ZoomGameState } from '@lesury/game-logic';

export default function ZoomPlayerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#1A1A1A]" />}>
            <RoomPlayer gameType="zoom">
                {({ room, game, myPlayerId }) => (
                    <ZoomPlayer
                        state={{ room, game: game as ZoomGameState }}
                        myPlayerId={myPlayerId}
                    />
                )}
            </RoomPlayer>
        </Suspense>
    );
}
