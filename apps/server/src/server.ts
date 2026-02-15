import type * as Party from 'partykit/server';
import {
    RoomState,
    RoomMessage,
    Player,
    generateRoomCode,
    createInitialDemoState,
    applyDemoMessage,
    DemoGameState,
    DemoGameMessage,
} from '@leasury/game-logic';

/**
 * Combined state for room + game
 */
interface ServerState {
    room: RoomState;
    game: DemoGameState; // This will be dynamic per game type
}

export default class Server implements Party.Server {
    state: ServerState;

    constructor(readonly room: Party.Room) {
        // Initialize with room code from room.id
        this.state = {
            room: {
                roomCode: room.id.toUpperCase(),
                hostId: '',
                players: [],
                status: 'waiting',
                gameType: 'demo', // TODO: Get from query param
            },
            game: createInitialDemoState(),
        };
    }

    onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
        console.log(
            `Connected: id=${conn.id} room=${this.room.id} url=${new URL(ctx.request.url).pathname}`
        );

        // First connection becomes host
        if (!this.state.room.hostId) {
            this.state.room.hostId = conn.id;
        }

        // Send current state to new connection
        this.syncToConnection(conn);
    }

    onClose(conn: Party.Connection) {
        console.log(`Disconnected: id=${conn.id}`);

        // Remove player from list
        this.state.room.players = this.state.room.players.filter(
            (p) => p.id !== conn.id
        );

        // Broadcast updated state
        this.broadcastState();
    }

    onMessage(message: string, sender: Party.Connection) {
        console.log(`Message from ${sender.id}: ${message}`);

        try {
            const msg = JSON.parse(message);

            // Handle room messages
            if (this.isRoomMessage(msg)) {
                this.handleRoomMessage(msg, sender);
                return;
            }

            // Handle game-specific messages
            if (this.isDemoMessage(msg)) {
                this.handleDemoMessage(msg);
                return;
            }
        } catch (e) {
            console.error('Failed to parse message:', e);
        }
    }

    // Room message handling
    isRoomMessage(msg: any): msg is RoomMessage {
        return ['join', 'leave', 'start', 'sync'].includes(msg.type);
    }

    handleRoomMessage(msg: RoomMessage, sender: Party.Connection) {
        switch (msg.type) {
            case 'join':
                this.addPlayer(sender.id, msg.playerName);
                break;
            case 'leave':
                this.removePlayer(sender.id);
                break;
            case 'start':
                if (sender.id === this.state.room.hostId) {
                    this.state.room.status = 'playing';
                    this.broadcastState();
                }
                break;
        }
    }

    addPlayer(id: string, name: string) {
        // Don't add if already exists
        if (this.state.room.players.some((p) => p.id === id)) {
            return;
        }

        const player: Player = {
            id,
            name,
            isHost: id === this.state.room.hostId,
            joinedAt: Date.now(),
        };

        this.state.room.players.push(player);
        this.broadcastState();
    }

    removePlayer(id: string) {
        this.state.room.players = this.state.room.players.filter(
            (p) => p.id !== id
        );
        this.broadcastState();
    }

    // Demo game message handling
    isDemoMessage(msg: any): msg is DemoGameMessage {
        return ['increment', 'decrement'].includes(msg.type);
    }

    handleDemoMessage(msg: DemoGameMessage) {
        // Only allow game messages when playing
        if (this.state.room.status !== 'playing') {
            return;
        }

        this.state.game = applyDemoMessage(this.state.game, msg);
        this.broadcastState();
    }

    // State sync
    syncToConnection(conn: Party.Connection) {
        conn.send(JSON.stringify({
            type: 'sync',
            room: this.state.room,
            game: this.state.game,
        }));
    }

    broadcastState() {
        this.room.broadcast(JSON.stringify({
            type: 'sync',
            room: this.state.room,
            game: this.state.game,
        }));
    }
}

Server satisfies Party.Worker;
