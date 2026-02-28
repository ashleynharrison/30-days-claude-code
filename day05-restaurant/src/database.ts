import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(__dirname, '..', 'data', 'restaurant.db');
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
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('server','cook','host','bartender','manager','busser')),
      phone TEXT,
      email TEXT,
      hire_date TEXT NOT NULL,
      hourly_rate REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive'))
    );

    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number INTEGER NOT NULL UNIQUE,
      capacity INTEGER NOT NULL,
      section TEXT NOT NULL CHECK(section IN ('patio','bar','main','private')),
      status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','occupied','reserved','cleaning'))
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('appetizer','entree','dessert','drink','side')),
      price REAL NOT NULL,
      cost REAL NOT NULL,
      prep_time_minutes INTEGER NOT NULL DEFAULT 15,
      is_vegetarian INTEGER NOT NULL DEFAULT 0,
      is_vegan INTEGER NOT NULL DEFAULT 0,
      is_gluten_free INTEGER NOT NULL DEFAULT 0,
      is_available INTEGER NOT NULL DEFAULT 1,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_name TEXT NOT NULL,
      guest_phone TEXT,
      guest_email TEXT,
      party_size INTEGER NOT NULL,
      reservation_date TEXT NOT NULL,
      reservation_time TEXT NOT NULL,
      table_id INTEGER REFERENCES tables(id),
      status TEXT NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed','seated','completed','no_show','cancelled')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER REFERENCES reservations(id),
      table_id INTEGER NOT NULL REFERENCES tables(id),
      server_id INTEGER NOT NULL REFERENCES staff(id),
      status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed','voided')),
      opened_at TEXT NOT NULL DEFAULT (datetime('now')),
      closed_at TEXT,
      subtotal REAL,
      tax REAL,
      tip REAL,
      total REAL,
      guest_count INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
      quantity INTEGER NOT NULL DEFAULT 1,
      modifications TEXT,
      status TEXT NOT NULL DEFAULT 'ordered' CHECK(status IN ('ordered','fired','plated','served','returned')),
      item_price REAL NOT NULL,
      fired_at TEXT,
      served_at TEXT
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER NOT NULL REFERENCES staff(id),
      shift_date TEXT NOT NULL,
      scheduled_start TEXT NOT NULL,
      scheduled_end TEXT NOT NULL,
      actual_start TEXT,
      actual_end TEXT,
      role_override TEXT CHECK(role_override IN ('server','cook','host','bartender','manager','busser'))
    );

    CREATE TABLE IF NOT EXISTS eighty_sixed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
      reason TEXT NOT NULL,
      eighty_sixed_at TEXT NOT NULL DEFAULT (datetime('now')),
      restored_at TEXT,
      staff_id INTEGER REFERENCES staff(id)
    );
  `);
}

// --- Query helpers ---

export function searchReservations(filters: {
  date?: string;
  guest_name?: string;
  party_size_min?: number;
  status?: string;
  upcoming_only?: boolean;
}): any[] {
  const d = getDb();
  let sql = `
    SELECT r.*, t.table_number, t.section, t.capacity
    FROM reservations r
    LEFT JOIN tables t ON r.table_id = t.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters.date) {
    sql += ' AND r.reservation_date = ?';
    params.push(filters.date);
  }
  if (filters.guest_name) {
    sql += ' AND r.guest_name LIKE ?';
    params.push(`%${filters.guest_name}%`);
  }
  if (filters.party_size_min) {
    sql += ' AND r.party_size >= ?';
    params.push(filters.party_size_min);
  }
  if (filters.status) {
    sql += ' AND r.status = ?';
    params.push(filters.status);
  }
  if (filters.upcoming_only) {
    sql += " AND r.status IN ('confirmed','seated')";
  }

  sql += ' ORDER BY r.reservation_date, r.reservation_time';
  return d.prepare(sql).all(...params);
}

export function getMenuPerformance(filters: {
  date_from?: string;
  date_to?: string;
  category?: string;
  sort_by?: 'revenue' | 'quantity' | 'margin';
  limit?: number;
}): any[] {
  const d = getDb();
  const sortCol = filters.sort_by === 'quantity' ? 'total_qty'
    : filters.sort_by === 'margin' ? 'margin_pct'
    : 'total_revenue';

  let sql = `
    SELECT
      mi.id,
      mi.name,
      mi.category,
      mi.price,
      mi.cost,
      SUM(oi.quantity) as total_qty,
      ROUND(SUM(oi.quantity * oi.item_price), 2) as total_revenue,
      ROUND(SUM(oi.quantity * (oi.item_price - mi.cost)), 2) as total_profit,
      ROUND(((mi.price - mi.cost) / mi.price) * 100, 1) as margin_pct,
      COUNT(DISTINCT o.id) as order_count
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status != 'voided' AND oi.status != 'returned'
  `;
  const params: any[] = [];

  if (filters.date_from) {
    sql += " AND date(o.opened_at) >= ?";
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    sql += " AND date(o.opened_at) <= ?";
    params.push(filters.date_to);
  }
  if (filters.category) {
    sql += ' AND mi.category = ?';
    params.push(filters.category);
  }

  sql += ` GROUP BY mi.id ORDER BY ${sortCol} DESC`;

  if (filters.limit) {
    sql += ' LIMIT ?';
    params.push(filters.limit);
  }

  return d.prepare(sql).all(...params);
}

export function getStaffSchedule(filters: {
  date?: string;
  role?: string;
  staff_name?: string;
}): any[] {
  const d = getDb();
  let sql = `
    SELECT
      s.id as staff_id,
      s.name,
      s.role,
      sh.shift_date,
      sh.scheduled_start,
      sh.scheduled_end,
      sh.actual_start,
      sh.actual_end,
      sh.role_override,
      ROUND((julianday(sh.scheduled_end) - julianday(sh.scheduled_start)) * 24, 1) as scheduled_hours
    FROM shifts sh
    JOIN staff s ON sh.staff_id = s.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters.date) {
    sql += ' AND sh.shift_date = ?';
    params.push(filters.date);
  }
  if (filters.role) {
    sql += ' AND (s.role = ? OR sh.role_override = ?)';
    params.push(filters.role, filters.role);
  }
  if (filters.staff_name) {
    sql += ' AND s.name LIKE ?';
    params.push(`%${filters.staff_name}%`);
  }

  sql += ' ORDER BY sh.shift_date, sh.scheduled_start';
  return d.prepare(sql).all(...params);
}

export function getServiceRecap(date: string): any {
  const d = getDb();

  const summary = d.prepare(`
    SELECT
      COUNT(DISTINCT o.id) as total_orders,
      SUM(o.guest_count) as total_covers,
      ROUND(SUM(o.total), 2) as total_revenue,
      ROUND(AVG(o.total), 2) as avg_check,
      ROUND(AVG(o.tip), 2) as avg_tip,
      ROUND(AVG(
        (julianday(o.closed_at) - julianday(o.opened_at)) * 24 * 60
      ), 0) as avg_turn_time_min,
      ROUND(SUM(o.tip), 2) as total_tips
    FROM orders o
    WHERE date(o.opened_at) = ? AND o.status = 'closed'
  `).get(date);

  const reservationStats = d.prepare(`
    SELECT
      COUNT(*) as total_reservations,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_shows,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
    FROM reservations
    WHERE reservation_date = ?
  `).get(date);

  const topSellers = d.prepare(`
    SELECT mi.name, mi.category, SUM(oi.quantity) as qty, ROUND(SUM(oi.quantity * oi.item_price), 2) as revenue
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    JOIN orders o ON oi.order_id = o.id
    WHERE date(o.opened_at) = ? AND o.status = 'closed' AND oi.status != 'returned'
    GROUP BY mi.id ORDER BY qty DESC LIMIT 5
  `).all(date);

  const eightySixed = d.prepare(`
    SELECT mi.name, e.reason, e.eighty_sixed_at
    FROM eighty_sixed e
    JOIN menu_items mi ON e.menu_item_id = mi.id
    WHERE date(e.eighty_sixed_at) = ?
  `).all(date);

  const serverPerformance = d.prepare(`
    SELECT
      s.name as server_name,
      COUNT(DISTINCT o.id) as tables_served,
      SUM(o.guest_count) as covers,
      ROUND(SUM(o.total), 2) as revenue,
      ROUND(SUM(o.tip), 2) as tips,
      ROUND(AVG(o.tip / NULLIF(o.total - o.tip, 0)) * 100, 1) as avg_tip_pct
    FROM orders o
    JOIN staff s ON o.server_id = s.id
    WHERE date(o.opened_at) = ? AND o.status = 'closed'
    GROUP BY s.id ORDER BY revenue DESC
  `).all(date);

  return { summary, reservationStats, topSellers, eightySixed, serverPerformance };
}

export function getEightySixStatus(): any {
  const d = getDb();

  const current = d.prepare(`
    SELECT e.id, mi.name, mi.category, e.reason, e.eighty_sixed_at, s.name as pulled_by
    FROM eighty_sixed e
    JOIN menu_items mi ON e.menu_item_id = mi.id
    LEFT JOIN staff s ON e.staff_id = s.id
    WHERE e.restored_at IS NULL
    ORDER BY e.eighty_sixed_at DESC
  `).all();

  const recentHistory = d.prepare(`
    SELECT mi.name, e.reason, e.eighty_sixed_at, e.restored_at, s.name as pulled_by
    FROM eighty_sixed e
    JOIN menu_items mi ON e.menu_item_id = mi.id
    LEFT JOIN staff s ON e.staff_id = s.id
    WHERE e.restored_at IS NOT NULL
    ORDER BY e.eighty_sixed_at DESC
    LIMIT 10
  `).all();

  return { current, recentHistory };
}

export function getTableStatus(): any[] {
  const d = getDb();
  return d.prepare(`
    SELECT
      t.id,
      t.table_number,
      t.capacity,
      t.section,
      t.status,
      r.guest_name,
      r.party_size,
      r.reservation_time,
      o.id as order_id,
      o.opened_at,
      o.guest_count,
      ROUND((julianday('now') - julianday(o.opened_at)) * 24 * 60, 0) as minutes_seated,
      (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id AND oi.status IN ('ordered','fired')) as items_pending
    FROM tables t
    LEFT JOIN orders o ON o.table_id = t.id AND o.status = 'open'
    LEFT JOIN reservations r ON r.table_id = t.id AND r.status = 'seated'
    ORDER BY t.section, t.table_number
  `).all();
}
