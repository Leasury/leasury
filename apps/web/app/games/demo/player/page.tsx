'use client';

import { Suspense, useEffect } from 'react';
import RoomPlayer from '@/components/room/RoomPlayer';
import DemoPlayer from '@/components/games/demo/DemoPlayer';

function DemoPlayerContent() {
    // Store socket globally for child components to access
    useEffect(() => {
        return () => {
            delete (window as any).__partySocket;
        };
    }, []);

    return (
        <RoomPlayer gameType="demo">
            {(state) => <DemoPlayer state={state} />}
        </RoomPlayer>
    );
}

export default function DemoPlayerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DemoPlayerContent />
        </Suspense>
    );
}
