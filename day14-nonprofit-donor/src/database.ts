import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'nonprofit.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Donors
  CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    type TEXT NOT NULL DEFAULT 'individual',
    giving_level TEXT NOT NULL DEFAULT 'general',
    first_gift_date TEXT,
    total_given REAL NOT NULL DEFAULT 0,
    largest_gift REAL NOT NULL DEFAULT 0,
    gift_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Campaigns
  CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    goal REAL NOT NULL,
    raised REAL NOT NULL DEFAULT 0,
    donor_count INTEGER NOT NULL DEFAULT 0,
    start_date TEXT NOT NULL,
    end_date TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    description TEXT
  );

  -- Donations
  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER NOT NULL REFERENCES donors(id),
    campaign_id INTEGER REFERENCES campaigns(id),
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'credit_card',
    designation TEXT,
    is_recurring INTEGER NOT NULL DEFAULT 0,
    receipt_sent INTEGER NOT NULL DEFAULT 1,
    notes TEXT
  );

  -- Grants
  CREATE TABLE IF NOT EXISTS grants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grantor TEXT NOT NULL,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    purpose TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    submitted_date TEXT,
    deadline TEXT,
    awarded_date TEXT,
    report_due TEXT,
    contact_name TEXT,
    contact_email TEXT,
    notes TEXT
  );

  -- Engagement / contact log
  CREATE TABLE IF NOT EXISTS engagements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER NOT NULL REFERENCES donors(id),
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    staff_member TEXT,
    subject TEXT,
    notes TEXT
  );

  -- Pledges
  CREATE TABLE IF NOT EXISTS pledges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER NOT NULL REFERENCES donors(id),
    campaign_id INTEGER REFERENCES campaigns(id),
    amount REAL NOT NULL,
    amount_paid REAL NOT NULL DEFAULT 0,
    frequency TEXT NOT NULL DEFAULT 'one_time',
    start_date TEXT NOT NULL,
    end_date TEXT,
    status TEXT NOT NULL DEFAULT 'active'
  );
`);

export default db;
