import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ai-proposal-writer.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Clients
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    industry TEXT NOT NULL,
    budget_range TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Service offerings
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    hourly_rate REAL NOT NULL,
    min_hours INTEGER NOT NULL DEFAULT 1,
    typical_hours INTEGER NOT NULL,
    deliverables TEXT NOT NULL
  );

  -- Proposal templates
  CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    sections TEXT NOT NULL,
    tone TEXT NOT NULL DEFAULT 'professional'
  );

  -- Proposals
  CREATE TABLE IF NOT EXISTS proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    template_id INTEGER REFERENCES templates(id),
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    total_hours INTEGER NOT NULL DEFAULT 0,
    total_cost REAL NOT NULL DEFAULT 0,
    timeline_weeks INTEGER NOT NULL DEFAULT 1,
    brief TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    sent_at TEXT,
    accepted_at TEXT
  );

  -- Proposal sections
  CREATE TABLE IF NOT EXISTS proposal_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_id INTEGER NOT NULL REFERENCES proposals(id),
    section_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    section_type TEXT NOT NULL
  );

  -- Proposal line items (scope & pricing)
  CREATE TABLE IF NOT EXISTS line_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_id INTEGER NOT NULL REFERENCES proposals(id),
    service_id INTEGER REFERENCES services(id),
    description TEXT NOT NULL,
    hours INTEGER NOT NULL,
    rate REAL NOT NULL,
    subtotal REAL NOT NULL
  );
`);

export default db;
