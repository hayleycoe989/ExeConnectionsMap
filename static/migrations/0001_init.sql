CREATE TABLE IF NOT EXISTS stakeholders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  link TEXT,
  categories TEXT NOT NULL DEFAULT '[]',
  lsoa_codes TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);
