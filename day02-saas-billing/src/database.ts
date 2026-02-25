import Database from "better-sqlite3";
import path from "path";

// ── Interfaces ──────────────────────────────────────────────

export interface Customer {
  id: number;
  name: string;
  contact_name: string;
  contact_email: string;
  plan: string;
  seats: number;
  mrr: number;
  billing_cycle: string;
  status: string;
  signup_date: string;
  next_renewal_date: string;
}

export interface Invoice {
  id: number;
  customer_id: number;
  invoice_number: string;
  amount: number;
  status: string;
  issued_date: string;
  paid_date: string | null;
  line_items: string;
}

export interface Transaction {
  id: number;
  customer_id: number;
  invoice_id: number | null;
  type: string;
  amount: number;
  description: string;
  date: string;
  payment_method: string;
  status: string;
}

export interface Ticket {
  id: number;
  customer_id: number;
  ticket_number: string;
  subject: string;
  category: string;
  status: string;
  assigned_to: string;
  created_date: string;
  resolved_date: string | null;
  notes: string | null;
}

export interface PlanChange {
  id: number;
  customer_id: number;
  previous_plan: string;
  new_plan: string;
  previous_seats: number;
  new_seats: number;
  change_type: string;
  effective_date: string;
  proration_amount: number | null;
}

export interface CustomerWithBilling extends Customer {
  invoice_count?: number;
  total_billed?: number;
}

export interface BillingHistoryEntry {
  entry_type: "invoice" | "transaction";
  date: string;
  invoice_number?: string;
  invoice_status?: string;
  amount: number;
  type?: string;
  description?: string;
  payment_method?: string;
  transaction_status?: string;
  line_items?: string;
}

export interface Discrepancy {
  type: string;
  description: string;
  details: Record<string, unknown>;
}

export interface RevenueSummary {
  total_mrr: number;
  mrr_by_plan: Record<string, number>;
  customer_count_by_status: Record<string, number>;
  failed_payments_this_month: number;
  pending_refunds: number;
  churn_count: number;
}

export interface TicketWithCustomer extends Ticket {
  customer_name: string;
  customer_plan: string;
}

export interface PlanChangeWithCustomer extends PlanChange {
  customer_name: string;
}

// ── Database Connection ─────────────────────────────────────

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(__dirname, "..", "data", "saas-billing.db");
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// ── Table Creation ──────────────────────────────────────────

export function createTables(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      plan TEXT NOT NULL,
      seats INTEGER NOT NULL,
      mrr REAL NOT NULL,
      billing_cycle TEXT NOT NULL,
      status TEXT NOT NULL,
      signup_date TEXT NOT NULL,
      next_renewal_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      invoice_number TEXT NOT NULL UNIQUE,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      issued_date TEXT NOT NULL,
      paid_date TEXT,
      line_items TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      invoice_id INTEGER,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      ticket_number TEXT NOT NULL UNIQUE,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      assigned_to TEXT NOT NULL,
      created_date TEXT NOT NULL,
      resolved_date TEXT,
      notes TEXT,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS plan_changes (
      id INTEGER PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      previous_plan TEXT NOT NULL,
      new_plan TEXT NOT NULL,
      previous_seats INTEGER NOT NULL,
      new_seats INTEGER NOT NULL,
      change_type TEXT NOT NULL,
      effective_date TEXT NOT NULL,
      proration_amount REAL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
  `);
}

// ── Query Functions ─────────────────────────────────────────

export function searchCustomers(
  query: string,
  filters?: { plan?: string; status?: string }
): Customer[] {
  const db = getDb();
  let sql = `SELECT * FROM customers WHERE (
    name LIKE ? OR contact_name LIKE ? OR contact_email LIKE ?
  )`;
  const params: unknown[] = [`%${query}%`, `%${query}%`, `%${query}%`];

  if (filters?.plan) {
    sql += ` AND plan = ?`;
    params.push(filters.plan);
  }
  if (filters?.status) {
    sql += ` AND status = ?`;
    params.push(filters.status);
  }

  sql += ` ORDER BY name`;
  return db.prepare(sql).all(...params) as Customer[];
}

export function getCustomerByIdOrName(
  identifier: string | number
): Customer | undefined {
  const db = getDb();
  if (typeof identifier === "number" || /^\d+$/.test(String(identifier))) {
    return db.prepare("SELECT * FROM customers WHERE id = ?").get(Number(identifier)) as
      | Customer
      | undefined;
  }
  // Search by name (fuzzy)
  return db
    .prepare("SELECT * FROM customers WHERE name LIKE ? ORDER BY name LIMIT 1")
    .get(`%${identifier}%`) as Customer | undefined;
}

export function getBillingHistory(
  customerId: number,
  monthsBack: number = 3
): BillingHistoryEntry[] {
  const db = getDb();
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);
  const cutoff = cutoffDate.toISOString().split("T")[0];

  const invoices = db
    .prepare(
      `SELECT 'invoice' as entry_type, issued_date as date, invoice_number,
              status as invoice_status, amount, line_items
       FROM invoices
       WHERE customer_id = ? AND issued_date >= ?
       ORDER BY issued_date DESC`
    )
    .all(customerId, cutoff) as BillingHistoryEntry[];

  const transactions = db
    .prepare(
      `SELECT 'transaction' as entry_type, date, type, amount, description,
              payment_method, status as transaction_status
       FROM transactions
       WHERE customer_id = ? AND date >= ?
       ORDER BY date DESC`
    )
    .all(customerId, cutoff) as BillingHistoryEntry[];

  // Merge and sort by date descending
  return [...invoices, ...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function findDiscrepancies(customerId: number): Discrepancy[] {
  const db = getDb();
  const discrepancies: Discrepancy[] = [];

  // 1. Duplicate charges: same customer, same amount, within 7 days
  const duplicates = db
    .prepare(
      `SELECT t1.id as id1, t2.id as id2, t1.amount, t1.date as date1, t2.date as date2,
              t1.description as desc1, t2.description as desc2
       FROM transactions t1
       JOIN transactions t2 ON t1.customer_id = t2.customer_id
         AND t1.id < t2.id
         AND t1.amount = t2.amount
         AND t1.type = 'Charge' AND t2.type = 'Charge'
         AND t1.status = 'Succeeded' AND t2.status = 'Succeeded'
         AND ABS(julianday(t1.date) - julianday(t2.date)) <= 7
       WHERE t1.customer_id = ?`
    )
    .all(customerId) as Array<{
    id1: number;
    id2: number;
    amount: number;
    date1: string;
    date2: string;
    desc1: string;
    desc2: string;
  }>;

  for (const dup of duplicates) {
    discrepancies.push({
      type: "Duplicate Charge",
      description: `Two charges of $${dup.amount.toFixed(2)} within ${Math.abs(
        Math.round(
          (new Date(dup.date2).getTime() - new Date(dup.date1).getTime()) /
            86400000
        )
      )} days`,
      details: {
        transaction_ids: [dup.id1, dup.id2],
        amount: dup.amount,
        dates: [dup.date1, dup.date2],
        descriptions: [dup.desc1, dup.desc2],
      },
    });
  }

  // 2. Failed payments
  const failedPayments = db
    .prepare(
      `SELECT id, amount, date, description, payment_method
       FROM transactions
       WHERE customer_id = ? AND status = 'Failed' AND type = 'Charge'
       ORDER BY date DESC`
    )
    .all(customerId) as Array<{
    id: number;
    amount: number;
    date: string;
    description: string;
    payment_method: string;
  }>;

  if (failedPayments.length > 0) {
    discrepancies.push({
      type: "Failed Payments",
      description: `${failedPayments.length} failed charge attempt(s)`,
      details: {
        count: failedPayments.length,
        payments: failedPayments,
      },
    });
  }

  // 3. Invoices without matching successful transaction
  const unmatchedInvoices = db
    .prepare(
      `SELECT i.id, i.invoice_number, i.amount, i.status, i.issued_date
       FROM invoices i
       WHERE i.customer_id = ? AND i.status = 'Paid'
         AND NOT EXISTS (
           SELECT 1 FROM transactions t
           WHERE t.invoice_id = i.id AND t.type = 'Charge' AND t.status = 'Succeeded'
         )`
    )
    .all(customerId) as Array<{
    id: number;
    invoice_number: string;
    amount: number;
    status: string;
    issued_date: string;
  }>;

  if (unmatchedInvoices.length > 0) {
    discrepancies.push({
      type: "Unmatched Invoices",
      description: `${unmatchedInvoices.length} paid invoice(s) without a matching successful transaction`,
      details: { invoices: unmatchedInvoices },
    });
  }

  // 4. Refunds without a corresponding charge
  const orphanRefunds = db
    .prepare(
      `SELECT t.id, t.amount, t.date, t.description
       FROM transactions t
       WHERE t.customer_id = ? AND t.type = 'Refund'
         AND NOT EXISTS (
           SELECT 1 FROM transactions t2
           WHERE t2.customer_id = t.customer_id
             AND t2.type = 'Charge' AND t2.status = 'Succeeded'
             AND t2.amount = t.amount
             AND t2.date <= t.date
         )`
    )
    .all(customerId) as Array<{
    id: number;
    amount: number;
    date: string;
    description: string;
  }>;

  if (orphanRefunds.length > 0) {
    discrepancies.push({
      type: "Orphan Refunds",
      description: `${orphanRefunds.length} refund(s) without a matching charge`,
      details: { refunds: orphanRefunds },
    });
  }

  return discrepancies;
}

export function getTickets(filters?: {
  status?: string;
  category?: string;
  assigned_to?: string;
}): TicketWithCustomer[] {
  const db = getDb();
  let sql = `SELECT t.*, c.name as customer_name, c.plan as customer_plan
             FROM tickets t
             JOIN customers c ON t.customer_id = c.id
             WHERE 1=1`;
  const params: unknown[] = [];

  if (filters?.status) {
    sql += ` AND t.status = ?`;
    params.push(filters.status);
  }
  if (filters?.category) {
    sql += ` AND t.category = ?`;
    params.push(filters.category);
  }
  if (filters?.assigned_to) {
    sql += ` AND t.assigned_to LIKE ?`;
    params.push(`%${filters.assigned_to}%`);
  }

  sql += ` ORDER BY t.created_date DESC`;
  return db.prepare(sql).all(...params) as TicketWithCustomer[];
}

export function getRevenueSummary(): RevenueSummary {
  const db = getDb();

  const totalMrr = db
    .prepare(`SELECT COALESCE(SUM(mrr), 0) as total FROM customers WHERE status = 'Active'`)
    .get() as { total: number };

  const mrrByPlan = db
    .prepare(
      `SELECT plan, COALESCE(SUM(mrr), 0) as total
       FROM customers WHERE status = 'Active'
       GROUP BY plan ORDER BY total DESC`
    )
    .all() as Array<{ plan: string; total: number }>;

  const countByStatus = db
    .prepare(`SELECT status, COUNT(*) as count FROM customers GROUP BY status`)
    .all() as Array<{ status: string; count: number }>;

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const failedThisMonth = db
    .prepare(
      `SELECT COUNT(*) as count FROM transactions
       WHERE type = 'Charge' AND status = 'Failed' AND date >= ?`
    )
    .get(monthStart) as { count: number };

  const pendingRefunds = db
    .prepare(
      `SELECT COUNT(*) as count FROM tickets
       WHERE category = 'Refund Request' AND status IN ('Open', 'Pending')`
    )
    .get() as { count: number };

  const churnCount = db
    .prepare(`SELECT COUNT(*) as count FROM customers WHERE status = 'Churned'`)
    .get() as { count: number };

  return {
    total_mrr: totalMrr.total,
    mrr_by_plan: Object.fromEntries(mrrByPlan.map((r) => [r.plan, r.total])),
    customer_count_by_status: Object.fromEntries(
      countByStatus.map((r) => [r.status, r.count])
    ),
    failed_payments_this_month: failedThisMonth.count,
    pending_refunds: pendingRefunds.count,
    churn_count: churnCount.count,
  };
}

export function getPlanChanges(
  customerId?: number,
  daysBack: number = 30
): PlanChangeWithCustomer[] {
  const db = getDb();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  const cutoff = cutoffDate.toISOString().split("T")[0];

  let sql = `SELECT pc.*, c.name as customer_name
             FROM plan_changes pc
             JOIN customers c ON pc.customer_id = c.id
             WHERE pc.effective_date >= ?`;
  const params: unknown[] = [cutoff];

  if (customerId) {
    sql += ` AND pc.customer_id = ?`;
    params.push(customerId);
  }

  sql += ` ORDER BY pc.effective_date DESC`;
  return db.prepare(sql).all(...params) as PlanChangeWithCustomer[];
}
