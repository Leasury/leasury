// ─── Hex Coordinates ────────────────────────────────────────────────────────
export interface HexCoord {
    q: number;
    r: number;
}

// 6 directions for flat-top hexagonal grid (axial coordinates)
export type HexDirection = 'E' | 'NE' | 'NW' | 'W' | 'SW' | 'SE';

// ─── Cell State ──────────────────────────────────────────────────────────────
export type CellStatus = 'normal' | 'warning' | 'danger';

// ─── Player ──────────────────────────────────────────────────────────────────
export type MindshotPlayerStatus = 'alive' | 'eliminated';

export interface MindshotPlayer {
    id: string;
    position: HexCoord;
    hp: number;
    status: MindshotPlayerStatus;
    colorIndex: number; // 0–3, maps to PLAYER_COLORS constant
}

// ─── Plan (submitted secretly by each player per round) ─────────────────────
export interface MindshotPlan {
    moves: [HexDirection, HexDirection];
    shootDirection: HexDirection;
}

// ─── Game Phase ──────────────────────────────────────────────────────────────
export type MindshotPhase =
    | 'lobby'
    | 'planning' // Players submitting secret plans on phones
    | 'resolving' // Server has resolved the round, host animates through frames
    | 'game_over';

// ─── Resolution Frame (one step in the animation sequence) ──────────────────
export interface MindshotFrame {
    players: Record<string, MindshotPlayer>;
    cells: Record<string, CellStatus>;
    event: MindshotFrameEvent;
}

export type MindshotFrameEvent =
    | { kind: 'move_step'; playerId: string; to: HexCoord }
    | { kind: 'shoot'; shooterId: string; direction: HexDirection; hitPlayerId: string | null }
    | { kind: 'zone_update' }
    | { kind: 'damage'; damagedPlayerIds: string[] }
    | { kind: 'elimination'; eliminatedPlayerIds: string[] };

// ─── Game State ──────────────────────────────────────────────────────────────
export interface MindshotGameState {
    phase: MindshotPhase;
    round: number;

    /** Player state keyed by playerId */
    players: Record<string, MindshotPlayer>;

    /** Cell status keyed by hexKey e.g. "0,0" or "-1,2" */
    cells: Record<string, CellStatus>;

    /** Plans submitted this round (null = not yet submitted) */
    plans: Record<string, MindshotPlan | null>;
    plansRevealed: boolean;

    /** Resolved animation frames — host steps through these one by one */
    frames: MindshotFrame[];
    currentFrame: number;

    winnerId: string | null;
}

// ─── Messages ────────────────────────────────────────────────────────────────
export type MindshotMessage =
    | { type: 'start_game' }
    | { type: 'submit_plan'; plan: MindshotPlan }
    | { type: 'next_frame' } // host advances animation by one frame
    | { type: 'play_again' };
