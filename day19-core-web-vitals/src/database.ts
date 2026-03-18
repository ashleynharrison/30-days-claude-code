import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'core-web-vitals.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Sites being monitored
  CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL,
    owner TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Core Web Vitals measurements over time
  CREATE TABLE IF NOT EXISTS measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL REFERENCES sites(id),
    lcp_ms REAL NOT NULL,
    cls REAL NOT NULL,
    inp_ms REAL NOT NULL,
    fcp_ms REAL,
    ttfb_ms REAL,
    speed_index REAL,
    total_blocking_time_ms REAL,
    device TEXT NOT NULL DEFAULT 'mobile',
    measured_at TEXT NOT NULL,
    notes TEXT
  );

  -- Performance budgets and thresholds
  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL REFERENCES sites(id),
    metric TEXT NOT NULL,
    threshold_good REAL NOT NULL,
    threshold_poor REAL NOT NULL,
    current_value REAL,
    status TEXT NOT NULL DEFAULT 'passing',
    updated_at TEXT NOT NULL
  );

  -- Optimization recommendations
  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL REFERENCES sites(id),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    impact TEXT NOT NULL DEFAULT 'medium',
    effort TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    estimated_savings_ms REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Alerts triggered when metrics cross thresholds
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL REFERENCES sites(id),
    metric TEXT NOT NULL,
    value REAL NOT NULL,
    threshold REAL NOT NULL,
    severity TEXT NOT NULL DEFAULT 'warning',
    message TEXT NOT NULL,
    acknowledged INTEGER NOT NULL DEFAULT 0,
    triggered_at TEXT NOT NULL
  );

  -- Resource breakdown per page
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL REFERENCES sites(id),
    resource_type TEXT NOT NULL,
    url TEXT NOT NULL,
    size_kb REAL NOT NULL,
    load_time_ms REAL,
    blocking INTEGER NOT NULL DEFAULT 0,
    page_path TEXT NOT NULL DEFAULT '/',
    recorded_at TEXT NOT NULL
  );
`);

export default db;
