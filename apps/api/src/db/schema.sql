-- HORTUS MANUS — local SQLite schema v1
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS specimens (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,
  season TEXT NOT NULL,
  seed INTEGER NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  lang TEXT NOT NULL DEFAULT 'zh',
  client_hash TEXT NOT NULL DEFAULT '',
  thanks INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 1,
  delete_token_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_specimens_created ON specimens(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_specimens_mode ON specimens(mode);
CREATE INDEX IF NOT EXISTS idx_specimens_season ON specimens(season);

CREATE TABLE IF NOT EXISTS thanks (
  specimen_id TEXT NOT NULL REFERENCES specimens(id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (specimen_id, visitor_hash)
);

CREATE TABLE IF NOT EXISTS editions (
  date TEXT PRIMARY KEY,
  seed INTEGER NOT NULL,
  mode TEXT NOT NULL,
  season TEXT NOT NULL,
  note_zh TEXT NOT NULL,
  note_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS telemetry (
  day TEXT NOT NULL,
  mode TEXT NOT NULL,
  event TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, mode, event)
);