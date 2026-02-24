---
description: Checklist to run after every code change in the Lesury project
---

> **First:** Read [.agents/AGENTS.md](file:///home/clickout/Projekty/lesury/.agents/AGENTS.md) for project rules before proceeding.

// turbo-all

# After Every Code Change

Run these steps after making **any** code change, in order.

## Step 1: Build

Run from the monorepo root to check TypeScript compiles cleanly:

```bash
cd /home/clickout/Projekty/lesury && npm run build
```

If it fails: fix all TypeScript errors before proceeding.

## Step 2: Run Tests

```bash
cd /home/clickout/Projekty/lesury && npm run test
```

### If tests fail:

**Case A — Known behavior change** (you intentionally changed game logic):
- Review the diff printed by `nodediff` in the test output
- If the new output is correct, promote: copy `.received.txt` → `.approved.txt` for the changed tests
- Re-run `npm run test` to confirm green

**Case B — Unexpected failure** (regression):
- Fix the code, don't touch `.approved.txt` files

**Case C — Unsure**:
- Ask the developer to review the diff before promoting

### Bulk promoting all received files (first run / large refactor):
```bash
for f in /home/clickout/Projekty/lesury/packages/game-logic/src/**/__tests__/*.received.txt; do
    cp "$f" "${f/.received.txt/.approved.txt}"
done
```
