---
description: General coding standards, tech stack conventions, and architecture rules for the Lesury project — apply these to every task
---

# Lesury — General Project Rules

> These rules apply to **every task** in this project. Read this file before making any code change.

---

## Tech Stack

Lesury is a **Turbo monorepo** with npm workspaces. The core stack is:

| Layer | Technology |
|-------|-----------|
| Frontend | **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS v4**, **ShadCN UI** |
| Real-time server | **PartyKit** + **partysocket** (WebSocket-based state sync) |
| Animation | **Framer Motion** |
| Icons | **Lucide React** (`lucide-react`) — the ShadCN default |
| Font | **Source Code Pro** (loaded via `next/font/google`, mapped to all three font families) |

### Monorepo Structure

```
apps/web          → Next.js app (TV host screens + phone player screens)
apps/server       → PartyKit real-time server
packages/game-logic → Shared pure game logic (used by both web and server)
packages/config   → Shared ESLint and TypeScript configs
```

---

## Critical: Reuse Before Creating

1. **Before creating any component**, search `apps/web/components/` and `apps/web/app/components/` first.
2. **Never duplicate** functionality already covered by an existing component, ShadCN primitive, or game-logic function.
3. Only create a new file if the needed functionality genuinely does not exist.
4. If a ShadCN component is not yet installed: `npx shadcn@latest add <component>` (run inside `apps/web`).

---

## Styling Rules

- **Tailwind CSS v4 utilities only.** No `tailwind.config.js` — all config lives in `apps/web/app/globals.css` via `@theme inline`.
- **Never hardcode hex values.** Use the design token CSS variables (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `bg-accent`, `text-accent-foreground`, `bg-border`, etc.).
- No custom CSS files or `style={{}}` props unless absolutely unavoidable.
- Mobile-first: default styles for mobile, `md:` / `lg:` for larger screens.
- Animations via **Framer Motion** only.

### Dark Mode

The project uses `next-themes` with `attribute="class"`. The `.dark` class is toggled on `<html>`. All design tokens already have dark-mode overrides in `globals.css`. Do not write any `dark:` Tailwind variants unless a specific override is unavoidable.

### Typography

- Font applied globally — do **not** specify `font-mono` or `font-sans` per-element.
- Weight conventions: `font-normal` (body) → `font-medium` (labels) → `font-semibold`/`font-bold` (headings) → `font-black` (hero/display).

---

## TypeScript Rules

- **Always TypeScript.** Never `.js` or `.jsx`.
- Avoid `any`. Use proper types or `unknown` with narrowing.
- Game-specific types live in `packages/game-logic/src/games/<game>/types.ts`.

---

## File & Folder Convention

| What | Where |
|------|-------|
| Pages & layouts | `apps/web/app/` (App Router) |
| Shared/reusable components | `apps/web/components/` |
| Page-local components | `apps/web/app/components/` |
| Utility functions | `apps/web/lib/` |
| Game logic | `packages/game-logic/src/games/<game-name>/` |

---

## Game Architecture Pattern

Every game **must** follow this structure exactly:

```
app/games/<game>/page.tsx                      ← landing page (description + start/join CTAs)
app/games/<game>/host/page.tsx                 ← host page (TV screen)
app/games/<game>/player/page.tsx               ← player page (phone controller)

components/games/<game>/<Game>Host.tsx         ← host display & game board logic
components/games/<game>/<Game>Player.tsx       ← player controls & input logic

packages/game-logic/src/games/<game>/types.ts  ← state + message types
packages/game-logic/src/games/<game>/logic.ts  ← pure reducer (createInitial* + apply*)
packages/game-logic/src/games/<game>/index.ts  ← re-exports

apps/server/src/server.ts                      ← PartyKit message routing handler
```

- **Host page** uses the `usePartyRoom` hook with `{ asHost: true, gameType: '<game>' }`.
- **Player page** uses the `usePartyRoom` hook with `{ sessionKeyPrefix: 'lobby' }`.
- The server handler must call `this.connToPlayer.get(sender.id) || sender.id` to resolve the **canonical player ID** before passing to `apply*Message` — never use raw `sender.id` as a player key.

See `.agents/workflows/add-new-game.md` for the full step-by-step checklist when adding a new game.

---

## Host Lobby Screen

All host lobby screens must follow `.agents/host-lobby-design-spec.md`. Summary:
- Dark background (`bg-background`) with two `bg-card` panels side by side (`max-w-5xl`)
- Game title centered **above** both panels
- Left panel: QR code + room code + player list (subtitle: **"Scan to join"**)
- Right panel: game settings (up to 2 controls) + Start Game button (subtitle: **"Set up game"**)
- Accent color (`bg-accent / text-accent-foreground`) for active selections and the Start button

---

## Real-Time Communication

- Server uses **PartyKit** for WebSocket state sync.
- Clients connect via **partysocket** (`PartySocket`).
- Game state is managed **server-side**; clients send action messages and receive `sync` broadcasts.
- Send messages from components via `(window as any).__partySocket.send(JSON.stringify({ type: '...' }))`.
- The `usePartyRoom` hook handles all connection boilerplate — use it instead of raw PartySocket in pages.

---

## After Any Code Change

Run the `/after-code-change` workflow checklist after every code change.
