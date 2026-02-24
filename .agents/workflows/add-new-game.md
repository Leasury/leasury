---
description: Step-by-step guide for adding a new game to the Leasury platform
---

> **First:** Read [.agents/AGENTS.md](file:///home/clickout/Projekty/leasury/.agents/AGENTS.md) for project rules before proceeding.

# Adding a New Game

Follow these steps in order. Replace `<name>` with your game name in lowercase (e.g. `quiz`, `trivia`).

---

## Step 1: Define types in `game-logic`

Create `packages/game-logic/src/games/<name>/types.ts`:
- `<Name>GameState` interface
- `<Name>Message` union type (all messages the game can receive)

## Step 2: Write pure game logic

Create `packages/game-logic/src/games/<name>/logic.ts`:
- `createInitial<Name>State()` — returns starting state
- `apply<Name>Message(state, message)` — pure reducer, no side effects
- Any helper functions needed (e.g. `getNextPlayerId` is already in timeline/logic.ts)

## Step 3: Create index and export from package

Create `packages/game-logic/src/games/<name>/index.ts`:
```ts
export * from './types';
export * from './logic';
```

Add to `packages/game-logic/src/index.ts`:
```ts
export * from './games/<name>';
```

## Step 4: Write approval tests

Create `packages/game-logic/src/games/<name>/__tests__/logic.test.ts`.
Cover at minimum:
- Initial state shape
- Each message type
- Win/lose conditions

Run tests and promote snapshots:
```bash
cd /home/clickout/Projekty/leasury/packages/game-logic && npm test
# Then promote:
for f in src/games/<name>/__tests__/*.received.txt; do cp "$f" "${f/.received.txt/.approved.txt}"; done
```

## Step 5: Register the game in the server

In `apps/server/src/server.ts`:
- Import `createInitial<Name>State`, `apply<Name>Message`, `<Name>GameState`, `<Name>Message`
- Add the game type to the `ServerState.game` union type
- Add message type guard `is<Name>Message()`
- Add handler `handle<Name>Message()` — calls `apply<Name>Message` and broadcasts

## Step 6: Create frontend pages

**Host page** — `apps/web/app/games/<name>/host/page.tsx`:
```tsx
const { roomState, gameState } = usePartyRoom<NameGameState>(roomCode, { asHost: true });
return <NameHost state={{ room: roomState, game: gameState }} />;
```

**Player page** — `apps/web/app/games/<name>/player/page.tsx`:
```tsx
const { roomState, gameState, myPlayerId } = usePartyRoom<NameGameState>(roomCode, {
    sessionKeyPrefix: 'lobby',
});
return <NamePlayer state={{ room: roomState, game: gameState }} myPlayerId={myPlayerId} />;
```

## Step 7: Create display components

- `apps/web/components/games/<name>/<Name>Host.tsx` — TV display
- `apps/web/components/games/<name>/<Name>Player.tsx` — phone controller

Send messages via `(window as any).__partySocket.send(JSON.stringify({ type: '...' }))`.

## Step 8: Build and test

```bash
cd /home/clickout/Projekty/leasury
npm run build   # must pass
npm run test    # must pass
```
