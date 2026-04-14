import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'healthcare-intake.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Patients
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    preferred_language TEXT DEFAULT 'English',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Intake forms (the core workflow unit)
  CREATE TABLE IF NOT EXISTS intake_forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    form_type TEXT NOT NULL, -- 'new_patient', 'annual_update', 'specialist_referral'
    status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, submitted, reviewed, completed
    reason_for_visit TEXT,
    symptoms TEXT,
    current_medications TEXT,
    allergies TEXT,
    medical_history TEXT,
    family_history TEXT,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    submitted_at TEXT,
    reviewed_at TEXT,
    reviewed_by TEXT,
    flags TEXT -- JSON array of clinical flags
  );

  -- Insurance
  CREATE TABLE IF NOT EXISTS insurance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    provider TEXT NOT NULL,
    policy_number TEXT NOT NULL,
    group_number TEXT,
    plan_type TEXT, -- HMO, PPO, EPO, Medicare, Medicaid
    verification_status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, denied, expired
    verified_at TEXT,
    copay REAL,
    deductible_met REAL,
    deductible_total REAL,
    effective_date TEXT,
    termination_date TEXT,
    notes TEXT
  );

  -- Appointments
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    intake_form_id INTEGER REFERENCES intake_forms(id),
    provider TEXT NOT NULL,
    appointment_type TEXT NOT NULL, -- new_patient, follow_up, annual, consultation, telehealth
    scheduled_at TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, confirmed, checked_in, completed, cancelled, no_show
    location TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Consent records (HIPAA, treatment, telehealth, etc.)
  CREATE TABLE IF NOT EXISTS consents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    consent_type TEXT NOT NULL, -- hipaa_privacy, treatment, telehealth, release_of_records, financial
    status TEXT NOT NULL DEFAULT 'pending', -- pending, signed, declined, expired
    signed_at TEXT,
    signed_by TEXT,
    expires_at TEXT,
    document_version TEXT,
    notes TEXT
  );

  -- Activity / audit log
  CREATE TABLE IF NOT EXISTS intake_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    intake_form_id INTEGER REFERENCES intake_forms(id),
    action TEXT NOT NULL,
    details TEXT,
    actor TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;
