import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'sentiment.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Sources (e.g., Google Reviews, Yelp, TripAdvisor, internal surveys)
  CREATE TABLE IF NOT EXISTS sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'review_platform',
    url TEXT
  );

  -- Businesses being tracked
  CREATE TABLE IF NOT EXISTS businesses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    industry TEXT NOT NULL DEFAULT 'hospitality',
    location TEXT
  );

  -- Individual reviews / feedback entries
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id INTEGER NOT NULL REFERENCES businesses(id),
    source_id INTEGER NOT NULL REFERENCES sources(id),
    author TEXT,
    rating INTEGER,
    text TEXT NOT NULL,
    date TEXT NOT NULL,
    sentiment_score REAL,
    sentiment_label TEXT,
    language TEXT DEFAULT 'en'
  );

  -- Extracted themes / topics from reviews
  CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id INTEGER NOT NULL REFERENCES businesses(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    mention_count INTEGER NOT NULL DEFAULT 0,
    avg_sentiment REAL NOT NULL DEFAULT 0,
    trend TEXT DEFAULT 'stable'
  );

  -- Theme-review mapping (which reviews mention which themes)
  CREATE TABLE IF NOT EXISTS review_themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER NOT NULL REFERENCES reviews(id),
    theme_id INTEGER NOT NULL REFERENCES themes(id),
    relevance REAL NOT NULL DEFAULT 1.0
  );

  -- Sentiment snapshots over time (weekly aggregates)
  CREATE TABLE IF NOT EXISTS sentiment_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id INTEGER NOT NULL REFERENCES businesses(id),
    week_start TEXT NOT NULL,
    avg_sentiment REAL NOT NULL,
    review_count INTEGER NOT NULL,
    positive_pct REAL NOT NULL DEFAULT 0,
    neutral_pct REAL NOT NULL DEFAULT 0,
    negative_pct REAL NOT NULL DEFAULT 0,
    top_positive_theme TEXT,
    top_negative_theme TEXT
  );
`);

export default db;
