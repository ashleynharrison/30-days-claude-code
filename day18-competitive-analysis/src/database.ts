import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'competitive-analysis.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Competitors
  CREATE TABLE IF NOT EXISTS competitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    website TEXT NOT NULL,
    category TEXT NOT NULL,
    founded_year INTEGER,
    hq_location TEXT,
    employee_count TEXT,
    funding_total TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Pricing tiers tracked over time
  CREATE TABLE IF NOT EXISTS pricing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competitor_id INTEGER NOT NULL REFERENCES competitors(id),
    tier_name TEXT NOT NULL,
    price_monthly REAL,
    price_annual REAL,
    billing_model TEXT NOT NULL DEFAULT 'per_seat',
    key_limits TEXT,
    recorded_date TEXT NOT NULL,
    notes TEXT
  );

  -- Feature comparison matrix
  CREATE TABLE IF NOT EXISTS features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competitor_id INTEGER NOT NULL REFERENCES competitors(id),
    feature_category TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    supported INTEGER NOT NULL DEFAULT 0,
    maturity TEXT DEFAULT 'unknown',
    notes TEXT,
    recorded_date TEXT NOT NULL
  );

  -- Market moves and announcements
  CREATE TABLE IF NOT EXISTS market_moves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competitor_id INTEGER NOT NULL REFERENCES competitors(id),
    move_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    impact TEXT DEFAULT 'medium',
    source_url TEXT,
    move_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Positioning and messaging snapshots
  CREATE TABLE IF NOT EXISTS positioning (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competitor_id INTEGER NOT NULL REFERENCES competitors(id),
    tagline TEXT,
    target_audience TEXT,
    value_proposition TEXT,
    differentiators TEXT,
    tone TEXT,
    recorded_date TEXT NOT NULL
  );

  -- Win/loss tracking
  CREATE TABLE IF NOT EXISTS win_loss (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competitor_id INTEGER NOT NULL REFERENCES competitors(id),
    deal_name TEXT NOT NULL,
    outcome TEXT NOT NULL,
    deal_size TEXT,
    industry TEXT,
    reason TEXT,
    notes TEXT,
    deal_date TEXT NOT NULL
  );
`);

export default db;
