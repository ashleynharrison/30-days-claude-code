import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(import.meta.dirname, '..', 'data', 'documents.db');

let db: DatabaseType;

export function getDb(): DatabaseType {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDb(): DatabaseType {
  const database = new Database(DB_PATH);
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');

  database.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      doc_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      file_name TEXT NOT NULL,
      upload_date TEXT NOT NULL,
      effective_date TEXT,
      expiration_date TEXT,
      total_pages INTEGER DEFAULT 1,
      summary TEXT
    );

    CREATE TABLE IF NOT EXISTS parties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      entity_type TEXT,
      contact_email TEXT,
      FOREIGN KEY (document_id) REFERENCES documents(id)
    );

    CREATE TABLE IF NOT EXISTS key_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      date TEXT NOT NULL,
      is_deadline INTEGER DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (document_id) REFERENCES documents(id)
    );

    CREATE TABLE IF NOT EXISTS obligations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      party_name TEXT NOT NULL,
      description TEXT NOT NULL,
      obligation_type TEXT NOT NULL,
      section_ref TEXT,
      status TEXT DEFAULT 'active',
      due_date TEXT,
      FOREIGN KEY (document_id) REFERENCES documents(id)
    );

    CREATE TABLE IF NOT EXISTS clauses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      clause_type TEXT NOT NULL,
      section_ref TEXT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      full_text TEXT,
      risk_level TEXT DEFAULT 'low',
      FOREIGN KEY (document_id) REFERENCES documents(id)
    );

    CREATE TABLE IF NOT EXISTS red_flags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      severity TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      section_ref TEXT,
      recommendation TEXT,
      FOREIGN KEY (document_id) REFERENCES documents(id)
    );
  `);

  return database;
}
