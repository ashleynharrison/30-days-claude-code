import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'meeting-notes.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Team members / participants
  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'member',
    department TEXT
  );

  -- Meetings
  CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    meeting_type TEXT NOT NULL DEFAULT 'team_sync',
    date TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    organizer_id INTEGER NOT NULL REFERENCES participants(id),
    status TEXT NOT NULL DEFAULT 'completed',
    summary TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Meeting attendees (many-to-many)
  CREATE TABLE IF NOT EXISTS attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL REFERENCES meetings(id),
    participant_id INTEGER NOT NULL REFERENCES participants(id),
    attended INTEGER NOT NULL DEFAULT 1,
    UNIQUE(meeting_id, participant_id)
  );

  -- Action items extracted from meetings
  CREATE TABLE IF NOT EXISTS action_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL REFERENCES meetings(id),
    owner_id INTEGER NOT NULL REFERENCES participants(id),
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    due_date TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Key decisions recorded in meetings
  CREATE TABLE IF NOT EXISTS decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL REFERENCES meetings(id),
    description TEXT NOT NULL,
    context TEXT,
    decided_by TEXT,
    impact TEXT NOT NULL DEFAULT 'medium'
  );

  -- Meeting notes / transcript segments
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL REFERENCES meetings(id),
    speaker_id INTEGER REFERENCES participants(id),
    content TEXT NOT NULL,
    topic TEXT,
    timestamp_minutes INTEGER
  );
`);

export default db;
