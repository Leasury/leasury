import type {
    CellStatus,
    HexCoord,
    HexDirection,
    MindshotFrame,
    MindshotGameState,
    MindshotMessage,
    MindshotPlan,
    MindshotPlayer,
} from './types';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Hex radius: cells satisfy max(|q|, |r|, |q+r|) ≤ MINDSHOT_RADIUS */
export const MINDSHOT_RADIUS = 4;

/** Total cells in the grid: 3*5² - 3*5 + 1 = 61 */
export const MINDSHOT_TOTAL_CELLS = 61;

export const MINDSHOT_START_HP = 3;

/** Warning cells added to the outer ring per round (≈ same proportion as original 9/100) */
export const MINDSHOT_SHRINK_COUNT = 6;

/** Direction vectors for flat-top axial hex grid */
export const HEX_DIRECTIONS: Record<HexDirection, HexCoord> = {
    E:  { q:  1, r:  0 },
    NE: { q:  1, r: -1 },
    NW: { q:  0, r: -1 },
    W:  { q: -1, r:  0 },
    SW: { q: -1, r:  1 },
    SE: { q:  0, r:  1 },
};

/** Player color palette (Lesury design system) */
export const PLAYER_COLORS = ['#D97757', '#6A9BCC', '#788C5D', '#CC785C'];

// ─── Hex Math Helpers ────────────────────────────────────────────────────────

export function hexKey(coord: HexCoord): string {
    return `${coord.q},${coord.r}`;
}

export function hexFromKey(key: string): HexCoord {
    const [q, r] = key.split(',').map(Number);
    return { q, r };
}

/** Distance from center (ring 0) — max of the three cubic coordinates */
export function hexRing(coord: HexCoord): number {
    return Math.max(Math.abs(coord.q), Math.abs(coord.r), Math.abs(coord.q + coord.r));
}

export function isValidHex(coord: HexCoord): boolean {
    return hexRing(coord) <= MINDSHOT_RADIUS;
}

export function hexNeighbor(coord: HexCoord, dir: HexDirection): HexCoord {
    const d = HEX_DIRECTIONS[dir];
    return { q: coord.q + d.q, r: coord.r + d.r };
}

/** Generate all 61 hex cells for the grid */
export function generateHexGrid(): HexCoord[] {
    const cells: HexCoord[] = [];
    for (let q = -MINDSHOT_RADIUS; q <= MINDSHOT_RADIUS; q++) {
        for (let r = -MINDSHOT_RADIUS; r <= MINDSHOT_RADIUS; r++) {
            if (Math.abs(q + r) <= MINDSHOT_RADIUS) {
                cells.push({ q, r });
            }
        }
    }
    return cells;
}

/** Return all normal cells at the given ring */
export function getNormalCellsAtRing(
    cells: Record<string, CellStatus>,
    ring: number
): HexCoord[] {
    return generateHexGrid().filter(
        (c) => hexRing(c) === ring && cells[hexKey(c)] === 'normal'
    );
}

// ─── Initial State ───────────────────────────────────────────────────────────

export function createInitialMindshotState(playerIds: string[]): MindshotGameState {
    const allCells = generateHexGrid();

    const cells: Record<string, CellStatus> = {};
    for (const cell of allCells) {
        cells[hexKey(cell)] = 'normal';
    }

    // Place players in rings 1-2 (away from center and outer border)
    const startingCells = allCells.filter((c) => {
        const ring = hexRing(c);
        return ring >= 1 && ring <= 2;
    });
    const shuffledStarts = shuffleArray([...startingCells]);

    const players: Record<string, MindshotPlayer> = {};
    playerIds.forEach((id, i) => {
        players[id] = {
            id,
            position: shuffledStarts[i] ?? { q: 0, r: 0 },
            hp: MINDSHOT_START_HP,
            status: 'alive',
            colorIndex: i % PLAYER_COLORS.length,
        };
    });

    const plans: Record<string, MindshotPlan | null> = {};
    playerIds.forEach((id) => {
        plans[id] = null;
    });

    return {
        phase: 'lobby',
        round: 0,
        players,
        cells,
        plans,
        plansRevealed: false,
        frames: [],
        currentFrame: 0,
        winnerId: null,
    };
}

// ─── Main Reducer ────────────────────────────────────────────────────────────

export function applyMindshotMessage(
    state: MindshotGameState,
    msg: MindshotMessage,
    senderId: string
): MindshotGameState {
    switch (msg.type) {
        case 'start_game': {
            if (state.phase !== 'lobby') return state;
            return { ...state, phase: 'planning', round: 1 };
        }

        case 'submit_plan': {
            if (state.phase !== 'planning') return state;
            if (state.players[senderId]?.status !== 'alive') return state;

            const plans = { ...state.plans, [senderId]: msg.plan };

            // Check if all alive players have submitted
            const alivePlayers = Object.values(state.players).filter(
                (p) => p.status === 'alive'
            );
            const allSubmitted = alivePlayers.every((p) => plans[p.id] !== null);

            if (!allSubmitted) {
                return { ...state, plans };
            }

            // All submitted → resolve the round into animation frames
            return resolveRound({ ...state, plans, plansRevealed: true });
        }

        case 'next_frame': {
            if (state.phase !== 'resolving') return state;
            const nextFrame = state.currentFrame + 1;
            if (nextFrame >= state.frames.length) {
                return startNextRound(state);
            }
            return { ...state, currentFrame: nextFrame };
        }

        case 'play_again': {
            return createInitialMindshotState(Object.keys(state.players));
        }

        default:
            return state;
    }
}

// ─── Round Resolution ────────────────────────────────────────────────────────

function resolveRound(state: MindshotGameState): MindshotGameState {
    const frames: MindshotFrame[] = [];
    let players = clonePlayers(state.players);
    let cells = { ...state.cells };

    // ── Phase 1: Movement (2 steps each) ─────────────────────────────────────
    for (let step = 0; step < 2; step++) {
        const alivePlayers = Object.values(players).filter((p) => p.status === 'alive');

        // Compute intended new positions
        const newPositions: Record<string, HexCoord> = {};
        for (const player of alivePlayers) {
            const plan = state.plans[player.id];
            if (!plan) continue;
            const dir = plan.moves[step];
            const neighbor = hexNeighbor(player.position, dir);
            // Clamp at border: if destination is invalid, player stays
            newPositions[player.id] = isValidHex(neighbor) ? neighbor : player.position;
        }

        // Detect collisions: if two or more players target the same cell, none move there
        const targetCount: Record<string, number> = {};
        for (const pos of Object.values(newPositions)) {
            const k = hexKey(pos);
            targetCount[k] = (targetCount[k] ?? 0) + 1;
        }

        // Apply positions (blocked players stay)
        for (const player of alivePlayers) {
            const target = newPositions[player.id];
            if (!target) continue;
            const finalPos =
                targetCount[hexKey(target)] > 1 ? player.position : target;
            players = {
                ...players,
                [player.id]: { ...player, position: finalPos },
            };
            frames.push({
                players: clonePlayers(players),
                cells: { ...cells },
                event: { kind: 'move_step', playerId: player.id, to: finalPos },
            });
        }
    }

    // ── Phase 2: Shooting ─────────────────────────────────────────────────────
    const aliveBeforeShoot = Object.values(players).filter((p) => p.status === 'alive');

    // Snapshot positions for hit detection (simultaneous shots)
    const positionSnapshot = new Map<string, string>(); // hexKey → playerId
    for (const p of aliveBeforeShoot) {
        positionSnapshot.set(hexKey(p.position), p.id);
    }

    for (const shooter of aliveBeforeShoot) {
        const plan = state.plans[shooter.id];
        if (!plan) continue;
        const dir = plan.shootDirection;

        // Trace projectile along direction until border or player hit
        let pos = shooter.position;
        let hitPlayerId: string | null = null;
        for (let i = 0; i < MINDSHOT_RADIUS * 2; i++) {
            pos = hexNeighbor(pos, dir);
            if (!isValidHex(pos)) break;
            const occupantId = positionSnapshot.get(hexKey(pos));
            if (occupantId && occupantId !== shooter.id) {
                hitPlayerId = occupantId;
                break;
            }
        }

        if (hitPlayerId) {
            const target = players[hitPlayerId];
            players = {
                ...players,
                [hitPlayerId]: { ...target, hp: target.hp - 1 },
            };
        }

        frames.push({
            players: clonePlayers(players),
            cells: { ...cells },
            event: { kind: 'shoot', shooterId: shooter.id, direction: dir, hitPlayerId },
        });
    }

    // ── Phase 3: Zone Update ──────────────────────────────────────────────────
    const newCells: Record<string, CellStatus> = { ...cells };

    // Promote existing warning → danger
    for (const key of Object.keys(newCells)) {
        if (newCells[key] === 'warning') newCells[key] = 'danger';
    }

    // Pick SHRINK_COUNT normal cells from outermost available ring
    let ring = MINDSHOT_RADIUS;
    while (ring >= 0) {
        const candidates = getNormalCellsAtRing(newCells, ring);
        if (candidates.length > 0) {
            const picked = shuffleArray(candidates).slice(0, MINDSHOT_SHRINK_COUNT);
            for (const cell of picked) newCells[hexKey(cell)] = 'warning';
            break;
        }
        ring--;
    }
    cells = newCells;

    frames.push({
        players: clonePlayers(players),
        cells: { ...cells },
        event: { kind: 'zone_update' },
    });

    // ── Phase 4: Danger Zone Damage ───────────────────────────────────────────
    const damagedPlayerIds: string[] = [];
    for (const player of Object.values(players).filter((p) => p.status === 'alive')) {
        if (cells[hexKey(player.position)] === 'danger') {
            players = {
                ...players,
                [player.id]: { ...player, hp: player.hp - 1 },
            };
            damagedPlayerIds.push(player.id);
        }
    }
    if (damagedPlayerIds.length > 0) {
        frames.push({
            players: clonePlayers(players),
            cells: { ...cells },
            event: { kind: 'damage', damagedPlayerIds },
        });
    }

    // ── Phase 5: Elimination ──────────────────────────────────────────────────
    const eliminatedPlayerIds: string[] = [];
    for (const player of Object.values(players).filter((p) => p.status === 'alive')) {
        if (player.hp <= 0) {
            players = {
                ...players,
                [player.id]: { ...player, status: 'eliminated' },
            };
            eliminatedPlayerIds.push(player.id);
        }
    }
    if (eliminatedPlayerIds.length > 0) {
        frames.push({
            players: clonePlayers(players),
            cells: { ...cells },
            event: { kind: 'elimination', eliminatedPlayerIds },
        });
    }

    // ── Win condition ─────────────────────────────────────────────────────────
    const survivors = Object.values(players).filter((p) => p.status === 'alive');
    const winnerId = survivors.length === 1 ? survivors[0].id : null;

    return {
        ...state,
        phase: 'resolving',
        players,
        cells,
        plansRevealed: true,
        frames,
        currentFrame: 0,
        winnerId,
    };
}

function startNextRound(state: MindshotGameState): MindshotGameState {
    const survivors = Object.values(state.players).filter((p) => p.status === 'alive');

    if (survivors.length <= 1 || state.winnerId !== null) {
        return { ...state, phase: 'game_over' };
    }

    const plans: Record<string, MindshotPlan | null> = {};
    Object.keys(state.players).forEach((id) => {
        plans[id] = null;
    });

    return {
        ...state,
        phase: 'planning',
        round: state.round + 1,
        plans,
        plansRevealed: false,
        frames: [],
        currentFrame: 0,
    };
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function clonePlayers(
    players: Record<string, MindshotPlayer>
): Record<string, MindshotPlayer> {
    return JSON.parse(JSON.stringify(players));
}

function shuffleArray<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
