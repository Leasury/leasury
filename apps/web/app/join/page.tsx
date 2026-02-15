'use client';

import RoomPlayer from '@/components/room/RoomPlayer';

export default function JoinPage() {
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
