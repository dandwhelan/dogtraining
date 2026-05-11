import 'server-only';
import type Database from 'better-sqlite3';

// Database starts empty. All dogs, master sets, commands, and assignments
// are created by the user via the management UI. This function is kept as a
// no-op so existing call sites in db.ts remain valid.
export function seed(_db: Database.Database): void {
  return;
}
