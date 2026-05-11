# Dog Training

A local-first web app for tracking dog training sessions. Combines a Garmin-style workout log with an RPG-style XP system per command — log reps, watch your dogs level up, focus on weak commands.

Built with Next.js (App Router), React, Tailwind CSS, and `better-sqlite3`. Runs entirely on your machine. No accounts, no cloud, no telemetry.

## Quick start

```bash
git clone <this-repo>
cd dogtraining
npm install
npm run dev
```

Open <http://localhost:3000>. The SQLite database is created and seeded automatically on first boot at `data/training.sqlite` (gitignored). Out of the box you get two dogs (Bean and Kiwi) and three master sets — Canicross, Scentwork, Obedience — pre-populated with commands.

### Requirements

- Node.js 18.18+ (recommend 20 LTS).
- A C/C++ toolchain so `better-sqlite3` can compile its native binding:
  - **macOS** — Xcode Command Line Tools (`xcode-select --install`).
  - **Linux** — `build-essential` (Debian/Ubuntu) or equivalent (`gcc`, `make`, `python3`).
  - **Windows** — `npm install --global windows-build-tools` or install Visual Studio Build Tools.

### Production build

```bash
npm run build
npm run start    # serves at http://localhost:3000
```

### Use it on your phone (same Wi-Fi)

`npm run dev` prints a `Network:` URL. Open it on your phone, then "Add to Home Screen" — the app ships a PWA manifest and icon, so it installs as a standalone app.

### Resetting the database

```bash
rm -rf data/
```

Next start re-creates and re-seeds it.

## How it works

### Dashboard (`/`)

Vertical stack of dog cards, Garmin-style:

- **Level badge** — Lv 1–4, derived from total successful reps across all commands.
- **XP bar** — progress toward the next level. Thresholds: Lv 1 (0–25), Lv 2 (26–100), Lv 3 (101–250), Lv 4 (251+).
- **Streak** — consecutive days with at least one workout.
- **Last session** — most recent set logged, relative time.
- **30-day heatmap** — opacity scales with reps attempted per day.
- **Start Workout** — jumps into the live workout flow.

Below the cards, the **Roll to Train** widget picks a command for you:

- **Smart roll** — random pick from commands not trained in the last 7 days.
- **Weighted roll** — random pick from your three weakest commands by accuracy (`successes / attempted`).

Either result links straight into a workout with that command preselected.

### Live workout (`/workouts/new`)

Garmin-style: hit **Start** and a timer begins. Add sets as you go:

- **Command** — grouped by master set (Canicross / Scentwork / Obedience).
- **Attempted / Successes** — both required; successes capped at attempted.
- **Distraction** — 0–3 (calm to chaotic). Helps you contextualize accuracy later.

Each set is saved as soon as you tap **Add Set**. If the new total successes for that command crosses a level threshold, an amber **Level up!** toast slides in.

**Finish Workout** writes the duration and returns you to the dashboard.

### Per-dog detail (`/dogs/{id}`)

Click a dog's name on the dashboard. You'll see:

- Total XP, current streak, XP to next level.
- 30-day heatmap.
- Every command grouped by master set, with its own level, XP bar, accuracy %, and last-trained date.

## Data model

Six tables (full DDL in `lib/schema.sql`):

| Table | Purpose |
|---|---|
| `dogs` | Each dog you train. |
| `master_sets` | Top-level discipline (Canicross, Scentwork, Obedience). |
| `master_commands` | Commands within a discipline (Sit, Recall, Find It…). |
| `dog_commands` | A dog × command junction with running totals (`total_attempted`, `total_successes`, `last_trained_date`). |
| `workouts` | Session header — dog, date_time, location, duration, notes. |
| `sets` | Reps logged inside a workout (a `dog_command_id`, attempted, successes, distraction). |

Design notes:

- Levels are **computed** from `total_successes`, not stored.
- All timestamps are unix-epoch milliseconds (`INTEGER`).
- WAL mode and foreign keys are enabled at boot.
- `Add Set` updates `sets` + `dog_commands` totals in a single transaction.

## Adding new dogs / commands

Right now there's no UI for adding dogs or commands — you can do it from the SQLite shell:

```bash
node -e "const db=require('better-sqlite3')('data/training.sqlite'); \
  db.prepare('INSERT INTO dogs (name,breed) VALUES (?,?)').run('Pip','Whippet')"
```

If you add a new dog, also create its `dog_commands` rows so it has something to log against. A UI for this is on the roadmap.

## Project structure

```
app/
  page.tsx              Dashboard
  workouts/new/         Live workout flow
  dogs/[id]/            Per-dog detail
  manifest.ts, icon.tsx PWA metadata
components/             DogCard, Heatmap, RollToTrainWidget, StartWorkoutButton
lib/
  db.ts                 better-sqlite3 singleton + migrations
  schema.sql            DDL (read at startup)
  seed.ts               Idempotent seed
  leveling.ts           levelFor, accuracy
  streaks.ts            currentStreak, heatmapBuckets
  roll.ts               smartRoll, weightedRoll
  queries/              Typed queries + Server Actions
data/                   SQLite file (gitignored, auto-created)
```

See `CLAUDE.md` for an architecture deep-dive aimed at contributors / AI agents.

## Roadmap

Parked for now (PRs welcome):

- UI to add dogs, master sets, master commands.
- Accuracy/XP trend charts.
- Workout history view (timeline + filters).
- One-click SQLite export / import from the UI.
- True offline PWA via service worker.
- Photo/video attachments per set.
- Multi-dog workouts in a single session.

## License

Not yet licensed. Treat as all-rights-reserved until that changes.
