import type * as Party from 'partykit/server';
import {
    type RoomState,
    type RoomMessage,
    type Player,
    // Demo
    createInitialDemoState,
    applyDemoMessage,
    type DemoGameState,
    type DemoGameMessage,
    // Timeline
    createInitialTimelineState,
    applyTimelineMessage,
    dealNextEvent,
    type TimelineGameState,
    type TimelineMessage,
} from '@leasury/game-logic';

/**
 * Combined state for room + game
 */
interface ServerState {
    room: RoomState;
    game: DemoGameState | TimelineGameState;
}

export default class Server implements Party.Server {
    state: ServerState;
    gameInitialized: boolean = false;

    constructor(readonly room: Party.Room) {
        // Initialize with room code from room.id
        this.state = {
            room: {
                roomCode: room.id.toUpperCase(),
                hostId: '',
                players: [],
                status: 'waiting',
                gameType: 'demo', // Default, will be updated
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

            // Handle game-specific messages based on game type
            if (this.state.room.gameType === 'demo' && this.isDemoMessage(msg)) {
                this.handleDemoMessage(msg);
                return;
            }

            if (this.state.room.gameType === 'timeline' && this.isTimelineMessage(msg)) {
                this.handleTimelineMessage(msg, sender);
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
                // If this is the first join (host) and game provided, initialize
                if (msg.gameType && !this.gameInitialized) {
                    this.state.room.gameType = msg.gameType;
                    this.gameInitialized = true;

                    console.log(`Initializing game type: ${msg.gameType}`);

                    // Initialize appropriate game state
                    if (msg.gameType === 'timeline') {
                        this.state.game = createInitialTimelineState();
                    } else {
                        this.state.game = createInitialDemoState();
                    }
                }

                this.addPlayer(sender.id, msg.playerName);
                break;
            case 'leave':
                this.removePlayer(sender.id);
                break;
            case 'start':
                if (sender.id === this.state.room.hostId) {
                    this.state.room.status = 'playing';

                    // Initialize game based on type
                    if (this.state.room.gameType === 'timeline') {
                        // Deal first card to first non-host player
                        const firstPlayer = this.state.room.players.find(p => !p.isHost);
                        if (firstPlayer) {
                            this.state.game = dealNextEvent(
                                this.state.game as TimelineGameState,
                                firstPlayer.id
                            );
                        }
                    }

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
        if (this.state.room.status !== 'playing') return;

        this.state.game = applyDemoMessage(this.state.game as DemoGameState, msg);
        this.broadcastState();
    }

    // Timeline game message handling
    isTimelineMessage(msg: any): msg is TimelineMessage {
        return ['startGame', 'moveCard', 'setPosition', 'placeCard', 'nextTurn'].includes(msg.type);
    }

    handleTimelineMessage(msg: TimelineMessage, sender: Party.Connection) {
        if (this.state.room.status !== 'playing') return;

        let gameState = this.state.game as TimelineGameState;

        // Handle next turn - deal new card
        if (msg.type === 'nextTurn') {
            // Find next player in sequence
            const currentIndex = this.state.room.players.findIndex(p => p.id === gameState.activePlayerId);
            const nextIndex = (currentIndex + 1) % this.state.room.players.length;
            const nextPlayer = this.state.room.players[nextIndex];

            if (nextPlayer && !nextPlayer.isHost) {
                gameState = dealNextEvent(gameState, nextPlayer.id);
            }
        } else {
            gameState = applyTimelineMessage(gameState, msg);
        }

        this.state.game = gameState;
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
