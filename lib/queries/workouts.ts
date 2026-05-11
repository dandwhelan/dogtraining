'use server';

import { db } from '../db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function startWorkout(dogId: number, location?: string): Promise<number> {
  const result = db
    .prepare(
      'INSERT INTO workouts (dog_id, date_time, location) VALUES (?, ?, ?)',
    )
    .run(dogId, Date.now(), location ?? null);
  return Number(result.lastInsertRowid);
}

export async function addSet(input: {
  workoutId: number;
  dogCommandId: number;
  repsAttempted: number;
  repsSuccess: number;
  distractionLevel: number;
}): Promise<void> {
  const { workoutId, dogCommandId, repsAttempted, repsSuccess, distractionLevel } = input;
  const now = Date.now();
  const tx = db.transaction(() => {
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
  });
  tx();
}

export async function finishWorkout(workoutId: number, durationSeconds: number, notes?: string): Promise<void> {
  db.prepare(
    'UPDATE workouts SET total_duration = ?, notes = ? WHERE id = ?',
  ).run(durationSeconds, notes ?? null, workoutId);
  revalidatePath('/');
  redirect('/');
}
