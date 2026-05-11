'use server';

import { db } from '../db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { smartRoll, weightedRoll, type RollPick } from '../roll';
import { levelFor } from '../leveling';

export async function rollCommand(
  dogId: number,
  mode: 'smart' | 'weighted',
): Promise<RollPick | null> {
  return mode === 'weighted' ? weightedRoll(dogId) : smartRoll(dogId);
}

export async function startWorkout(dogId: number, location?: string): Promise<number> {
  const result = db
    .prepare(
      'INSERT INTO workouts (dog_id, date_time, location) VALUES (?, ?, ?)',
    )
    .run(dogId, Date.now(), location ?? null);
  return Number(result.lastInsertRowid);
}

export type AddSetResult = {
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  commandName: string;
};

export async function addSet(input: {
  workoutId: number;
  dogCommandId: number;
  repsAttempted: number;
  repsSuccess: number;
  distractionLevel: number;
}): Promise<AddSetResult> {
  const { workoutId, dogCommandId, repsAttempted, repsSuccess, distractionLevel } = input;
  const now = Date.now();

  const tx = db.transaction(() => {
    const prior = db
      .prepare(
        `SELECT dc.total_successes AS succ, mc.default_name AS name
         FROM dog_commands dc
         JOIN master_commands mc ON mc.id = dc.command_id
         WHERE dc.id = ?`,
      )
      .get(dogCommandId) as { succ: number; name: string };

    db.prepare(
      `INSERT INTO sets (workout_id, dog_command_id, reps_attempted, reps_success, distraction_level)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(workoutId, dogCommandId, repsAttempted, repsSuccess, distractionLevel);
    db.prepare(
      `UPDATE dog_commands
       SET total_attempted = total_attempted + ?,
           total_successes = total_successes + ?,
           last_trained_date = ?
       WHERE id = ?`,
    ).run(repsAttempted, repsSuccess, now, dogCommandId);

    const oldLevel = levelFor(prior.succ);
    const newLevel = levelFor(prior.succ + repsSuccess);
    return { oldLevel, newLevel, leveledUp: newLevel > oldLevel, commandName: prior.name };
  });
  return tx();
}

export async function finishWorkout(workoutId: number, durationSeconds: number, notes?: string): Promise<void> {
  db.prepare(
    'UPDATE workouts SET total_duration = ?, notes = ? WHERE id = ?',
  ).run(durationSeconds, notes ?? null, workoutId);
  revalidatePath('/');
  redirect('/');
}
