/**
 * Timeline Game Types
 * Chronological event placement game
 */

export type EventCategory =
    | 'time'        // Year (e.g., 1969)
    | 'population'  // Number of people
    | 'area'        // Square kilometers
    | 'speed'       // km/h
    | 'length'      // meters
    | 'duration'    // seconds/minutes
    | 'weight'      // kilograms
    | 'temperature' // Celsius
    | 'calories'    // kcal
    | 'lifespan'    // years
    | 'timezone';   // UTC offset

export interface TimelineEvent {
    id: string;
    title: string;
    category: EventCategory;
    value: number;        // The actual year/value to compare
    unit?: string;        // Display unit (e.g., "km/h", "°C")
    imageUrl?: string;    // Optional image
    description?: string; // Additional context
}

export interface PlacedEvent extends TimelineEvent {
    placedBy: string;     // Player ID
    wasCorrect: boolean;  // Was placement correct?
}

export type GameMode = 'coop' | 'competitive';

export interface TimelineGameState {
    mode: GameMode;

    // Timeline (always sorted by value)
    placedEvents: PlacedEvent[];

    // Current turn
    activePlayerId: string;
    activeEvent: TimelineEvent | null;
    proposedPosition: number;  // Index where player wants to place (0 = leftmost)

    // Co-op scoring
    lives: number;             // Hearts remaining
    cardsPlaced: number;       // Successfully placed
    cardsGoal: number;         // Win condition

    // Competitive scoring
    playerScores: Record<string, number>;

    // Game flow
    status: 'waiting' | 'placing' | 'revealing' | 'nextTurn' | 'gameOver';
    winner?: string | 'team';

    // Event deck
    remainingEvents: TimelineEvent[];
    usedEventIds: string[];
}

export type TimelineMessage =
    | { type: 'startGame'; mode: GameMode; cardsGoal?: number }
    | { type: 'moveCard'; direction: 'left' | 'right' }
    | { type: 'setPosition'; position: number }
    | { type: 'placeCard' }
    | { type: 'nextTurn' }
    | { type: 'sync'; state: TimelineGameState };
