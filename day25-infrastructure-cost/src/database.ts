import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'infrastructure.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Cloud providers (AWS, GCP, Azure, etc.)
  CREATE TABLE IF NOT EXISTS providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    monthly_budget REAL NOT NULL DEFAULT 0
  );

  -- Services within each provider (EC2, S3, Cloud Run, etc.)
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL REFERENCES providers(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'compute',
    description TEXT
  );

  -- Daily cost records per service
  CREATE TABLE IF NOT EXISTS cost_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL REFERENCES services(id),
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    usage_quantity REAL,
    usage_unit TEXT
  );

  -- Monthly budgets per provider
  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL REFERENCES providers(id),
    month TEXT NOT NULL,
    budget REAL NOT NULL,
    actual REAL NOT NULL DEFAULT 0,
    forecast REAL
  );

  -- Cost anomalies detected
  CREATE TABLE IF NOT EXISTS anomalies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL REFERENCES services(id),
    date TEXT NOT NULL,
    expected_amount REAL NOT NULL,
    actual_amount REAL NOT NULL,
    deviation_pct REAL NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium',
    resolved INTEGER NOT NULL DEFAULT 0,
    notes TEXT
  );

  -- Monthly forecasts
  CREATE TABLE IF NOT EXISTS forecasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL REFERENCES providers(id),
    month TEXT NOT NULL,
    predicted_amount REAL NOT NULL,
    confidence_low REAL NOT NULL,
    confidence_high REAL NOT NULL,
    method TEXT NOT NULL DEFAULT 'linear_trend'
  );
`);

export default db;
