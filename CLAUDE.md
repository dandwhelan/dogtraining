# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install         # one-time setup; native build of better-sqlite3
npm run dev         # Next.js dev server at http://localhost:3000
npm run build       # production build
npm run start       # serve the production build
npm run lint        # next lint
```

No test suite is configured yet. The SQLite file lives at `data/training.sqlite` (gitignored, auto-created and seeded on first boot). Delete the `data/` directory to reset to seed state.

## Architecture

A local-first Next.js App Router app for tracking dog training sessions. Two halves: a Garmin-style workout log (`workouts` → `sets`) and an RPG-style XP system per dog/command. No auth, single-user.

### Stack & non-obvious wiring

- **`better-sqlite3` is a native module.** It must never be bundled for the browser. Three things enforce this:
  1. `next.config.mjs` lists `better-sqlite3` in `serverExternalPackages`.
  2. `lib/db.ts` and every file that imports it begin with `import 'server-only'`.
  3. The DB handle is a module-level singleton stashed on `globalThis.__dogtraining_db` so Next dev HMR doesn't open a second handle.
- **Schema is loaded from `lib/schema.sql` at boot** via `fs.readFileSync(path.join(process.cwd(), 'lib/schema.sql'))`. This works because `process.cwd()` is the project root during `next dev` / `next start`. If you ever bundle the schema differently, update the read path.
- **`seed.ts` is idempotent.** It checks `SELECT COUNT(*) FROM dogs` and bails out if non-zero. It also pre-creates a `dog_commands` row for every (dog × master_command) pair so the dashboard never has empty selects.

### Data model invariants

- **Levels are derived, not stored.** `dog_commands` does **not** have a `current_level` column. Always compute via `levelFor(total_successes)` from `lib/leveling.ts`. Thresholds: `[0, 26, 101, 251]` → Lv 1/2/3/4.
- **`last_trained_date` IS denormalized** on `dog_commands` for performance (avoids `MAX(date_time)` joins on every dashboard render). `addSet` is responsible for keeping it correct.
- **Timestamps are unix-epoch ms `INTEGER`s** everywhere — sortable, no TZ ambiguity, matches `Date.now()` directly.
- `distraction_level` is `CHECK (BETWEEN 0 AND 3)`. The form enforces it client-side too.
- All FKs cascade on delete; `PRAGMA foreign_keys = ON` is set at boot.

### Server/Client boundary

- **Server Actions** live in `lib/queries/workouts.ts` — that's the only file with the top-level `'use server'` directive. Functions there (`startWorkout`, `addSet`, `finishWorkout`, `rollCommand`) are callable directly from client components.
- **Read queries** (`lib/queries/dogs.ts`, `commands.ts`, plus `streaks.ts`, `roll.ts`) are normal server-only exports called from Server Components. Don't add `'use server'` to these — that would turn every export into a Server Action and break type-only imports.
- **Client components import types from server-only files freely** (e.g. `RollToTrainWidget.tsx` does `import type { RollPick } from '@/lib/roll'`). Type-only imports are erased at compile, so the `'server-only'` guard never reaches the client bundle.

### Key flows

- **Add Set transaction** (`lib/queries/workouts.ts::addSet`) does four things in one `db.transaction`:
  1. read prior `total_successes` + command name,
  2. `INSERT INTO sets`,
  3. `UPDATE dog_commands` (totals + `last_trained_date`),
  4. compute `levelFor(prior)` vs `levelFor(prior + reps_success)` and return `{ oldLevel, newLevel, leveledUp, commandName }`.
  The client uses the return value to fire the level-up toast in `LiveWorkout.tsx`.
- **Roll to Train** has two strategies in `lib/roll.ts`:
  - `smartRoll`: random pick from commands with `last_trained_date IS NULL OR < now - 7d`.
  - `weightedRoll`: rank rows with `total_attempted > 0` by `successes/attempted` ascending, random pick from the bottom 3.
  Results are deep-linked into a prefilled workout via `/workouts/new?dog=X&command=Y` (the `command` is a `dog_command_id`).
- **Dashboard** (`app/page.tsx`) is a Server Component that calls `getDogSummary(id)` per dog. That helper does a lot of work in one call (XP sum, last session, streak, 30-day heatmap) — if you add fields here, check perf with realistic data first.

### Page → file map

- `app/page.tsx` — dashboard (Server Component, `dynamic = 'force-dynamic'`).
- `app/workouts/new/page.tsx` (Server) + `LiveWorkout.tsx` (Client) — live workout timer and set logger.
- `app/dogs/[id]/page.tsx` — per-dog detail with per-command level/accuracy.
- `app/manifest.ts` + `app/icon.tsx` — installable PWA metadata (no service worker — not offline-capable beyond what Next dev gives you).

### Path alias

`@/*` → repo root (`tsconfig.json`). Use `@/lib/...`, `@/components/...` — relative paths only inside the same directory.

## Project plan

The original design doc lives at `/root/.claude/plans/act-as-an-expert-partitioned-feather.md` (outside the repo). It covers v1 scope decisions: Server Actions over `/api/*`, levels computed dynamically, streaks + heatmap in v1, Garmin card stack layout. Read it before redesigning anything cross-cutting.
