import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(__dirname, "..", "data", "legal-firm.db");

let db: Database.Database | null = null;

export interface Case {
  id: number;
  case_number: string;
  client_name: string;
  case_type: string;
  status: string;
  assigned_attorney: string;
  opposing_counsel: string | null;
  court: string | null;
  filed_date: string;
  next_hearing_date: string | null;
  next_hearing_type: string | null;
  notes: string | null;
}

export interface Task {
  id: number;
  case_id: number;
  description: string;
  assigned_to: string;
  due_date: string;
  status: string;
  priority: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  intake_date: string;
}

export interface CaseSearchFilters {
  status?: string;
  case_type?: string;
  attorney?: string;
}

export interface CaseWithTasks extends Case {
  tasks: Task[];
  client: Client | null;
}

export interface CaseStats {
  total_active_cases: number;
  cases_by_type: Record<string, number>;
  cases_by_attorney: Record<string, number>;
  upcoming_hearings_7_days: number;
  overdue_tasks: number;
}

export interface TaskWithCase extends Task {
  case_number: string;
  client_name: string;
  case_type: string;
}

export interface ClientWithCases extends Client {
  cases: Pick<Case, "case_number" | "case_type" | "status" | "assigned_attorney">[];
}

function createTables(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_number TEXT UNIQUE NOT NULL,
      client_name TEXT NOT NULL,
      case_type TEXT NOT NULL,
      status TEXT NOT NULL,
      assigned_attorney TEXT NOT NULL,
      opposing_counsel TEXT,
      court TEXT,
      filed_date TEXT NOT NULL,
      next_hearing_date TEXT,
      next_hearing_type TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      assigned_to TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      FOREIGN KEY (case_id) REFERENCES cases(id)
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      intake_date TEXT NOT NULL
    );
  `);
}

export function getDb(): Database.Database {
  if (db) return db;

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  createTables(db);
  return db;
}

export function searchCases(
  query: string,
  filters?: CaseSearchFilters
): Pick<Case, "case_number" | "client_name" | "case_type" | "status" | "assigned_attorney" | "next_hearing_date">[] {
  const database = getDb();
  const conditions: string[] = [
    "(case_number LIKE @query OR client_name LIKE @query OR notes LIKE @query)",
  ];
  const params: Record<string, string> = { query: `%${query}%` };

  if (filters?.status) {
    conditions.push("status = @status");
    params.status = filters.status;
  }
  if (filters?.case_type) {
    conditions.push("case_type = @case_type");
    params.case_type = filters.case_type;
  }
  if (filters?.attorney) {
    conditions.push("assigned_attorney LIKE @attorney");
    params.attorney = `%${filters.attorney}%`;
  }

  const sql = `
    SELECT case_number, client_name, case_type, status, assigned_attorney, next_hearing_date
    FROM cases
    WHERE ${conditions.join(" AND ")}
    ORDER BY filed_date DESC
  `;

  return database.prepare(sql).all(params) as Pick<
    Case,
    "case_number" | "client_name" | "case_type" | "status" | "assigned_attorney" | "next_hearing_date"
  >[];
}

export function getCaseDetails(caseIdOrNumber: number | string): CaseWithTasks | null {
  const database = getDb();

  const caseRow =
    typeof caseIdOrNumber === "number"
      ? (database.prepare("SELECT * FROM cases WHERE id = ?").get(caseIdOrNumber) as Case | undefined)
      : (database.prepare("SELECT * FROM cases WHERE case_number = ?").get(caseIdOrNumber) as Case | undefined);

  if (!caseRow) return null;

  const tasks = database
    .prepare("SELECT * FROM tasks WHERE case_id = ? ORDER BY due_date ASC")
    .all(caseRow.id) as Task[];

  const client = (database
    .prepare("SELECT * FROM clients WHERE name = ?")
    .get(caseRow.client_name) as Client | undefined) ?? null;

  return { ...caseRow, tasks, client };
}

export function getUpcomingHearings(daysAhead: number = 7): Case[] {
  const database = getDb();
  const sql = `
    SELECT *
    FROM cases
    WHERE next_hearing_date BETWEEN date('now') AND date('now', '+' || @days || ' days')
    ORDER BY next_hearing_date ASC
  `;
  return database.prepare(sql).all({ days: daysAhead }) as Case[];
}

export function getOverdueTasks(assignedTo?: string): TaskWithCase[] {
  const database = getDb();
  const conditions = ["t.due_date < date('now')", "t.status != 'Complete'"];
  const params: Record<string, string> = {};

  if (assignedTo) {
    conditions.push("t.assigned_to LIKE @assignedTo");
    params.assignedTo = `%${assignedTo}%`;
  }

  const sql = `
    SELECT t.*, c.case_number, c.client_name, c.case_type
    FROM tasks t
    JOIN cases c ON t.case_id = c.id
    WHERE ${conditions.join(" AND ")}
    ORDER BY t.due_date ASC
  `;
  return database.prepare(sql).all(params) as TaskWithCase[];
}

export function getCaseStats(): CaseStats {
  const database = getDb();

  const totalActive = (
    database.prepare("SELECT COUNT(*) as count FROM cases WHERE status = 'Active'").get() as { count: number }
  ).count;

  const byType = database
    .prepare("SELECT case_type, COUNT(*) as count FROM cases GROUP BY case_type")
    .all() as { case_type: string; count: number }[];

  const byAttorney = database
    .prepare("SELECT assigned_attorney, COUNT(*) as count FROM cases WHERE status = 'Active' GROUP BY assigned_attorney")
    .all() as { assigned_attorney: string; count: number }[];

  const upcomingHearings = (
    database
      .prepare(
        "SELECT COUNT(*) as count FROM cases WHERE next_hearing_date BETWEEN date('now') AND date('now', '+7 days')"
      )
      .get() as { count: number }
  ).count;

  const overdue = (
    database
      .prepare("SELECT COUNT(*) as count FROM tasks WHERE due_date < date('now') AND status != 'Complete'")
      .get() as { count: number }
  ).count;

  return {
    total_active_cases: totalActive,
    cases_by_type: Object.fromEntries(byType.map((r) => [r.case_type, r.count])),
    cases_by_attorney: Object.fromEntries(byAttorney.map((r) => [r.assigned_attorney, r.count])),
    upcoming_hearings_7_days: upcomingHearings,
    overdue_tasks: overdue,
  };
}

export function searchClients(query: string): ClientWithCases[] {
  const database = getDb();

  const clients = database
    .prepare("SELECT * FROM clients WHERE name LIKE @query OR email LIKE @query ORDER BY name ASC")
    .all({ query: `%${query}%` }) as Client[];

  return clients.map((client) => {
    const cases = database
      .prepare(
        "SELECT case_number, case_type, status, assigned_attorney FROM cases WHERE client_name = ? ORDER BY filed_date DESC"
      )
      .all(client.name) as Pick<Case, "case_number" | "case_type" | "status" | "assigned_attorney">[];

    return { ...client, cases };
  });
}
