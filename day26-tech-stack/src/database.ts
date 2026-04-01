import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'tech-stack.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Technology options (frameworks, databases, hosting, etc.)
  CREATE TABLE IF NOT EXISTS technologies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    license TEXT NOT NULL DEFAULT 'open-source',
    maturity TEXT NOT NULL DEFAULT 'stable',
    learning_curve TEXT NOT NULL DEFAULT 'medium',
    community_size TEXT NOT NULL DEFAULT 'medium',
    github_stars INTEGER DEFAULT 0,
    weekly_npm_downloads INTEGER DEFAULT 0,
    description TEXT
  );

  -- Evaluation criteria and weights
  CREATE TABLE IF NOT EXISTS criteria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    default_weight REAL NOT NULL DEFAULT 1.0
  );

  -- Technology scores against criteria
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technology_id INTEGER NOT NULL REFERENCES technologies(id),
    criteria_id INTEGER NOT NULL REFERENCES criteria(id),
    score REAL NOT NULL,
    notes TEXT,
    UNIQUE(technology_id, criteria_id)
  );

  -- Decision projects (a team evaluating stacks)
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    team_size INTEGER NOT NULL DEFAULT 5,
    budget TEXT NOT NULL DEFAULT 'medium',
    timeline TEXT NOT NULL DEFAULT 'medium',
    priority TEXT NOT NULL DEFAULT 'balanced',
    industry TEXT,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Project-specific technology recommendations
  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    technology_id INTEGER NOT NULL REFERENCES technologies(id),
    category TEXT NOT NULL,
    rank INTEGER NOT NULL DEFAULT 1,
    weighted_score REAL NOT NULL,
    rationale TEXT,
    tradeoffs TEXT
  );

  -- Compatibility matrix between technologies
  CREATE TABLE IF NOT EXISTS compatibility (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tech_a_id INTEGER NOT NULL REFERENCES technologies(id),
    tech_b_id INTEGER NOT NULL REFERENCES technologies(id),
    score REAL NOT NULL,
    notes TEXT,
    UNIQUE(tech_a_id, tech_b_id)
  );
`);

export default db;
