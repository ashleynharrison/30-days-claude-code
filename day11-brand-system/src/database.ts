import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'brands.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Brand projects
  CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    tagline TEXT,
    industry TEXT NOT NULL,
    personality TEXT NOT NULL,
    target_audience TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    notes TEXT
  );

  -- Color palettes
  CREATE TABLE IF NOT EXISTS color_palettes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand_id INTEGER NOT NULL REFERENCES brands(id),
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    hex TEXT NOT NULL,
    hsl TEXT,
    rgb TEXT,
    usage TEXT NOT NULL,
    contrast_on_white TEXT,
    contrast_on_black TEXT,
    wcag_aa_text INTEGER DEFAULT 0,
    wcag_aaa_text INTEGER DEFAULT 0
  );

  -- Typography systems
  CREATE TABLE IF NOT EXISTS typography (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand_id INTEGER NOT NULL REFERENCES brands(id),
    role TEXT NOT NULL,
    font_family TEXT NOT NULL,
    font_source TEXT NOT NULL,
    weight_range TEXT NOT NULL,
    fallback_stack TEXT NOT NULL,
    usage TEXT NOT NULL,
    pairing_rationale TEXT
  );

  -- Design tokens
  CREATE TABLE IF NOT EXISTS design_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand_id INTEGER NOT NULL REFERENCES brands(id),
    category TEXT NOT NULL,
    token_name TEXT NOT NULL,
    value TEXT NOT NULL,
    css_variable TEXT NOT NULL,
    description TEXT
  );

  -- Component specs
  CREATE TABLE IF NOT EXISTS component_specs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand_id INTEGER NOT NULL REFERENCES brands(id),
    component_name TEXT NOT NULL,
    variant TEXT NOT NULL DEFAULT 'default',
    properties TEXT NOT NULL,
    usage_guidelines TEXT,
    do_list TEXT,
    dont_list TEXT
  );

  -- Brand guidelines
  CREATE TABLE IF NOT EXISTS brand_guidelines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand_id INTEGER NOT NULL REFERENCES brands(id),
    section TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    examples TEXT,
    priority INTEGER NOT NULL DEFAULT 0
  );

  -- Style audit log
  CREATE TABLE IF NOT EXISTS style_audits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand_id INTEGER NOT NULL REFERENCES brands(id),
    audit_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    element TEXT NOT NULL,
    issue TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    auto_fixable INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;
