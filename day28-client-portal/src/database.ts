import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'client-portal.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Clients / organizations
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    industry TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    onboarded_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Projects for each client
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'in_progress',
    start_date TEXT NOT NULL,
    target_date TEXT,
    completed_date TEXT,
    budget REAL,
    spent REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Milestones / deliverables within a project
  CREATE TABLE IF NOT EXISTS deliverables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    due_date TEXT,
    completed_date TEXT,
    approval_status TEXT NOT NULL DEFAULT 'pending',
    approved_by TEXT,
    approved_at TEXT
  );

  -- Invoices
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    project_id INTEGER REFERENCES projects(id),
    invoice_number TEXT NOT NULL UNIQUE,
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    issued_date TEXT,
    due_date TEXT,
    paid_date TEXT,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Messages / communications
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    project_id INTEGER REFERENCES projects(id),
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Activity log
  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    project_id INTEGER REFERENCES projects(id),
    action TEXT NOT NULL,
    details TEXT,
    actor TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;
