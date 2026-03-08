import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'auth-rls.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Applications / projects
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    auth_provider TEXT NOT NULL DEFAULT 'supabase',
    mfa_enabled INTEGER NOT NULL DEFAULT 0,
    session_lifetime_hours INTEGER NOT NULL DEFAULT 24,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Roles
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    name TEXT NOT NULL,
    description TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Permissions
  CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT
  );

  -- Role-permission mappings
  CREATE TABLE IF NOT EXISTS role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    permission_id INTEGER NOT NULL REFERENCES permissions(id),
    conditions TEXT,
    UNIQUE(role_id, permission_id)
  );

  -- RLS policies
  CREATE TABLE IF NOT EXISTS rls_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    table_name TEXT NOT NULL,
    policy_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    role_name TEXT NOT NULL DEFAULT 'authenticated',
    using_expression TEXT,
    check_expression TEXT,
    description TEXT,
    enabled INTEGER NOT NULL DEFAULT 1
  );

  -- Users (demo users with roles)
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    email TEXT NOT NULL,
    display_name TEXT,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    status TEXT NOT NULL DEFAULT 'active',
    mfa_enrolled INTEGER NOT NULL DEFAULT 0,
    last_sign_in TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Auth events / audit log
  CREATE TABLE IF NOT EXISTS auth_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    user_id INTEGER REFERENCES users(id),
    event_type TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;
