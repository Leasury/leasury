---
description: Leasury project rules and practices for AI agents. Read this before making any changes.
---

# Leasury — Agent Instructions

This file is read automatically at the start of every agent session. Follow all rules here without needing to be told.

---

## Project Overview

Leasury is a **multiplayer party game platform** built as a monorepo:

| Package | Purpose |
|---|---|
| `packages/game-logic` | All game logic, types, and utilities. Pure TypeScript, no framework dependencies. |
| `apps/server` | PartyKit server. Handles connections, routing, state broadcasting. **No game logic here.** |
| `apps/web` | Next.js frontend. Displays state, sends messages. **No game logic here.** |

---

## Rule 1: Logic Belongs in `game-logic`

- **ALL** game rules, state transitions, scoring, win conditions, and player rotation must live in `packages/game-logic/src/`.
- `apps/server` only: receives messages → calls game-logic → broadcasts state.
- `apps/web` only: renders state → sends messages. No business logic.
- If you catch yourself computing game state in `server.ts` or a `.tsx` file, extract it to game-logic first.

**Pattern for adding logic:**
```
packages/game-logic/src/games/<gameName>/logic.ts   ← pure functions
packages/game-logic/src/games/<gameName>/types.ts   ← types
packages/game-logic/src/games/<gameName>/index.ts   ← re-export everything
```

---

## Rule 2: Share Solutions Across Games

- Common frontend socket logic lives in `apps/web/hooks/usePartyRoom.ts`. **Use it** for every new game page — never write raw PartySocket code in a page.
- Common server patterns (room management, player join/leave) are already handled by `Server` class in `server.ts`. Extend, don't duplicate.
- When two games need the same helper (e.g. turn rotation), it goes into `game-logic`, not copy-pasted.

---

## Rule 3: TypeScript Everywhere + Always Build After Changes

- All files must be `.ts` or `.tsx`. No `.js` files in source.
- **After every code change**, run `npm run build` from the monorepo root and fix any TypeScript errors before finishing.

```bash
cd /home/clickout/Projekty/leasury
npm run build
```

> If build fails with TypeScript errors: fix them. Never leave a broken build.

---

## Rule 4: Approval Tests for Game Logic

All game logic in `packages/game-logic` must be covered by approval tests.

**Run tests after every change to game-logic:**
```bash
cd /home/clickout/Projekty/leasury
npm run test
```

### If tests fail:

| Situation | Action |
|---|---|
| You changed logic intentionally and the snapshot is now wrong | Promote received→approved: `cp *.received.txt *.approved.txt` for the affected test, then re-run |
| The failure looks like a regression/bug | Fix the code, don't change the approved file |
| Unsure if the behavior change is intentional | **Ask the developer before promoting snapshots** |

### Adding tests for new logic:
```
packages/game-logic/src/games/<gameName>/__tests__/logic.test.ts
```

Use the `approve(testName, data)` helper pattern (see existing tests). Use `nodediff` reporter.

**Promoting all received files to approved (first run or bulk approval):**
```bash
for f in packages/game-logic/src/**/__tests__/*.received.txt; do cp "$f" "${f/.received.txt/.approved.txt}"; done
```

---

## Rule 5: After Every Code Change — Checklist

// turbo-all

1. Run `npm run build` from monorepo root — fix any TypeScript errors
2. Run `npm run test` from monorepo root — fix test failures or ask developer about snapshot changes

---

## Design System

**Color palette:**
| Token | Hex | Usage |
|---|---|---|
| Background | `#FAF9F5` | Page backgrounds |
| Surface | `#F0EFEA` | Cards, panels |
| Border | `#E8E6DC` | Dividers, input borders |
| Text primary | `#141413` | Headings, body |
| Text muted | `#B0AEA5` | Captions, labels |
| Accent | `#D97757` | Primary buttons, highlights |
| Accent dark | `#CC785C` | Hover states |
| Dark bg | `#2A2A2A` | Host screens |

**Typography:** System font stack. Font-bold for headings, tabular-nums for counters.

**Component conventions:**
- Rounded corners: `rounded-xl` (inputs), `rounded-2xl` (cards), `rounded-3xl` (modals)
- Animations: use `framer-motion`. Prefer `motion.div` with `initial/animate` for entrances.
- Buttons: use `bg-[#D97757] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#CC785C] transition-colors`

---

## Architecture: Adding a New Game

See `/home/clickout/Projekty/leasury/.agents/workflows/add-new-game.md` for the full step-by-step.

---

## File Structure Reference

```
apps/
  server/src/server.ts          ← single server entry point
  web/
    app/games/<name>/
      host/page.tsx             ← uses usePartyRoom({ asHost: true })
      player/page.tsx           ← uses usePartyRoom({ sessionKeyPrefix: 'lobby' })
    components/games/<name>/
      <Name>Host.tsx            ← pure display, receives state prop
      <Name>Player.tsx          ← pure display + sends messages via window.__partySocket
    hooks/
      usePartyRoom.ts           ← shared PartySocket hook

packages/
  game-logic/src/
    games/
      <name>/
        logic.ts                ← pure functions (no I/O, no side effects)
        types.ts                ← TypeScript types
        index.ts                ← re-exports
        __tests__/
          logic.test.ts         ← approval tests
          *.approved.txt        ← committed snapshots (source of truth)
    room/
      types.ts                  ← RoomState, Player, RoomMessage
```
