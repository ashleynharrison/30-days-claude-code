// ---------------------------------------------------------------------------
// Day 30 — The MCP Starter Kit
// ---------------------------------------------------------------------------
// This file is the starting point for your own MCP server. It demonstrates
// every pattern used across Days 1–29:
//
//   - SQLite with WAL mode and foreign keys
//   - A parent entity (contacts) + child entities (items, transactions)
//   - An activity/audit log table
//   - Computed fields (age_days, lifetime_value) expressed as SQL, not stored
//
// To customize: rename `contacts` to your primary entity, adjust the child
// tables, and update the seed data. The six tools in src/tools/ will keep
// working as long as the table names stay the same.
// ---------------------------------------------------------------------------

import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'starter-kit.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Primary entity. Rename this to "patients", "customers", "projects",
  -- "listings" — whatever your business actually tracks.
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    company TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- active, paused, archived
    tags TEXT, -- JSON array of strings
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Child entity #1 — the things a contact "has". Could be subscriptions,
  -- appointments, policies, properties, line items.
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL REFERENCES contacts(id),
    title TEXT NOT NULL,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, closed
    priority TEXT NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
    due_date TEXT,
    assignee TEXT,
    metadata TEXT, -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Child entity #2 — the things a contact "does". Could be payments,
  -- visits, orders, submissions.
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL REFERENCES contacts(id),
    item_id INTEGER REFERENCES items(id),
    kind TEXT NOT NULL, -- payment, refund, visit, submission, call
    amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed', -- pending, completed, failed
    occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
    notes TEXT
  );

  -- Audit log. Every MCP should have one. Don't skip this.
  CREATE TABLE IF NOT EXISTS activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER REFERENCES contacts(id),
    item_id INTEGER REFERENCES items(id),
    action TEXT NOT NULL,
    details TEXT,
    actor TEXT NOT NULL DEFAULT 'system',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;
