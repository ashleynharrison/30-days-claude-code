import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'education.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Instructors
  CREATE TABLE IF NOT EXISTS instructors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    department TEXT NOT NULL,
    title TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Courses
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    instructor_id INTEGER NOT NULL REFERENCES instructors(id),
    level TEXT NOT NULL DEFAULT 'beginner',
    max_students INTEGER NOT NULL DEFAULT 30,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    schedule TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    description TEXT
  );

  -- Students
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    student_id TEXT NOT NULL UNIQUE,
    major TEXT,
    year TEXT NOT NULL DEFAULT 'freshman',
    gpa REAL,
    status TEXT NOT NULL DEFAULT 'active',
    enrolled_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Enrollments
  CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id),
    course_id INTEGER NOT NULL REFERENCES courses(id),
    enrolled_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'enrolled',
    current_grade REAL,
    attendance_pct REAL NOT NULL DEFAULT 100,
    last_activity TEXT
  );

  -- Assignments
  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'homework',
    due_date TEXT NOT NULL,
    max_points REAL NOT NULL DEFAULT 100,
    weight REAL NOT NULL DEFAULT 1.0,
    description TEXT
  );

  -- Submissions
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER NOT NULL REFERENCES assignments(id),
    student_id INTEGER NOT NULL REFERENCES students(id),
    submitted_date TEXT,
    score REAL,
    status TEXT NOT NULL DEFAULT 'pending',
    feedback TEXT
  );
`);

export default db;
