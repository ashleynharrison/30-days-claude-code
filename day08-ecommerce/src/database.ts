import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'ecommerce.db');
const db: DatabaseType = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;

// --- Query helpers ---

export function searchProducts(args: {
  name?: string;
  category?: string;
  status?: string;
  low_stock?: boolean;
}): any[] {
  let sql = `
    SELECT p.*,
      COALESCE(SUM(CASE WHEN oi.id IS NOT NULL THEN oi.quantity ELSE 0 END), 0) as total_sold,
      COALESCE(SUM(CASE WHEN oi.id IS NOT NULL THEN oi.quantity * oi.unit_price ELSE 0 END), 0) as total_revenue
    FROM products p
    LEFT JOIN order_items oi ON oi.product_id = p.id
    LEFT JOIN orders o ON o.id = oi.order_id AND o.status NOT IN ('cancelled', 'refunded')
    WHERE 1=1
  `;
  const params: any[] = [];

  if (args.name) {
    sql += ' AND p.name LIKE ?';
    params.push(`%${args.name}%`);
  }
  if (args.category) {
    sql += ' AND p.category = ?';
    params.push(args.category);
  }
  if (args.status) {
    sql += ' AND p.status = ?';
    params.push(args.status);
  }
  if (args.low_stock) {
    sql += ' AND p.stock_quantity <= p.reorder_point AND p.status = ?';
    params.push('active');
  }

  sql += ' GROUP BY p.id ORDER BY p.name';
  return db.prepare(sql).all(...params);
}

export function searchOrders(args: {
  order_number?: string;
  status?: string;
  customer_name?: string;
  date_from?: string;
  date_to?: string;
}): any[] {
  let sql = `
    SELECT o.*, c.name as customer_name, c.email as customer_email,
      (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count,
      (SELECT GROUP_CONCAT(p.name, ', ') FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = o.id) as product_names
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (args.order_number) {
    sql += ' AND o.order_number LIKE ?';
    params.push(`%${args.order_number}%`);
  }
  if (args.status) {
    sql += ' AND o.status = ?';
    params.push(args.status);
  }
  if (args.customer_name) {
    sql += ' AND c.name LIKE ?';
    params.push(`%${args.customer_name}%`);
  }
  if (args.date_from) {
    sql += ' AND o.order_date >= ?';
    params.push(args.date_from);
  }
  if (args.date_to) {
    sql += ' AND o.order_date <= ?';
    params.push(args.date_to);
  }

  sql += ' ORDER BY o.order_date DESC';
  return db.prepare(sql).all(...params);
}

export function searchCustomers(args: {
  name?: string;
  tier?: string;
  has_recent_order?: boolean;
}): any[] {
  let sql = `
    SELECT c.*,
      COUNT(DISTINCT o.id) as order_count,
      COALESCE(SUM(o.total), 0) as lifetime_value,
      MAX(o.order_date) as last_order_date,
      CAST(julianday('now') - julianday(MAX(o.order_date)) AS INTEGER) as days_since_last_order
    FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.id AND o.status NOT IN ('cancelled', 'refunded')
    WHERE 1=1
  `;
  const params: any[] = [];

  if (args.name) {
    sql += ' AND c.name LIKE ?';
    params.push(`%${args.name}%`);
  }
  if (args.tier) {
    sql += ' AND c.tier = ?';
    params.push(args.tier);
  }

  sql += ' GROUP BY c.id';

  if (args.has_recent_order) {
    sql += ' HAVING days_since_last_order <= 30';
  }

  sql += ' ORDER BY lifetime_value DESC';
  return db.prepare(sql).all(...params);
}

export function getInventoryAlerts(): any {
  const lowStock = db.prepare(`
    SELECT p.*, p.stock_quantity - p.reorder_point as units_below_reorder
    FROM products p
    WHERE p.stock_quantity <= p.reorder_point AND p.status = 'active'
    ORDER BY (p.stock_quantity * 1.0 / NULLIF(p.reorder_point, 0)) ASC
  `).all();

  const outOfStock = db.prepare(`
    SELECT p.*
    FROM products p
    WHERE p.stock_quantity = 0 AND p.status = 'active'
    ORDER BY p.name
  `).all();

  const overstocked = db.prepare(`
    SELECT p.*, p.stock_quantity - (p.reorder_point * 5) as excess_units
    FROM products p
    WHERE p.stock_quantity > (p.reorder_point * 5) AND p.status = 'active'
    ORDER BY excess_units DESC
  `).all();

  const pendingFulfillment = db.prepare(`
    SELECT COUNT(*) as count FROM orders WHERE status IN ('pending', 'processing')
  `).get() as any;

  return { lowStock, outOfStock, overstocked, pendingFulfillment: pendingFulfillment.count };
}

export function getSalesAnalytics(args: {
  date_from?: string;
  date_to?: string;
  category?: string;
}): any {
  let dateFilter = '';
  const params: any[] = [];

  if (args.date_from) {
    dateFilter += ' AND o.order_date >= ?';
    params.push(args.date_from);
  }
  if (args.date_to) {
    dateFilter += ' AND o.order_date <= ?';
    params.push(args.date_to);
  }

  const overview = db.prepare(`
    SELECT
      COUNT(DISTINCT o.id) as total_orders,
      COALESCE(SUM(o.total), 0) as total_revenue,
      COALESCE(AVG(o.total), 0) as avg_order_value,
      COUNT(DISTINCT o.customer_id) as unique_customers
    FROM orders o
    WHERE o.status NOT IN ('cancelled', 'refunded') ${dateFilter}
  `).get(...params) as any;

  let categoryFilter = '';
  const catParams = [...params];
  if (args.category) {
    categoryFilter = ' AND p.category = ?';
    catParams.push(args.category);
  }

  const topProducts = db.prepare(`
    SELECT p.name, p.sku, p.category,
      SUM(oi.quantity) as units_sold,
      SUM(oi.quantity * oi.unit_price) as revenue,
      SUM(oi.quantity * (oi.unit_price - p.cost)) as profit
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status NOT IN ('cancelled', 'refunded') ${dateFilter} ${categoryFilter}
    GROUP BY p.id
    ORDER BY revenue DESC
    LIMIT 10
  `).all(...catParams);

  const byCategory = db.prepare(`
    SELECT p.category,
      COUNT(DISTINCT o.id) as orders,
      SUM(oi.quantity) as units_sold,
      SUM(oi.quantity * oi.unit_price) as revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status NOT IN ('cancelled', 'refunded') ${dateFilter}
    GROUP BY p.category
    ORDER BY revenue DESC
  `).all(...params);

  const byStatus = db.prepare(`
    SELECT o.status, COUNT(*) as count, COALESCE(SUM(o.total), 0) as total
    FROM orders o
    WHERE 1=1 ${dateFilter.replace(/o\./g, 'o.')}
    GROUP BY o.status
    ORDER BY count DESC
  `).all(...params);

  return { overview, topProducts, byCategory, byStatus };
}

export function getFulfillmentQueue(): any[] {
  return db.prepare(`
    SELECT o.*, c.name as customer_name, c.email as customer_email,
      (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count,
      (SELECT GROUP_CONCAT(p.name || ' x' || oi.quantity, ', ') FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = o.id) as items_summary,
      CAST(julianday('now') - julianday(o.order_date) AS INTEGER) as days_since_order
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    WHERE o.status IN ('pending', 'processing')
    ORDER BY
      CASE o.shipping_method WHEN 'express' THEN 1 WHEN 'standard' THEN 2 WHEN 'economy' THEN 3 END,
      o.order_date ASC
  `).all();
}
