'use client';

import { Suspense } from 'react';
import RoomPlayer from '@/components/room/RoomPlayer';

function JoinContent() {
    return (
        <RoomPlayer
            gameType="unknown"
            onGameStart={(roomState) => {
                // Redirect to actual game player view
                window.location.href = `/games/${roomState.gameType}/player?room=${roomState.roomCode}`;
            }}
        >
            {() => null}
        </RoomPlayer>
    );
}

export default function JoinPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#E8E6DC] border-t-[#141413] rounded-full" />
            </div>
        }>
            <JoinContent />
        </Suspense>
    );
}
