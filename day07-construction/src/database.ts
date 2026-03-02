import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'construction.db');
const db: DatabaseType = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;

// --- Query helpers ---

export function searchProjects(args: {
  name?: string;
  status?: string;
  project_type?: string;
}): any[] {
  let sql = `
    SELECT p.*,
      (SELECT COUNT(*) FROM daily_logs dl WHERE dl.project_id = p.id) as log_count,
      (SELECT COUNT(*) FROM rfis r WHERE r.project_id = p.id) as rfi_count,
      (SELECT COUNT(*) FROM rfis r WHERE r.project_id = p.id AND r.status = 'open') as open_rfis,
      (SELECT COUNT(*) FROM change_orders co WHERE co.project_id = p.id) as change_order_count,
      (SELECT COALESCE(SUM(co.amount), 0) FROM change_orders co WHERE co.project_id = p.id AND co.status = 'approved') as approved_change_total,
      (SELECT COUNT(*) FROM inspections i WHERE i.project_id = p.id AND i.status = 'scheduled') as upcoming_inspections
    FROM projects p WHERE 1=1
  `;
  const params: any[] = [];

  if (args.name) {
    sql += ' AND p.name LIKE ?';
    params.push(`%${args.name}%`);
  }
  if (args.status) {
    sql += ' AND p.status = ?';
    params.push(args.status);
  }
  if (args.project_type) {
    sql += ' AND p.project_type = ?';
    params.push(args.project_type);
  }

  sql += ' ORDER BY p.start_date DESC';
  return db.prepare(sql).all(...params);
}

export function getSubcontractors(args: {
  project_id?: number;
  trade?: string;
  status?: string;
}): any[] {
  let sql = `
    SELECT s.*, p.name as project_name,
      (SELECT COUNT(*) FROM inspections i WHERE i.project_id = s.project_id AND i.trade = s.trade) as inspection_count,
      (SELECT COUNT(*) FROM inspections i WHERE i.project_id = s.project_id AND i.trade = s.trade AND i.result = 'failed') as failed_inspections
    FROM subcontractors s
    JOIN projects p ON p.id = s.project_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (args.project_id) {
    sql += ' AND s.project_id = ?';
    params.push(args.project_id);
  }
  if (args.trade) {
    sql += ' AND s.trade LIKE ?';
    params.push(`%${args.trade}%`);
  }
  if (args.status) {
    sql += ' AND s.status = ?';
    params.push(args.status);
  }

  sql += ' ORDER BY s.project_id, s.trade';
  return db.prepare(sql).all(...params);
}

export function getInspections(args: {
  project_id?: number;
  status?: string;
  result?: string;
  date_from?: string;
  date_to?: string;
}): any[] {
  let sql = `
    SELECT i.*, p.name as project_name
    FROM inspections i
    JOIN projects p ON p.id = i.project_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (args.project_id) {
    sql += ' AND i.project_id = ?';
    params.push(args.project_id);
  }
  if (args.status) {
    sql += ' AND i.status = ?';
    params.push(args.status);
  }
  if (args.result) {
    sql += ' AND i.result = ?';
    params.push(args.result);
  }
  if (args.date_from) {
    sql += ' AND i.scheduled_date >= ?';
    params.push(args.date_from);
  }
  if (args.date_to) {
    sql += ' AND i.scheduled_date <= ?';
    params.push(args.date_to);
  }

  sql += ' ORDER BY i.scheduled_date DESC';
  return db.prepare(sql).all(...params);
}

export function getRFIs(args: {
  project_id?: number;
  status?: string;
  priority?: string;
}): any[] {
  let sql = `
    SELECT r.*, p.name as project_name,
      CAST(julianday('now') - julianday(r.submitted_date) AS INTEGER) as days_open
    FROM rfis r
    JOIN projects p ON p.id = r.project_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (args.project_id) {
    sql += ' AND r.project_id = ?';
    params.push(args.project_id);
  }
  if (args.status) {
    sql += ' AND r.status = ?';
    params.push(args.status);
  }
  if (args.priority) {
    sql += ' AND r.priority = ?';
    params.push(args.priority);
  }

  sql += ' ORDER BY CASE r.priority WHEN \'critical\' THEN 1 WHEN \'high\' THEN 2 WHEN \'medium\' THEN 3 ELSE 4 END, r.submitted_date ASC';
  return db.prepare(sql).all(...params);
}

export function getChangeOrders(args: {
  project_id?: number;
  status?: string;
}): any[] {
  let sql = `
    SELECT co.*, p.name as project_name,
      ROUND(co.amount * 100.0 / p.contract_value, 2) as pct_of_contract
    FROM change_orders co
    JOIN projects p ON p.id = co.project_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (args.project_id) {
    sql += ' AND co.project_id = ?';
    params.push(args.project_id);
  }
  if (args.status) {
    sql += ' AND co.status = ?';
    params.push(args.status);
  }

  sql += ' ORDER BY co.submitted_date DESC';
  return db.prepare(sql).all(...params);
}

export function getDailyLogs(args: {
  project_id?: number;
  date_from?: string;
  date_to?: string;
}): any[] {
  let sql = `
    SELECT dl.*, p.name as project_name
    FROM daily_logs dl
    JOIN projects p ON p.id = dl.project_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (args.project_id) {
    sql += ' AND dl.project_id = ?';
    params.push(args.project_id);
  }
  if (args.date_from) {
    sql += ' AND dl.log_date >= ?';
    params.push(args.date_from);
  }
  if (args.date_to) {
    sql += ' AND dl.log_date <= ?';
    params.push(args.date_to);
  }

  sql += ' ORDER BY dl.log_date DESC';
  return db.prepare(sql).all(...params);
}
