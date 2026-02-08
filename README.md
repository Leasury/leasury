# README.md - Project Leasury Context & Guidelines

## 1. Project Overview

**Leasury** is a web-based platform for local multiplayer "digital board games."

- **Core Concept:** "Jackbox-style" architecture.
- **Hardware:** A shared screen (TV/Laptop) acts as the **Host**. Players' smartphones act as **Controllers**.
- **Connection:** Players join via QR Code / Room Code. No app installation allowed.
- **Primary Goal:** Social interaction in the real world. The app is a facilitator, not the center of attention.

## 2. Design Philosophies (Strict Adherence)

All code and UI/UX decisions must respect these pillars:

1.  **Heads-Up Design:** The "Truth" is on the TV. The phone is a dumb controller. Minimize time spent looking at the phone screen.
2.  **Zero Friction:** No login required to play. No app stores. Instant load via WebSockets.
3.  **Anti-Dopamine:** No loot boxes, no infinite loops. Games have a distinct start and end.
4.  **Accessibility:** Mobile UI must be strictly touch-friendly (huge buttons, high contrast).

## 3. Technical Architecture (The Stack)

We use a **Turborepo Monorepo** structure. All agents must respect module boundaries.

### Core Technologies

- **Runtime:** Node.js (Dev), Cloudflare Workers / Edge (Prod).
- **Language:** TypeScript (Strict mode).
- **Frontend:** Next.js 14+ (App Router).
- **Game Engine:** `boardgame.io` (State Management & Move Validation).
- **Realtime Server:** `PartyKit` (Serverless WebSockets, compatible with `boardgame.io`).
- **Styling:** Tailwind CSS + `shadcn/ui`.
- **Animation:** Framer Motion (DOM-based animation). **DO NOT use Canvas/Phaser.**
- **Persistence:** Supabase (Only for match history/user profiles, NOT for realtime game state).

## 4. Directory Structure & Responsibilities

/leasury
|-- README.md // This file. Important for context of the project.
|-- documentation // Folder which contains documentation of the project.
|-- scripts // Folder which contains scripts for the project.
├── apps
│ ├── web // Next.js Application
│ │ ├── app/host // The TV View (Observer/Board)
│ │ └── app/play // The Mobile View (Controller)
│ └── server // PartyKit Server (WebSocket Host)
│
├── packages
│ ├── game-logic // THE SOURCE OF TRUTH
│ │ ├── games/ // Specific game definitions (Timeline, etc.)
│ │ ├── types.ts // Shared TS interfaces
│ │ └── index.ts // Exports
│ ├── ui // Shared React components (Buttons, Cards)
│ └── config // Shared TS/Eslint configs

````

### 🔴 Critical Architectural Rules

1. **Isomorphic Logic:** Game logic (`G` state, `moves`, `phases`) MUST live in `packages/game-logic`.
2. **No Logic in UI:** The Next.js frontend (`apps/web`) should only *render* state and *dispatch* moves. It must not calculate game rules.
3. **No UI in Logic:** `packages/game-logic` must not import React or UI libraries. It must be pure TypeScript.
4. **Serverless Constraints:** The `server` runs on Edge. Do not use Node.js specific APIs (`fs`, `child_process`) in shared code.

## 5. Implementation Guidelines

### A. Game Logic (`packages/game-logic`)

We use `boardgame.io` style definitions.

* **State (`G`):** Must be a serializable JSON object.
* **Moves:** Functions that mutate `G`. Use strict typing.
* **Secret State:** Use `playerView` to strip sensitive data (e.g., other players' cards) before sending to client.

```typescript
// Example Pattern
export const MyGame: Game<MyState> = {
  setup: () => ({ ... }),
  moves: {
    myMove: ({ G, ctx }, payload) => { ... }
  }
};

````

### B. The Server (`apps/server`)

- Uses `partykit` to host the `boardgame.io` backend.
- Keep this lightweight. It mostly just imports logic from `packages/game-logic` and passes it to the PartyKit adapter.

### C. The Frontend (`apps/web`)

- **Host View (`/host`):**
- Use `Framer Motion` for smooth transitions of cards/avatars.
- Optimized for 1920x1080 (Landscape).

- **Controller View (`/play`):**
- Optimized for Portrait mobile.
- Use `navigator.vibrate` for haptic feedback on buttons.
- Prevent screen sleep (`use-wake-lock`).

## 6. Coding Standards

- **TypeScript:** No `any`. Define interfaces for all Game States and Props.
- **Components:** Functional components only.
- **Naming:**
- Files: `kebab-case.ts` or `PascalCase.tsx` (components).
- Variables: `camelCase`.

- **Data Fetching:** Realtime data comes via `boardgame.io` hooks (`useBoardgame`). Static data via Next.js Server Actions.

## 7. Current Project Status (Context)

- **Phase:** Setting up the MVP Architecture.
- **Current Task:** Scaffolding the Monorepo and implementing the first game ("Timeline") using the shared engine approach.
- **Creator Persona:** Fullstack Architect. Prefers clean, modular code over "quick hacks."
