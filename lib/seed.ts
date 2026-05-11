import 'server-only';
import type Database from 'better-sqlite3';

type SeedSet = { name: string; commands: string[] };

const SEED_SETS: SeedSet[] = [
  { name: 'Canicross', commands: ['Hike', 'Gee', 'Haw', 'Whoa'] },
  { name: 'Scentwork', commands: ['Find It', 'Show Me'] },
  { name: 'Obedience', commands: ['Sit', 'Down', 'Stay', 'Recall'] },
];

const SEED_DOGS: { name: string; breed: string }[] = [
  { name: 'Bean', breed: 'Border Collie' },
  { name: 'Kiwi', breed: 'Cocker Spaniel' },
];

export function seed(db: Database.Database): void {
  const dogCount = db.prepare('SELECT COUNT(*) AS n FROM dogs').get() as { n: number };
  if (dogCount.n > 0) return;

  const insertDog = db.prepare('INSERT INTO dogs (name, breed) VALUES (?, ?)');
  const insertSet = db.prepare('INSERT INTO master_sets (set_name) VALUES (?)');
  const insertCmd = db.prepare(
    'INSERT INTO master_commands (set_id, default_name) VALUES (?, ?)',
  );
  const insertDogCmd = db.prepare(
    'INSERT INTO dog_commands (dog_id, command_id) VALUES (?, ?)',
  );

  const tx = db.transaction(() => {
    const dogIds = SEED_DOGS.map((d) => insertDog.run(d.name, d.breed).lastInsertRowid as number);
    const commandIds: number[] = [];
    for (const set of SEED_SETS) {
      const setId = insertSet.run(set.name).lastInsertRowid as number;
      for (const cmd of set.commands) {
        commandIds.push(insertCmd.run(setId, cmd).lastInsertRowid as number);
      }
    }
    for (const dogId of dogIds) {
      for (const cmdId of commandIds) {
        insertDogCmd.run(dogId, cmdId);
      }
    }
  });
  tx();
}
