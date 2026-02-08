import type * as Party from 'partykit/server';
import {
    createInitialDemoState,
    type DemoGameState,
    type DemoMessage,
} from '@leasury/game-logic';

export default class Server implements Party.Server {
    state: DemoGameState;

    constructor(readonly room: Party.Room) {
        this.state = createInitialDemoState();
    }

    onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
        console.log(
            `Connected: id=${conn.id} room=${this.room.id} url=${new URL(ctx.request.url).pathname}`
        );

        // Add player to connected list
        if (!this.state.connectedPlayers.includes(conn.id)) {
            this.state.connectedPlayers.push(conn.id);
        }

        // Send current state to new connection
        const syncMessage: DemoMessage = { type: 'sync', state: this.state };
        conn.send(JSON.stringify(syncMessage));

        // Broadcast updated player list to all clients
        this.broadcastState();
    }

    onClose(conn: Party.Connection) {
        console.log(`Disconnected: id=${conn.id}`);

        // Remove player from connected list
        this.state.connectedPlayers = this.state.connectedPlayers.filter(
            (id) => id !== conn.id
        );

        // Broadcast updated player list
        this.broadcastState();
    }

    onMessage(message: string, sender: Party.Connection) {
        console.log(`Message from ${sender.id}: ${message}`);

        try {
            const msg = JSON.parse(message) as DemoMessage;

            switch (msg.type) {
                case 'increment':
                    this.state.counter += 1;
                    break;
                case 'decrement':
                    this.state.counter -= 1;
                    break;
            }

            // Broadcast new state to all clients
            this.broadcastState();
        } catch (e) {
            console.error('Failed to parse message:', e);
        }
    }

    broadcastState() {
        const syncMessage: DemoMessage = { type: 'sync', state: this.state };
        this.room.broadcast(JSON.stringify(syncMessage));
    }
}

Server satisfies Party.Worker;
