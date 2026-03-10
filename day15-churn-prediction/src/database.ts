import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'churn.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Customers
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    plan TEXT NOT NULL DEFAULT 'starter',
    mrr REAL NOT NULL DEFAULT 0,
    signup_date TEXT NOT NULL,
    last_login TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    industry TEXT,
    employee_count INTEGER
  );

  -- Usage metrics (weekly snapshots)
  CREATE TABLE IF NOT EXISTS usage_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    week_start TEXT NOT NULL,
    logins INTEGER NOT NULL DEFAULT 0,
    api_calls INTEGER NOT NULL DEFAULT 0,
    features_used INTEGER NOT NULL DEFAULT 0,
    active_users INTEGER NOT NULL DEFAULT 0,
    session_minutes REAL NOT NULL DEFAULT 0
  );

  -- Billing events
  CREATE TABLE IF NOT EXISTS billing_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    event_type TEXT NOT NULL,
    date TEXT NOT NULL,
    amount REAL,
    details TEXT
  );

  -- Support tickets
  CREATE TABLE IF NOT EXISTS support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    subject TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL,
    resolved_at TEXT,
    satisfaction_score INTEGER
  );

  -- Churn risk scores (computed and stored for history)
  CREATE TABLE IF NOT EXISTS risk_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    score REAL NOT NULL,
    risk_level TEXT NOT NULL,
    computed_at TEXT NOT NULL DEFAULT (datetime('now')),
    usage_signal REAL NOT NULL DEFAULT 0,
    billing_signal REAL NOT NULL DEFAULT 0,
    support_signal REAL NOT NULL DEFAULT 0,
    engagement_signal REAL NOT NULL DEFAULT 0,
    top_factors TEXT
  );
`);

export default db;
