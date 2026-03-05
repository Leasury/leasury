import { describe, it, beforeAll } from 'vitest';
import * as approvals from 'approvals';
import path from 'path';
import {
    generateHexGrid,
    hexRing,
    hexNeighbor,
    isValidHex,
    hexKey,
    createInitialMindshotState,
    applyMindshotMessage,
    MINDSHOT_RADIUS,
    MINDSHOT_TOTAL_CELLS,
    MINDSHOT_START_HP,
    MINDSHOT_SHRINK_COUNT,
    HEX_DIRECTIONS,
} from '../logic';
import type { MindshotGameState, MindshotPlan, HexDirection } from '../types';

const APPROVED_DIR = path.join(__dirname);

beforeAll(() => {
    approvals.configure({ reporters: ['nodediff'] } as any);
});

function approve(testName: string, content: unknown) {
    approvals.verifyAsJSON(APPROVED_DIR, testName, content, {});
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PLAYER_IDS = ['p1', 'p2'];

/** Build a deterministic state with known player positions */
function makeState(overrides: Partial<MindshotGameState> = {}): MindshotGameState {
    const cells: Record<string, string> = {};
    for (const cell of generateHexGrid()) {
        cells[hexKey(cell)] = 'normal';
    }
    return {
        phase: 'planning',
        round: 1,
        players: {
            p1: { id: 'p1', position: { q: 0, r: 0 }, hp: 3, status: 'alive', colorIndex: 0 },
            p2: { id: 'p2', position: { q: 1, r: 0 }, hp: 3, status: 'alive', colorIndex: 1 },
        },
        cells: cells as Record<string, import('../types').CellStatus>,
        plans: { p1: null, p2: null },
        plansRevealed: false,
        frames: [],
        currentFrame: 0,
        winnerId: null,
        ...overrides,
    };
}

const EAST_PLAN: MindshotPlan = {
    moves: ['E', 'E'],
    shootDirection: 'W',
};

const WEST_PLAN: MindshotPlan = {
    moves: ['W', 'W'],
    shootDirection: 'E',
};

// ─── generateHexGrid ─────────────────────────────────────────────────────────

describe('generateHexGrid', () => {
    it('generates exactly 61 cells', () => {
        const grid = generateHexGrid();
        approve('grid_cell_count', { count: grid.length, expected: MINDSHOT_TOTAL_CELLS });
    });

    it('all cells are valid hex coordinates', () => {
        const grid = generateHexGrid();
        const allValid = grid.every(isValidHex);
        approve('grid_all_valid', { allValid });
    });

    it('includes center cell', () => {
        const grid = generateHexGrid();
        const hasCenter = grid.some((c) => c.q === 0 && c.r === 0);
        approve('grid_has_center', { hasCenter });
    });

    it('has correct ring distribution', () => {
        const grid = generateHexGrid();
        const ringCounts: Record<number, number> = {};
        for (const cell of grid) {
            const ring = hexRing(cell);
            ringCounts[ring] = (ringCounts[ring] ?? 0) + 1;
        }
        // ring 0 = 1, ring 1 = 6, ring 2 = 12, ring 3 = 18, ring 4 = 24
        approve('grid_ring_distribution', { ringCounts });
    });
});

// ─── hexRing ─────────────────────────────────────────────────────────────────

describe('hexRing', () => {
    it('center is ring 0', () => {
        approve('ring_center', { ring: hexRing({ q: 0, r: 0 }) });
    });

    it('outer ring cells are ring 4', () => {
        approve('ring_outer', {
            NE: hexRing({ q: MINDSHOT_RADIUS, r: -MINDSHOT_RADIUS }),
            E:  hexRing({ q: MINDSHOT_RADIUS, r: 0 }),
        });
    });

    it('invalid cell is beyond radius', () => {
        const ring = hexRing({ q: 5, r: 0 });
        approve('ring_beyond', { ring, radius: MINDSHOT_RADIUS, isValid: isValidHex({ q: 5, r: 0 }) });
    });
});

// ─── hexNeighbor ─────────────────────────────────────────────────────────────

describe('hexNeighbor', () => {
    it('all 6 neighbors from origin are valid', () => {
        const origin = { q: 0, r: 0 };
        const dirs: HexDirection[] = ['E', 'NE', 'NW', 'W', 'SW', 'SE'];
        const neighbors = dirs.map((dir) => ({
            dir,
            neighbor: hexNeighbor(origin, dir),
            valid: isValidHex(hexNeighbor(origin, dir)),
        }));
        approve('neighbor_all_dirs', { neighbors });
    });

    it('neighbor of outer cell in outward direction is invalid', () => {
        const outerCell = { q: MINDSHOT_RADIUS, r: 0 }; // ring 4, E edge
        const beyond = hexNeighbor(outerCell, 'E');
        approve('neighbor_beyond_border', { beyond, valid: isValidHex(beyond) });
    });
});

// ─── isValidHex ──────────────────────────────────────────────────────────────

describe('isValidHex', () => {
    it('center is valid', () => {
        approve('valid_center', { valid: isValidHex({ q: 0, r: 0 }) });
    });

    it('outer ring is valid', () => {
        approve('valid_outer', { valid: isValidHex({ q: 4, r: 0 }) });
    });

    it('beyond outer ring is invalid', () => {
        approve('valid_beyond', { valid: isValidHex({ q: 5, r: 0 }) });
    });
});

// ─── createInitialMindshotState ──────────────────────────────────────────────

describe('createInitialMindshotState', () => {
    it('creates correct shape', () => {
        const state = createInitialMindshotState(PLAYER_IDS);
        approve('initial_shape', {
            phase: state.phase,
            round: state.round,
            playerCount: Object.keys(state.players).length,
            cellCount: Object.keys(state.cells).length,
            allCellsNormal: Object.values(state.cells).every((s) => s === 'normal'),
            winnerId: state.winnerId,
            currentFrame: state.currentFrame,
            framesCount: state.frames.length,
        });
    });

    it('all players start with correct HP', () => {
        const state = createInitialMindshotState(PLAYER_IDS);
        const hps = Object.values(state.players).map((p) => p.hp);
        approve('initial_hp', { hps, expected: MINDSHOT_START_HP });
    });

    it('all players start alive', () => {
        const state = createInitialMindshotState(PLAYER_IDS);
        const statuses = Object.values(state.players).map((p) => p.status);
        approve('initial_statuses', { statuses });
    });

    it('players start within radius 1-2', () => {
        const state = createInitialMindshotState(PLAYER_IDS);
        const rings = Object.values(state.players).map((p) => hexRing(p.position));
        const allInStartZone = rings.every((r) => r >= 1 && r <= 2);
        approve('initial_positions_in_zone', { allInStartZone });
    });

    it('all plans start as null', () => {
        const state = createInitialMindshotState(PLAYER_IDS);
        const allNull = Object.values(state.plans).every((p) => p === null);
        approve('initial_plans_null', { allNull });
    });
});

// ─── applyMindshotMessage: start_game ────────────────────────────────────────

describe('applyMindshotMessage: start_game', () => {
    it('transitions from lobby to planning phase', () => {
        const state = makeState({ phase: 'lobby', round: 0 });
        const next = applyMindshotMessage(state, { type: 'start_game' }, 'host');
        approve('start_game_phase', { phase: next.phase, round: next.round });
    });

    it('is a no-op if not in lobby', () => {
        const state = makeState({ phase: 'planning' });
        const next = applyMindshotMessage(state, { type: 'start_game' }, 'host');
        approve('start_game_noop', { phase: next.phase });
    });
});

// ─── applyMindshotMessage: submit_plan (partial) ─────────────────────────────

describe('applyMindshotMessage: submit_plan (partial)', () => {
    it('stores plan without resolving when only one player submitted', () => {
        const state = makeState();
        const next = applyMindshotMessage(
            state,
            { type: 'submit_plan', plan: EAST_PLAN },
            'p1'
        );
        approve('submit_plan_partial', {
            phase: next.phase,
            p1PlanNull: next.plans['p1'] === null,
            p2PlanNull: next.plans['p2'] === null,
        });
    });

    it('ignores plan from eliminated player', () => {
        const state = makeState({
            players: {
                p1: { id: 'p1', position: { q: 0, r: 0 }, hp: 0, status: 'eliminated', colorIndex: 0 },
                p2: { id: 'p2', position: { q: 1, r: 0 }, hp: 3, status: 'alive', colorIndex: 1 },
            },
        });
        const next = applyMindshotMessage(
            state,
            { type: 'submit_plan', plan: EAST_PLAN },
            'p1'
        );
        approve('submit_plan_eliminated', { phase: next.phase, p1PlanNull: next.plans['p1'] === null });
    });
});

// ─── applyMindshotMessage: submit_plan (all submitted → resolving) ────────────

describe('applyMindshotMessage: submit_plan (all submitted)', () => {
    it('resolves round when all alive players submit', () => {
        const p1State = applyMindshotMessage(
            makeState(),
            { type: 'submit_plan', plan: EAST_PLAN },
            'p1'
        );
        const resolved = applyMindshotMessage(
            p1State,
            { type: 'submit_plan', plan: WEST_PLAN },
            'p2'
        );
        approve('submit_plan_all_resolving', {
            phase: resolved.phase,
            plansRevealed: resolved.plansRevealed,
            framesGenerated: resolved.frames.length > 0,
            currentFrame: resolved.currentFrame,
        });
    });

    it('generates movement frames for each player per step', () => {
        const p1State = applyMindshotMessage(
            makeState(),
            { type: 'submit_plan', plan: EAST_PLAN },
            'p1'
        );
        const resolved = applyMindshotMessage(
            p1State,
            { type: 'submit_plan', plan: WEST_PLAN },
            'p2'
        );
        // 2 moves × 2 players = 4 move frames + 2 shoot frames + 1 zone frame = 7 minimum
        const moveFrames = resolved.frames.filter((f) => f.event.kind === 'move_step');
        const shootFrames = resolved.frames.filter((f) => f.event.kind === 'shoot');
        const zoneFrames = resolved.frames.filter((f) => f.event.kind === 'zone_update');
        approve('frames_types', {
            moveFrameCount: moveFrames.length,
            shootFrameCount: shootFrames.length,
            zoneFrameCount: zoneFrames.length,
        });
    });

    it('adds warning cells to zone frame', () => {
        const p1State = applyMindshotMessage(
            makeState(),
            { type: 'submit_plan', plan: EAST_PLAN },
            'p1'
        );
        const resolved = applyMindshotMessage(
            p1State,
            { type: 'submit_plan', plan: WEST_PLAN },
            'p2'
        );
        const zoneFrame = resolved.frames.find((f) => f.event.kind === 'zone_update');
        const warningCount = zoneFrame
            ? Object.values(zoneFrame.cells).filter((s) => s === 'warning').length
            : 0;
        approve('zone_warning_count', {
            warningCount,
            expectedCount: MINDSHOT_SHRINK_COUNT,
        });
    });

    it('shoots reduce HP when on the firing line', () => {
        // p1 at (0,0) shooting E, p2 at (2,0) → p1 hits p2
        const state = makeState({
            players: {
                p1: { id: 'p1', position: { q: 0, r: 0 }, hp: 3, status: 'alive', colorIndex: 0 },
                p2: { id: 'p2', position: { q: 2, r: 0 }, hp: 3, status: 'alive', colorIndex: 1 },
            },
        });
        const shootEast: MindshotPlan = { moves: ['NW', 'NW'], shootDirection: 'E' };
        const shootWest: MindshotPlan = { moves: ['SE', 'SE'], shootDirection: 'W' };
        const p1State = applyMindshotMessage(state, { type: 'submit_plan', plan: shootEast }, 'p1');
        const resolved = applyMindshotMessage(p1State, { type: 'submit_plan', plan: shootWest }, 'p2');
        // Both shoot each other (simultaneous), both take -1 HP
        const p1Hp = resolved.players['p1'].hp;
        const p2Hp = resolved.players['p2'].hp;
        approve('shoot_mutual_hit', { p1Hp, p2Hp, bothHit: p1Hp < 3 && p2Hp < 3 });
    });
});

// ─── applyMindshotMessage: next_frame ────────────────────────────────────────

describe('applyMindshotMessage: next_frame', () => {
    it('advances currentFrame', () => {
        const p1State = applyMindshotMessage(
            makeState(),
            { type: 'submit_plan', plan: EAST_PLAN },
            'p1'
        );
        const resolved = applyMindshotMessage(
            p1State,
            { type: 'submit_plan', plan: WEST_PLAN },
            'p2'
        );
        const advanced = applyMindshotMessage(resolved, { type: 'next_frame' }, 'host');
        approve('next_frame_advances', {
            before: resolved.currentFrame,
            after: advanced.currentFrame,
        });
    });

    it('transitions to next round after last frame', () => {
        const p1State = applyMindshotMessage(
            makeState(),
            { type: 'submit_plan', plan: EAST_PLAN },
            'p1'
        );
        const resolved = applyMindshotMessage(
            p1State,
            { type: 'submit_plan', plan: WEST_PLAN },
            'p2'
        );
        // Advance past all frames
        let state = resolved;
        for (let i = 0; i < resolved.frames.length; i++) {
            state = applyMindshotMessage(state, { type: 'next_frame' }, 'host');
        }
        approve('next_frame_round_transition', {
            phase: state.phase,
            round: state.round,
            plansRevealed: state.plansRevealed,
            allPlansNull: Object.values(state.plans).every((p) => p === null),
        });
    });

    it('is a no-op when not in resolving phase', () => {
        const state = makeState({ phase: 'planning' });
        const next = applyMindshotMessage(state, { type: 'next_frame' }, 'host');
        approve('next_frame_noop', { phase: next.phase, currentFrame: next.currentFrame });
    });
});

// ─── applyMindshotMessage: play_again ────────────────────────────────────────

describe('applyMindshotMessage: play_again', () => {
    it('resets to lobby with same players', () => {
        const state = makeState({ phase: 'game_over', winnerId: 'p1' });
        const next = applyMindshotMessage(state, { type: 'play_again' }, 'p1');
        approve('play_again_reset', {
            phase: next.phase,
            round: next.round,
            playerCount: Object.keys(next.players).length,
            winnerId: next.winnerId,
            allCellsNormal: Object.values(next.cells).every((s) => s === 'normal'),
        });
    });
});
