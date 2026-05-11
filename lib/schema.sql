PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS dogs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  breed       TEXT,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  weight                TEXT,
  dietary_restrictions  TEXT,
  fav_toy               TEXT,
  least_fav_toy         TEXT,
  fav_games             TEXT,
  least_fav_games       TEXT,
  best_traits           TEXT,
  worst_traits          TEXT,
  birthday              TEXT,
  gotcha_day            TEXT,
  microchip_number      TEXT,
  vet_contact           TEXT,
  medical_info          TEXT,
  profile_picture       TEXT
);

CREATE TABLE IF NOT EXISTS master_sets (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  set_name  TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS master_commands (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  set_id        INTEGER NOT NULL REFERENCES master_sets(id) ON DELETE CASCADE,
  default_name  TEXT NOT NULL,
  UNIQUE (set_id, default_name)
);

CREATE TABLE IF NOT EXISTS dog_commands (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  dog_id             INTEGER NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  command_id         INTEGER NOT NULL REFERENCES master_commands(id) ON DELETE CASCADE,
  custom_cue         TEXT,
  total_attempted    INTEGER NOT NULL DEFAULT 0,
  total_successes    INTEGER NOT NULL DEFAULT 0,
  last_trained_date  INTEGER,
  UNIQUE (dog_id, command_id)
);
CREATE INDEX IF NOT EXISTS idx_dog_commands_dog ON dog_commands(dog_id);

CREATE TABLE IF NOT EXISTS workouts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  dog_id          INTEGER NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  date_time       INTEGER NOT NULL,
  location        TEXT,
  total_duration  INTEGER,
  notes           TEXT
);
CREATE INDEX IF NOT EXISTS idx_workouts_dog_date ON workouts(dog_id, date_time);

CREATE TABLE IF NOT EXISTS sets (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id         INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  dog_command_id     INTEGER NOT NULL REFERENCES dog_commands(id) ON DELETE CASCADE,
  reps_attempted     INTEGER NOT NULL,
  reps_success       INTEGER NOT NULL,
  distraction_level  INTEGER NOT NULL CHECK (distraction_level BETWEEN 0 AND 3)
);
CREATE INDEX IF NOT EXISTS idx_sets_workout ON sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_sets_dog_command ON sets(dog_command_id);
