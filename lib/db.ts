import 'server-only';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { seed } from './seed';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'training.sqlite');
const SCHEMA_PATH = path.join(process.cwd(), 'lib', 'schema.sql');

declare global {
  // eslint-disable-next-line no-var
  var __dogtraining_db: Database.Database | undefined;
}

function init(): Database.Database {
  fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);
  seed(db);
  return db;
}

export const db: Database.Database = global.__dogtraining_db ?? init();
if (process.env.NODE_ENV !== 'production') {
  global.__dogtraining_db = db;
}
