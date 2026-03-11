import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'cicd.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Projects / repositories
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    repo_url TEXT NOT NULL,
    default_branch TEXT NOT NULL DEFAULT 'main',
    language TEXT NOT NULL,
    team TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active'
  );

  -- CI/CD pipelines
  CREATE TABLE IF NOT EXISTS pipelines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL DEFAULT 'push',
    config_file TEXT NOT NULL DEFAULT '.github/workflows/ci.yml'
  );

  -- Pipeline runs (builds)
  CREATE TABLE IF NOT EXISTS builds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pipeline_id INTEGER NOT NULL REFERENCES pipelines(id),
    project_id INTEGER NOT NULL REFERENCES projects(id),
    branch TEXT NOT NULL,
    commit_sha TEXT NOT NULL,
    commit_message TEXT NOT NULL,
    author TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TEXT NOT NULL,
    finished_at TEXT,
    duration_seconds INTEGER,
    trigger TEXT NOT NULL DEFAULT 'push'
  );

  -- Build stages (steps within a build)
  CREATE TABLE IF NOT EXISTS build_stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    build_id INTEGER NOT NULL REFERENCES builds(id),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TEXT,
    finished_at TEXT,
    duration_seconds INTEGER,
    log_summary TEXT
  );

  -- Deployments
  CREATE TABLE IF NOT EXISTS deployments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    build_id INTEGER REFERENCES builds(id),
    environment TEXT NOT NULL DEFAULT 'production',
    status TEXT NOT NULL DEFAULT 'pending',
    deployed_at TEXT NOT NULL,
    deployed_by TEXT NOT NULL,
    version TEXT,
    rollback_of INTEGER REFERENCES deployments(id)
  );

  -- Uptime checks
  CREATE TABLE IF NOT EXISTS uptime_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    environment TEXT NOT NULL DEFAULT 'production',
    checked_at TEXT NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    is_healthy INTEGER NOT NULL DEFAULT 1
  );
`);

export default db;
