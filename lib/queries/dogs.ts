import 'server-only';
import { db } from '../db';
import { levelFor, nextLevelThreshold } from '../leveling';
import { currentStreak, heatmapBuckets, type HeatmapDay } from '../streaks';

export type Dog = {
  id: number;
  name: string;
  breed: string | null;
  created_at: number;
};

export type DogSummary = Dog & {
  totalXp: number;
  level: number;
  nextThreshold: number;
  streak: number;
  heatmap: HeatmapDay[];
  lastSession: {
    command: string;
    successes: number;
    attempted: number;
    at: number;
  } | null;
};

export function getDogs(): Dog[] {
  return db
    .prepare('SELECT id, name, breed, created_at FROM dogs ORDER BY id')
    .all() as Dog[];
}

export function getDogSummary(dogId: number): DogSummary {
  const dog = db
    .prepare('SELECT id, name, breed, created_at FROM dogs WHERE id = ?')
    .get(dogId) as Dog;

  const xpRow = db
    .prepare(
      'SELECT COALESCE(SUM(total_successes), 0) AS xp FROM dog_commands WHERE dog_id = ?',
    )
    .get(dogId) as { xp: number };

  const lastRow = db
    .prepare(
      `SELECT mc.default_name AS command, s.reps_success AS successes,
              s.reps_attempted AS attempted, w.date_time AS at
       FROM sets s
       JOIN workouts w ON w.id = s.workout_id
       JOIN dog_commands dc ON dc.id = s.dog_command_id
       JOIN master_commands mc ON mc.id = dc.command_id
       WHERE w.dog_id = ?
       ORDER BY w.date_time DESC, s.id DESC
       LIMIT 1`,
    )
    .get(dogId) as
    | { command: string; successes: number; attempted: number; at: number }
    | undefined;

  return {
    ...dog,
    totalXp: xpRow.xp,
    level: levelFor(xpRow.xp),
    nextThreshold: nextLevelThreshold(xpRow.xp),
    streak: currentStreak(dogId),
    heatmap: heatmapBuckets(dogId, 30),
    lastSession: lastRow ?? null,
  };
}
