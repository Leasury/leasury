'use client';

import { Suspense, useEffect } from 'react';
import RoomHost from '@/components/room/RoomHost';
import DemoHost from '@/components/games/demo/DemoHost';

function DemoHostContent() {
    // Store socket globally for child components to access
    useEffect(() => {
        return () => {
            delete (window as any).__partySocket;
        };
    }, []);

    return (
        <RoomHost gameType="demo">
            {(state) => {
                // Make socket available globally (simple approach)
                // In production, use React Context
                return <DemoHost state={state} />;
            }}
        </RoomHost>
    );
}

export default function DemoHostPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DemoHostContent />
        </Suspense>
    );
}
