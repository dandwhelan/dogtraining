import 'server-only';
import { db } from '../db';
import { levelFor, nextLevelThreshold } from '../leveling';
import { currentStreak, heatmapBuckets, type HeatmapDay } from '../streaks';

export function calculateDogAge(birthday: string | null): { humanYears: number; dogYears: number } | null {
  if (!birthday) return null;
  const bdate = new Date(birthday);
  if (isNaN(bdate.getTime())) return null;

  const diffMs = Date.now() - bdate.getTime();
  const ageDate = new Date(diffMs);
  const humanYears = Math.abs(ageDate.getUTCFullYear() - 1970);

  let dogYears = 0;
  if (humanYears >= 1) dogYears += 15;
  if (humanYears >= 2) dogYears += 9;
  if (humanYears > 2) dogYears += (humanYears - 2) * 5;
  
  // Basic fractional dog year approximation for < 1 yr
  if (humanYears === 0) {
    const months = ageDate.getUTCMonth();
    dogYears = Math.floor((months / 12) * 15);
  }

  return { humanYears, dogYears };
}

export type Dog = {
  id: number;
  name: string;
  breed: string | null;
  created_at: number;
  weight: string | null;
  dietary_restrictions: string | null;
  fav_toy: string | null;
  least_fav_toy: string | null;
  fav_games: string | null;
  least_fav_games: string | null;
  best_traits: string | null;
  worst_traits: string | null;
  birthday: string | null;
  gotcha_day: string | null;
  microchip_number: string | null;
  vet_contact: string | null;
  medical_info: string | null;
  profile_picture: string | null;
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
    .prepare('SELECT * FROM dogs ORDER BY id')
    .all() as Dog[];
}

export function getDogSummary(dogId: number): DogSummary {
  const dog = db
    .prepare('SELECT * FROM dogs WHERE id = ?')
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
