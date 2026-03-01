import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(__dirname, '..', 'data', 'fitness.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  const d = db!;
  d.exec(`
    CREATE TABLE IF NOT EXISTS instructors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      specialties TEXT NOT NULL,
      bio TEXT,
      hourly_rate REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive'))
    );

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      membership_type TEXT NOT NULL CHECK(membership_type IN ('unlimited_monthly','unlimited_annual','class_pack_10','class_pack_20','drop_in')),
      membership_price REAL NOT NULL,
      classes_remaining INTEGER,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','frozen','cancelled','expired')),
      join_date TEXT NOT NULL,
      renewal_date TEXT,
      last_visit TEXT,
      emergency_contact TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      class_type TEXT NOT NULL CHECK(class_type IN ('yoga','hiit','spin','strength','pilates','boxing','barre','meditation')),
      instructor_id INTEGER NOT NULL REFERENCES instructors(id),
      day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
      start_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      capacity INTEGER NOT NULL,
      room TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS class_instances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL REFERENCES classes(id),
      instance_date TEXT NOT NULL,
      instructor_id INTEGER REFERENCES instructors(id),
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','completed','cancelled')),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL REFERENCES members(id),
      class_instance_id INTEGER NOT NULL REFERENCES class_instances(id),
      status TEXT NOT NULL DEFAULT 'booked' CHECK(status IN ('booked','attended','no_show','cancelled','waitlisted')),
      booked_at TEXT NOT NULL DEFAULT (datetime('now')),
      checked_in_at TEXT
    );

    CREATE TABLE IF NOT EXISTS check_ins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL REFERENCES members(id),
      check_in_time TEXT NOT NULL DEFAULT (datetime('now')),
      check_out_time TEXT,
      type TEXT NOT NULL DEFAULT 'gym' CHECK(type IN ('gym','class','personal_training'))
    );
  `);
}

// --- Query helpers ---

export function searchMembers(filters: {
  name?: string;
  membership_type?: string;
  status?: string;
  joined_after?: string;
  joined_before?: string;
}): any[] {
  const d = getDb();
  let sql = `
    SELECT m.*,
      (SELECT COUNT(*) FROM bookings b
       JOIN class_instances ci ON b.class_instance_id = ci.id
       WHERE b.member_id = m.id AND b.status = 'attended'
       AND ci.instance_date >= date('now', '-30 days')) as classes_last_30d,
      (SELECT COUNT(*) FROM check_ins c
       WHERE c.member_id = m.id
       AND c.check_in_time >= datetime('now', '-30 days')) as checkins_last_30d
    FROM members m WHERE 1=1
  `;
  const params: any[] = [];

  if (filters.name) { sql += ' AND m.name LIKE ?'; params.push(`%${filters.name}%`); }
  if (filters.membership_type) { sql += ' AND m.membership_type = ?'; params.push(filters.membership_type); }
  if (filters.status) { sql += ' AND m.status = ?'; params.push(filters.status); }
  if (filters.joined_after) { sql += ' AND m.join_date >= ?'; params.push(filters.joined_after); }
  if (filters.joined_before) { sql += ' AND m.join_date <= ?'; params.push(filters.joined_before); }

  sql += ' ORDER BY m.name';
  return d.prepare(sql).all(...params);
}

export function getClassSchedule(filters: {
  date_from?: string;
  date_to?: string;
  class_type?: string;
  instructor_name?: string;
  day_of_week?: number;
}): any[] {
  const d = getDb();
  let sql = `
    SELECT ci.id as instance_id, ci.instance_date, ci.status as instance_status,
      c.name as class_name, c.class_type, c.start_time, c.duration_minutes, c.capacity, c.room,
      i.name as instructor_name,
      (SELECT COUNT(*) FROM bookings b WHERE b.class_instance_id = ci.id AND b.status IN ('booked','attended')) as booked_count,
      (SELECT COUNT(*) FROM bookings b WHERE b.class_instance_id = ci.id AND b.status = 'waitlisted') as waitlist_count
    FROM class_instances ci
    JOIN classes c ON ci.class_id = c.id
    JOIN instructors i ON COALESCE(ci.instructor_id, c.instructor_id) = i.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters.date_from) { sql += ' AND ci.instance_date >= ?'; params.push(filters.date_from); }
  if (filters.date_to) { sql += ' AND ci.instance_date <= ?'; params.push(filters.date_to); }
  if (filters.class_type) { sql += ' AND c.class_type = ?'; params.push(filters.class_type); }
  if (filters.instructor_name) { sql += ' AND i.name LIKE ?'; params.push(`%${filters.instructor_name}%`); }
  if (filters.day_of_week !== undefined) {
    sql += ' AND CAST(strftime("%w", ci.instance_date) AS INTEGER) = ?';
    params.push(filters.day_of_week);
  }

  sql += ' ORDER BY ci.instance_date, c.start_time';
  return d.prepare(sql).all(...params);
}

export function getAttendanceReport(filters: {
  date_from?: string;
  date_to?: string;
  class_type?: string;
}): any {
  const d = getDb();
  let whereClause = "WHERE ci.status = 'completed'";
  const params: any[] = [];

  if (filters.date_from) { whereClause += ' AND ci.instance_date >= ?'; params.push(filters.date_from); }
  if (filters.date_to) { whereClause += ' AND ci.instance_date <= ?'; params.push(filters.date_to); }
  if (filters.class_type) { whereClause += ' AND c.class_type = ?'; params.push(filters.class_type); }

  const overview = d.prepare(`
    SELECT
      COUNT(DISTINCT ci.id) as total_classes,
      SUM(CASE WHEN b.status = 'attended' THEN 1 ELSE 0 END) as total_attended,
      SUM(CASE WHEN b.status = 'no_show' THEN 1 ELSE 0 END) as total_no_shows,
      SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) as total_cancellations,
      ROUND(AVG(attended_per_class.cnt), 1) as avg_attendance
    FROM class_instances ci
    JOIN classes c ON ci.class_id = c.id
    LEFT JOIN bookings b ON b.class_instance_id = ci.id
    LEFT JOIN (
      SELECT class_instance_id, COUNT(*) as cnt
      FROM bookings WHERE status = 'attended'
      GROUP BY class_instance_id
    ) attended_per_class ON attended_per_class.class_instance_id = ci.id
    ${whereClause}
  `).get(...params);

  const byClass = d.prepare(`
    SELECT
      c.name, c.class_type, c.capacity,
      COUNT(DISTINCT ci.id) as sessions,
      SUM(CASE WHEN b.status = 'attended' THEN 1 ELSE 0 END) as attended,
      SUM(CASE WHEN b.status = 'no_show' THEN 1 ELSE 0 END) as no_shows,
      ROUND(CAST(SUM(CASE WHEN b.status = 'attended' THEN 1 ELSE 0 END) AS REAL) / (COUNT(DISTINCT ci.id) * c.capacity) * 100, 1) as fill_rate
    FROM class_instances ci
    JOIN classes c ON ci.class_id = c.id
    LEFT JOIN bookings b ON b.class_instance_id = ci.id
    ${whereClause}
    GROUP BY c.id ORDER BY fill_rate DESC
  `).all(...params);

  const byTimeSlot = d.prepare(`
    SELECT c.start_time,
      COUNT(DISTINCT ci.id) as sessions,
      SUM(CASE WHEN b.status = 'attended' THEN 1 ELSE 0 END) as attended,
      ROUND(CAST(SUM(CASE WHEN b.status = 'attended' THEN 1 ELSE 0 END) AS REAL) / COUNT(DISTINCT ci.id), 1) as avg_per_session
    FROM class_instances ci
    JOIN classes c ON ci.class_id = c.id
    LEFT JOIN bookings b ON b.class_instance_id = ci.id
    ${whereClause}
    GROUP BY c.start_time ORDER BY avg_per_session DESC
  `).all(...params);

  return { overview, byClass, byTimeSlot };
}

export function getAtRiskMembers(days_inactive: number = 21): any[] {
  const d = getDb();
  return d.prepare(`
    SELECT m.*,
      m.last_visit,
      CAST(julianday('now') - julianday(COALESCE(m.last_visit, m.join_date)) AS INTEGER) as days_since_visit,
      (SELECT COUNT(*) FROM bookings b
       JOIN class_instances ci ON b.class_instance_id = ci.id
       WHERE b.member_id = m.id AND b.status = 'attended'
       AND ci.instance_date >= date('now', '-90 days')) as classes_last_90d,
      (SELECT COUNT(*) FROM bookings b
       JOIN class_instances ci ON b.class_instance_id = ci.id
       WHERE b.member_id = m.id AND b.status = 'attended'
       AND ci.instance_date >= date('now', '-30 days')) as classes_last_30d,
      (SELECT COUNT(*) FROM bookings b
       JOIN class_instances ci ON b.class_instance_id = ci.id
       WHERE b.member_id = m.id AND b.status = 'no_show'
       AND ci.instance_date >= date('now', '-30 days')) as no_shows_last_30d,
      m.renewal_date,
      CAST(julianday(m.renewal_date) - julianday('now') AS INTEGER) as days_until_renewal
    FROM members m
    WHERE m.status = 'active'
    AND CAST(julianday('now') - julianday(COALESCE(m.last_visit, m.join_date)) AS INTEGER) >= ?
    ORDER BY days_since_visit DESC
  `).all(days_inactive);
}

export function getInstructorStats(filters: {
  date_from?: string;
  date_to?: string;
  instructor_name?: string;
}): any[] {
  const d = getDb();
  let whereClause = "WHERE ci.status = 'completed'";
  const params: any[] = [];

  if (filters.date_from) { whereClause += ' AND ci.instance_date >= ?'; params.push(filters.date_from); }
  if (filters.date_to) { whereClause += ' AND ci.instance_date <= ?'; params.push(filters.date_to); }
  if (filters.instructor_name) { whereClause += ' AND i.name LIKE ?'; params.push(`%${filters.instructor_name}%`); }

  return d.prepare(`
    SELECT
      i.id, i.name, i.specialties, i.hourly_rate,
      COUNT(DISTINCT ci.id) as classes_taught,
      SUM(CASE WHEN b.status = 'attended' THEN 1 ELSE 0 END) as total_attendees,
      ROUND(CAST(SUM(CASE WHEN b.status = 'attended' THEN 1 ELSE 0 END) AS REAL) / COUNT(DISTINCT ci.id), 1) as avg_attendance,
      ROUND(CAST(SUM(CASE WHEN b.status = 'attended' THEN 1 ELSE 0 END) AS REAL) / (COUNT(DISTINCT ci.id) * c.capacity) * 100, 1) as avg_fill_rate,
      SUM(CASE WHEN b.status = 'no_show' THEN 1 ELSE 0 END) as total_no_shows,
      ROUND(i.hourly_rate * COUNT(DISTINCT ci.id), 2) as total_cost
    FROM instructors i
    JOIN classes c ON c.instructor_id = i.id
    JOIN class_instances ci ON ci.class_id = c.id
    LEFT JOIN bookings b ON b.class_instance_id = ci.id
    ${whereClause}
    GROUP BY i.id ORDER BY avg_fill_rate DESC
  `).all(...params);
}

export function getRevenueSnapshot(): any {
  const d = getDb();

  const membershipRevenue = d.prepare(`
    SELECT
      membership_type,
      COUNT(*) as count,
      ROUND(SUM(membership_price), 2) as monthly_revenue
    FROM members WHERE status = 'active'
    GROUP BY membership_type ORDER BY monthly_revenue DESC
  `).all();

  const totalMonthly = d.prepare(`
    SELECT ROUND(SUM(membership_price), 2) as total FROM members WHERE status = 'active'
  `).get() as any;

  const expiringPacks = d.prepare(`
    SELECT name, email, membership_type, classes_remaining
    FROM members
    WHERE membership_type IN ('class_pack_10','class_pack_20')
    AND status = 'active'
    AND classes_remaining <= 2
    ORDER BY classes_remaining ASC
  `).all();

  const upcomingRenewals = d.prepare(`
    SELECT name, email, membership_type, membership_price, renewal_date,
      CAST(julianday(renewal_date) - julianday('now') AS INTEGER) as days_until
    FROM members
    WHERE status = 'active' AND renewal_date IS NOT NULL
    AND julianday(renewal_date) - julianday('now') <= 30
    ORDER BY renewal_date ASC
  `).all();

  const frozenMembers = d.prepare(`
    SELECT name, email, membership_type, membership_price
    FROM members WHERE status = 'frozen'
  `).all();

  return { membershipRevenue, totalMonthly: totalMonthly?.total || 0, expiringPacks, upcomingRenewals, frozenMembers };
}
