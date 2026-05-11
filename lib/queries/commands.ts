import 'server-only';
import { db } from '../db';

export type DogCommandRow = {
  dog_command_id: number;
  command_id: number;
  set_id: number;
  set_name: string;
  command_name: string;
  custom_cue: string | null;
  total_attempted: number;
  total_successes: number;
  last_trained_date: number | null;
};

export function getDogCommands(dogId: number): DogCommandRow[] {
  return db
    .prepare(
      `SELECT dc.id AS dog_command_id, mc.id AS command_id, ms.id AS set_id,
              ms.set_name AS set_name, mc.default_name AS command_name,
              dc.custom_cue, dc.total_attempted, dc.total_successes,
              dc.last_trained_date
       FROM dog_commands dc
       JOIN master_commands mc ON mc.id = dc.command_id
       JOIN master_sets ms ON ms.id = mc.set_id
       WHERE dc.dog_id = ?
       ORDER BY ms.set_name, mc.default_name`,
    )
    .all(dogId) as DogCommandRow[];
}
