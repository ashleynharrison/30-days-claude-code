import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'intake.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Clients (prospective and onboarded)
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    company TEXT,
    referral_source TEXT,
    status TEXT NOT NULL DEFAULT 'prospect',
    practice_area TEXT NOT NULL,
    assigned_attorney TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    onboarded_at TEXT,
    notes TEXT
  );

  -- Intake forms submitted by prospects
  CREATE TABLE IF NOT EXISTS intake_forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    form_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted',
    submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
    reviewed_at TEXT,
    reviewed_by TEXT,
    data TEXT NOT NULL,
    flags TEXT,
    notes TEXT
  );

  -- Conflict checks
  CREATE TABLE IF NOT EXISTS conflict_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    checked_by TEXT NOT NULL,
    checked_at TEXT NOT NULL DEFAULT (datetime('now')),
    status TEXT NOT NULL DEFAULT 'pending',
    conflicts_found INTEGER NOT NULL DEFAULT 0,
    conflicting_parties TEXT,
    conflicting_matters TEXT,
    resolution TEXT,
    notes TEXT
  );

  -- Engagement letters
  CREATE TABLE IF NOT EXISTS engagements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    engagement_type TEXT NOT NULL,
    scope TEXT NOT NULL,
    fee_structure TEXT NOT NULL,
    retainer_amount REAL,
    hourly_rate REAL,
    flat_fee REAL,
    status TEXT NOT NULL DEFAULT 'draft',
    sent_at TEXT,
    signed_at TEXT,
    expires_at TEXT,
    notes TEXT
  );

  -- Intake workflow steps
  CREATE TABLE IF NOT EXISTS workflow_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    step_name TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    assigned_to TEXT,
    due_date TEXT,
    completed_at TEXT,
    notes TEXT
  );

  -- Documents collected during intake
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    doc_type TEXT NOT NULL,
    filename TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_review',
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
    reviewed_at TEXT,
    reviewed_by TEXT,
    notes TEXT
  );
`);

export default db;
