import 'server-only';
import { db } from './db';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function currentStreak(dogId: number): number {
  const rows = db
    .prepare(
      `SELECT DISTINCT date_time FROM workouts WHERE dog_id = ? ORDER BY date_time DESC`,
    )
    .all(dogId) as { date_time: number }[];
  if (rows.length === 0) return 0;

  const days = new Set(rows.map((r) => startOfDay(r.date_time)));
  let streak = 0;
  let cursor = startOfDay(Date.now());
  if (!days.has(cursor)) cursor -= DAY_MS;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

export type HeatmapDay = { day: number; reps: number };

export function heatmapBuckets(dogId: number, days = 30): HeatmapDay[] {
  const today = startOfDay(Date.now());
  const start = today - (days - 1) * DAY_MS;
  const rows = db
    .prepare(
      `SELECT w.date_time AS ts, COALESCE(SUM(s.reps_attempted), 0) AS reps
       FROM workouts w
       LEFT JOIN sets s ON s.workout_id = w.id
       WHERE w.dog_id = ? AND w.date_time >= ?
       GROUP BY w.id`,
    )
    .all(dogId, start) as { ts: number; reps: number }[];

  const buckets = new Map<number, number>();
  for (let i = 0; i < days; i++) buckets.set(start + i * DAY_MS, 0);
  for (const r of rows) {
    const k = startOfDay(r.ts);
    buckets.set(k, (buckets.get(k) ?? 0) + r.reps);
  }
  return [...buckets.entries()].map(([day, reps]) => ({ day, reps }));
}
