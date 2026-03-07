import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'lighthouse.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Sites being monitored
  CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    owner TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Audit runs (each Lighthouse scan)
  CREATE TABLE IF NOT EXISTS audits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL REFERENCES sites(id),
    run_at TEXT NOT NULL DEFAULT (datetime('now')),
    device TEXT NOT NULL DEFAULT 'mobile',
    performance_score INTEGER NOT NULL,
    accessibility_score INTEGER NOT NULL,
    best_practices_score INTEGER NOT NULL,
    seo_score INTEGER NOT NULL,
    fcp_ms REAL,
    lcp_ms REAL,
    cls REAL,
    tbt_ms REAL,
    si_ms REAL,
    tti_ms REAL,
    total_byte_weight INTEGER,
    dom_size INTEGER,
    request_count INTEGER
  );

  -- Individual audit findings/opportunities
  CREATE TABLE IF NOT EXISTS findings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_id INTEGER NOT NULL REFERENCES audits(id),
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    savings_ms REAL,
    savings_bytes INTEGER,
    element TEXT,
    recommendation TEXT NOT NULL
  );

  -- Performance budgets
  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL REFERENCES sites(id),
    metric TEXT NOT NULL,
    budget_value REAL NOT NULL,
    unit TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'within_budget'
  );

  -- Historical score trends (weekly snapshots)
  CREATE TABLE IF NOT EXISTS trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL REFERENCES sites(id),
    week_of TEXT NOT NULL,
    device TEXT NOT NULL DEFAULT 'mobile',
    avg_performance INTEGER,
    avg_accessibility INTEGER,
    avg_best_practices INTEGER,
    avg_seo INTEGER,
    avg_lcp_ms REAL,
    avg_cls REAL,
    avg_fcp_ms REAL
  );

  -- Optimization tasks
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL REFERENCES sites(id),
    finding_id INTEGER REFERENCES findings(id),
    title TEXT NOT NULL,
    priority TEXT NOT NULL,
    category TEXT NOT NULL,
    estimated_impact TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    assigned_to TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
  );
`);

export default db;
