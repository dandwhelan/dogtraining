import 'server-only';
import { db } from './db';
import { accuracy } from './leveling';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export type RollPick = {
  dog_command_id: number;
  command_name: string;
  set_name: string;
  total_attempted: number;
  total_successes: number;
  last_trained_date: number | null;
};

export function smartRoll(dogId: number): RollPick | null {
  const cutoff = Date.now() - SEVEN_DAYS_MS;
  const rows = db
    .prepare(
      `SELECT dc.id AS dog_command_id, mc.default_name AS command_name,
              ms.set_name AS set_name, dc.total_attempted, dc.total_successes,
              dc.last_trained_date
       FROM dog_commands dc
       JOIN master_commands mc ON mc.id = dc.command_id
       JOIN master_sets ms ON ms.id = mc.set_id
       WHERE dc.dog_id = ?
         AND (dc.last_trained_date IS NULL OR dc.last_trained_date < ?)`,
    )
    .all(dogId, cutoff) as RollPick[];
  if (rows.length === 0) return null;
  return rows[Math.floor(Math.random() * rows.length)];
}

export function weightedRoll(dogId: number): RollPick | null {
  const rows = db
    .prepare(
      `SELECT dc.id AS dog_command_id, mc.default_name AS command_name,
              ms.set_name AS set_name, dc.total_attempted, dc.total_successes,
              dc.last_trained_date
       FROM dog_commands dc
       JOIN master_commands mc ON mc.id = dc.command_id
       JOIN master_sets ms ON ms.id = mc.set_id
       WHERE dc.dog_id = ? AND dc.total_attempted > 0`,
    )
    .all(dogId) as RollPick[];
  if (rows.length === 0) return null;
  const sorted = [...rows].sort(
    (a, b) =>
      accuracy(a.total_successes, a.total_attempted) -
      accuracy(b.total_successes, b.total_attempted),
  );
  const bottom = sorted.slice(0, 3);
  return bottom[Math.floor(Math.random() * bottom.length)];
}
