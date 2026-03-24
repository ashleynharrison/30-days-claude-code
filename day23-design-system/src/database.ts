import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'design-system.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Design tokens (colors, spacing, typography, shadows, radii)
  CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    dark_value TEXT,
    description TEXT,
    css_variable TEXT NOT NULL,
    figma_ref TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(category, name)
  );

  -- Components in the design system
  CREATE TABLE IF NOT EXISTS components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    figma_url TEXT,
    storybook_url TEXT,
    owner TEXT NOT NULL,
    accessibility_score REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Component variants (size, color, state)
  CREATE TABLE IF NOT EXISTS variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    component_id INTEGER NOT NULL REFERENCES components(id),
    name TEXT NOT NULL,
    props TEXT NOT NULL,
    description TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    UNIQUE(component_id, name)
  );

  -- Component accessibility checklist
  CREATE TABLE IF NOT EXISTS accessibility_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    component_id INTEGER NOT NULL REFERENCES components(id),
    check_type TEXT NOT NULL,
    description TEXT NOT NULL,
    passed INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    checked_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Component dependencies (which tokens/components it uses)
  CREATE TABLE IF NOT EXISTS dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    component_id INTEGER NOT NULL REFERENCES components(id),
    depends_on_type TEXT NOT NULL,
    depends_on_name TEXT NOT NULL,
    relationship TEXT NOT NULL DEFAULT 'uses'
  );

  -- Design system changelog
  CREATE TABLE IF NOT EXISTS changelog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    component_id INTEGER REFERENCES components(id),
    token_id INTEGER REFERENCES tokens(id),
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    author TEXT NOT NULL,
    version TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;
