import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'wealth-management.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Clients (high-net-worth individuals / families)
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    risk_profile TEXT NOT NULL,
    investment_goal TEXT NOT NULL,
    advisor TEXT NOT NULL,
    total_invested REAL NOT NULL DEFAULT 0,
    notes TEXT,
    onboarded_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Investment accounts (brokerage, IRA, 401k, trust, etc.)
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    custodian TEXT NOT NULL,
    account_number TEXT NOT NULL,
    cash_balance REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    opened_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Holdings (individual positions per account)
  CREATE TABLE IF NOT EXISTS holdings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    asset_class TEXT NOT NULL,
    sector TEXT,
    shares REAL NOT NULL,
    cost_basis REAL NOT NULL,
    current_price REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD'
  );

  -- Transactions (buy, sell, dividend, deposit, withdrawal, fee)
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    holding_id INTEGER REFERENCES holdings(id),
    type TEXT NOT NULL,
    symbol TEXT,
    shares REAL,
    price REAL,
    amount REAL NOT NULL,
    fee REAL NOT NULL DEFAULT 0,
    executed_at TEXT NOT NULL DEFAULT (datetime('now')),
    notes TEXT
  );

  -- Model portfolios / target allocations
  CREATE TABLE IF NOT EXISTS model_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    risk_profile TEXT NOT NULL,
    asset_class TEXT NOT NULL,
    target_pct REAL NOT NULL,
    min_pct REAL NOT NULL,
    max_pct REAL NOT NULL
  );

  -- Portfolio alerts
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    account_id INTEGER REFERENCES accounts(id),
    type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    resolved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    resolved_at TEXT
  );
`);

export default db;
