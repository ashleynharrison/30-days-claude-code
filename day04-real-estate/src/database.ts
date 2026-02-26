import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data', 'real-estate.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initializeDb(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('Agent', 'Coordinator')),
      license_number TEXT
    );

    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mls_number TEXT NOT NULL UNIQUE,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      zip TEXT NOT NULL,
      neighborhood TEXT NOT NULL,
      listing_price REAL NOT NULL,
      original_price REAL,
      price_reduced_date TEXT,
      bedrooms INTEGER NOT NULL,
      bathrooms REAL NOT NULL,
      sqft INTEGER NOT NULL,
      lot_sqft INTEGER,
      year_built INTEGER NOT NULL,
      property_type TEXT NOT NULL CHECK (property_type IN ('Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land')),
      status TEXT NOT NULL CHECK (status IN ('Active', 'Pending', 'Sold', 'Expired', 'Withdrawn')),
      listing_date TEXT NOT NULL,
      sold_date TEXT,
      sold_price REAL,
      listing_agent_id INTEGER NOT NULL REFERENCES agents(id),
      description TEXT NOT NULL,
      features TEXT NOT NULL DEFAULT '[]',
      open_house_date TEXT,
      CONSTRAINT valid_sold CHECK (
        (status = 'Sold' AND sold_date IS NOT NULL AND sold_price IS NOT NULL)
        OR (status != 'Sold')
      )
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('Buyer', 'Seller', 'Both')),
      assigned_agent_id INTEGER NOT NULL REFERENCES agents(id),
      budget_min REAL,
      budget_max REAL,
      preferred_neighborhoods TEXT,
      preferred_property_types TEXT,
      bedrooms_min INTEGER,
      preapproved INTEGER NOT NULL DEFAULT 0,
      preapproval_amount REAL,
      status TEXT NOT NULL CHECK (status IN ('Active', 'Under Contract', 'Closed', 'Inactive')),
      notes TEXT,
      intake_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS showings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL REFERENCES listings(id),
      client_id INTEGER NOT NULL REFERENCES clients(id),
      showing_date TEXT NOT NULL,
      showing_time TEXT NOT NULL,
      agent_id INTEGER NOT NULL REFERENCES agents(id),
      feedback TEXT,
      status TEXT NOT NULL CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No-Show'))
    );

    CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL REFERENCES listings(id),
      client_id INTEGER NOT NULL REFERENCES clients(id),
      offer_amount REAL NOT NULL,
      offer_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Submitted', 'Accepted', 'Rejected', 'Countered', 'Withdrawn', 'Expired')),
      contingencies TEXT,
      closing_date TEXT,
      agent_id INTEGER NOT NULL REFERENCES agents(id),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER REFERENCES listings(id),
      client_id INTEGER REFERENCES clients(id),
      description TEXT NOT NULL,
      due_date TEXT NOT NULL,
      assigned_to_id INTEGER NOT NULL REFERENCES agents(id),
      status TEXT NOT NULL CHECK (status IN ('Pending', 'In Progress', 'Complete')),
      priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low'))
    );
  `);
}

// ── Query helpers ──

export interface ListingRow {
  id: number;
  mls_number: string;
  address: string;
  city: string;
  zip: string;
  neighborhood: string;
  listing_price: number;
  original_price: number | null;
  price_reduced_date: string | null;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lot_sqft: number | null;
  year_built: number;
  property_type: string;
  status: string;
  listing_date: string;
  sold_date: string | null;
  sold_price: number | null;
  listing_agent_id: number;
  listing_agent: string;
  description: string;
  features: string;
  open_house_date: string | null;
  days_on_market: number;
  price_per_sqft: number;
}

export function searchListings(filters: {
  query?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: string;
  neighborhood?: string;
  property_type?: string;
  features?: string;
}): ListingRow[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters.query) {
    conditions.push(`(l.address LIKE @query OR l.neighborhood LIKE @query OR l.mls_number LIKE @query OR l.description LIKE @query OR l.city LIKE @query)`);
    params.query = `%${filters.query}%`;
  }
  if (filters.min_price != null) {
    conditions.push(`l.listing_price >= @min_price`);
    params.min_price = filters.min_price;
  }
  if (filters.max_price != null) {
    conditions.push(`l.listing_price <= @max_price`);
    params.max_price = filters.max_price;
  }
  if (filters.bedrooms != null) {
    conditions.push(`l.bedrooms >= @bedrooms`);
    params.bedrooms = filters.bedrooms;
  }
  if (filters.bathrooms != null) {
    conditions.push(`l.bathrooms >= @bathrooms`);
    params.bathrooms = filters.bathrooms;
  }
  if (filters.status) {
    conditions.push(`l.status = @status`);
    params.status = filters.status;
  }
  if (filters.neighborhood) {
    conditions.push(`l.neighborhood LIKE @neighborhood`);
    params.neighborhood = `%${filters.neighborhood}%`;
  }
  if (filters.property_type) {
    conditions.push(`l.property_type = @property_type`);
    params.property_type = filters.property_type;
  }
  if (filters.features) {
    conditions.push(`l.features LIKE @features`);
    params.features = `%${filters.features}%`;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return db.prepare(`
    SELECT l.*,
      a.name AS listing_agent,
      CAST(julianday(COALESCE(l.sold_date, date('now'))) - julianday(l.listing_date) AS INTEGER) AS days_on_market,
      ROUND(l.listing_price / l.sqft, 2) AS price_per_sqft
    FROM listings l
    JOIN agents a ON l.listing_agent_id = a.id
    ${where}
    ORDER BY l.listing_date DESC
    LIMIT 50
  `).all(params) as ListingRow[];
}

export function getListingById(id: number): ListingRow | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT l.*,
      a.name AS listing_agent,
      CAST(julianday(COALESCE(l.sold_date, date('now'))) - julianday(l.listing_date) AS INTEGER) AS days_on_market,
      ROUND(l.listing_price / l.sqft, 2) AS price_per_sqft
    FROM listings l
    JOIN agents a ON l.listing_agent_id = a.id
    WHERE l.id = ?
  `).get(id) as ListingRow | undefined;
}

export function getListingByMls(mls: string): ListingRow | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT l.*,
      a.name AS listing_agent,
      CAST(julianday(COALESCE(l.sold_date, date('now'))) - julianday(l.listing_date) AS INTEGER) AS days_on_market,
      ROUND(l.listing_price / l.sqft, 2) AS price_per_sqft
    FROM listings l
    JOIN agents a ON l.listing_agent_id = a.id
    WHERE l.mls_number = ?
  `).get(mls) as ListingRow | undefined;
}

export function getListingByAddress(address: string): ListingRow | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT l.*,
      a.name AS listing_agent,
      CAST(julianday(COALESCE(l.sold_date, date('now'))) - julianday(l.listing_date) AS INTEGER) AS days_on_market,
      ROUND(l.listing_price / l.sqft, 2) AS price_per_sqft
    FROM listings l
    JOIN agents a ON l.listing_agent_id = a.id
    WHERE l.address LIKE ?
    LIMIT 1
  `).get(`%${address}%`) as ListingRow | undefined;
}

export function getShowingsForListing(listingId: number): Array<Record<string, unknown>> {
  const db = getDb();
  return db.prepare(`
    SELECT s.*, c.name AS client_name, a.name AS agent_name
    FROM showings s
    JOIN clients c ON s.client_id = c.id
    JOIN agents a ON s.agent_id = a.id
    WHERE s.listing_id = ?
    ORDER BY s.showing_date DESC, s.showing_time DESC
  `).all(listingId) as Array<Record<string, unknown>>;
}

export function getOffersForListing(listingId: number): Array<Record<string, unknown>> {
  const db = getDb();
  return db.prepare(`
    SELECT o.*, c.name AS client_name, a.name AS agent_name
    FROM offers o
    JOIN clients c ON o.client_id = c.id
    JOIN agents a ON o.agent_id = a.id
    WHERE o.listing_id = ?
    ORDER BY o.offer_date DESC
  `).all(listingId) as Array<Record<string, unknown>>;
}

export function getTasksForListing(listingId: number): Array<Record<string, unknown>> {
  const db = getDb();
  return db.prepare(`
    SELECT t.*,
      a.name AS assigned_to,
      CASE WHEN t.status != 'Complete' AND t.due_date < date('now') THEN 1 ELSE 0 END AS is_overdue
    FROM tasks t
    JOIN agents a ON t.assigned_to_id = a.id
    WHERE t.listing_id = ?
    ORDER BY t.due_date ASC
  `).all(listingId) as Array<Record<string, unknown>>;
}

export function getTasksForClient(clientId: number): Array<Record<string, unknown>> {
  const db = getDb();
  return db.prepare(`
    SELECT t.*,
      a.name AS assigned_to,
      CASE WHEN t.status != 'Complete' AND t.due_date < date('now') THEN 1 ELSE 0 END AS is_overdue
    FROM tasks t
    JOIN agents a ON t.assigned_to_id = a.id
    WHERE t.client_id = ?
    ORDER BY t.due_date ASC
  `).all(clientId) as Array<Record<string, unknown>>;
}

export function getClientById(id: number): Record<string, unknown> | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, a.name AS assigned_agent
    FROM clients c
    JOIN agents a ON c.assigned_agent_id = a.id
    WHERE c.id = ?
  `).get(id) as Record<string, unknown> | undefined;
}

export function searchClients(query: string): Array<Record<string, unknown>> {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, a.name AS assigned_agent
    FROM clients c
    JOIN agents a ON c.assigned_agent_id = a.id
    WHERE c.name LIKE ?
    ORDER BY c.name
  `).all(`%${query}%`) as Array<Record<string, unknown>>;
}

export function clientMatchListings(clientId: number): ListingRow[] {
  const db = getDb();
  const client = getClientById(clientId);
  if (!client) return [];

  const conditions: string[] = [`l.status = 'Active'`];
  const params: Record<string, unknown> = {};

  if (client.budget_max) {
    conditions.push(`l.listing_price <= @budget_max`);
    params.budget_max = client.budget_max;
  }
  if (client.budget_min) {
    conditions.push(`l.listing_price >= @budget_min`);
    params.budget_min = client.budget_min;
  }
  if (client.bedrooms_min) {
    conditions.push(`l.bedrooms >= @bedrooms_min`);
    params.bedrooms_min = client.bedrooms_min;
  }

  // Preferred property types
  let propTypes: string[] = [];
  if (client.preferred_property_types) {
    try {
      propTypes = JSON.parse(client.preferred_property_types as string);
    } catch { /* ignore */ }
  }
  if (propTypes.length > 0) {
    const placeholders = propTypes.map((_, i) => `@pt${i}`).join(', ');
    conditions.push(`l.property_type IN (${placeholders})`);
    propTypes.forEach((pt, i) => { params[`pt${i}`] = pt; });
  }

  // Preferred neighborhoods — use for scoring, not filtering
  let neighborhoods: string[] = [];
  if (client.preferred_neighborhoods) {
    try {
      neighborhoods = JSON.parse(client.preferred_neighborhoods as string);
    } catch { /* ignore */ }
  }

  const neighborhoodScore = neighborhoods.length > 0
    ? `CASE WHEN l.neighborhood IN (${neighborhoods.map((_, i) => `@nb${i}`).join(', ')}) THEN 1 ELSE 0 END`
    : '0';
  if (neighborhoods.length > 0) {
    neighborhoods.forEach((nb, i) => { params[`nb${i}`] = nb; });
  }

  const where = conditions.join(' AND ');

  return db.prepare(`
    SELECT l.*,
      a.name AS listing_agent,
      CAST(julianday(date('now')) - julianday(l.listing_date) AS INTEGER) AS days_on_market,
      ROUND(l.listing_price / l.sqft, 2) AS price_per_sqft,
      ${neighborhoodScore} AS neighborhood_match
    FROM listings l
    JOIN agents a ON l.listing_agent_id = a.id
    WHERE ${where}
    ORDER BY neighborhood_match DESC, l.listing_price ASC
    LIMIT 20
  `).all(params) as ListingRow[];
}

export function getShowingSchedule(filters: {
  date_range_days?: number;
  agent_id?: number;
  listing_id?: number;
}): Array<Record<string, unknown>> {
  const db = getDb();
  const days = filters.date_range_days ?? 7;
  const conditions: string[] = [
    `s.showing_date BETWEEN date('now', '-${days} days') AND date('now', '+${days} days')`
  ];
  const params: Record<string, unknown> = {};

  if (filters.agent_id) {
    conditions.push(`s.agent_id = @agent_id`);
    params.agent_id = filters.agent_id;
  }
  if (filters.listing_id) {
    conditions.push(`s.listing_id = @listing_id`);
    params.listing_id = filters.listing_id;
  }

  return db.prepare(`
    SELECT s.*,
      c.name AS client_name, c.phone AS client_phone,
      a.name AS agent_name,
      l.address, l.neighborhood, l.listing_price, l.mls_number
    FROM showings s
    JOIN clients c ON s.client_id = c.id
    JOIN agents a ON s.agent_id = a.id
    JOIN listings l ON s.listing_id = l.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY s.showing_date ASC, s.showing_time ASC
  `).all(params) as Array<Record<string, unknown>>;
}

export function getAgentByName(name: string): Record<string, unknown> | undefined {
  const db = getDb();
  return db.prepare(`SELECT * FROM agents WHERE name LIKE ?`).get(`%${name}%`) as Record<string, unknown> | undefined;
}

export function getPipelineSummary(agentId?: number): Record<string, unknown> {
  const db = getDb();
  const agentFilter = agentId ? `AND l.listing_agent_id = ${agentId}` : '';
  const agentOfferFilter = agentId ? `AND o.agent_id = ${agentId}` : '';
  const agentTaskFilter = agentId ? `AND t.assigned_to_id = ${agentId}` : '';

  const activeListings = db.prepare(`
    SELECT COUNT(*) AS count FROM listings l WHERE l.status = 'Active' ${agentFilter}
  `).get() as { count: number };

  const pendingDeals = db.prepare(`
    SELECT COUNT(*) AS count FROM listings l WHERE l.status = 'Pending' ${agentFilter}
  `).get() as { count: number };

  const submittedOffers = db.prepare(`
    SELECT COUNT(*) AS count FROM offers o WHERE o.status = 'Submitted' ${agentOfferFilter}
  `).get() as { count: number };

  const avgDom = db.prepare(`
    SELECT ROUND(AVG(julianday(COALESCE(l.sold_date, date('now'))) - julianday(l.listing_date)), 0) AS avg_days
    FROM listings l WHERE l.status IN ('Active', 'Pending') ${agentFilter}
  `).get() as { avg_days: number };

  const soldVolume = db.prepare(`
    SELECT COALESCE(SUM(l.sold_price), 0) AS total FROM listings l WHERE l.status = 'Sold' ${agentFilter}
  `).get() as { total: number };

  const soldCount = db.prepare(`
    SELECT COUNT(*) AS count FROM listings l WHERE l.status = 'Sold' ${agentFilter}
  `).get() as { count: number };

  const upcomingClosings = db.prepare(`
    SELECT o.closing_date, l.address, l.neighborhood, o.offer_amount, c.name AS client_name
    FROM offers o
    JOIN listings l ON o.listing_id = l.id
    JOIN clients c ON o.client_id = c.id
    WHERE o.status = 'Accepted' AND o.closing_date >= date('now')
    ${agentOfferFilter}
    ORDER BY o.closing_date ASC
  `).all() as Array<Record<string, unknown>>;

  const overdueTasks = db.prepare(`
    SELECT t.*, a.name AS assigned_to,
      l.address AS listing_address, c.name AS client_name
    FROM tasks t
    JOIN agents a ON t.assigned_to_id = a.id
    LEFT JOIN listings l ON t.listing_id = l.id
    LEFT JOIN clients c ON t.client_id = c.id
    WHERE t.status != 'Complete' AND t.due_date < date('now')
    ${agentTaskFilter}
    ORDER BY t.due_date ASC
  `).all() as Array<Record<string, unknown>>;

  return {
    active_listings: activeListings.count,
    pending_deals: pendingDeals.count,
    submitted_offers: submittedOffers.count,
    avg_days_on_market: avgDom.avg_days,
    sold_volume: soldVolume.total,
    sold_count: soldCount.count,
    upcoming_closings: upcomingClosings,
    overdue_tasks: overdueTasks,
  };
}

export function getStaleListings(daysThreshold: number = 30): Array<Record<string, unknown>> {
  const db = getDb();

  return db.prepare(`
    SELECT
      l.*,
      a.name AS listing_agent,
      CAST(julianday(date('now')) - julianday(l.listing_date) AS INTEGER) AS days_on_market,
      ROUND(l.listing_price / l.sqft, 2) AS price_per_sqft,
      (SELECT COUNT(*) FROM showings s WHERE s.listing_id = l.id) AS total_showings,
      (SELECT COUNT(*) FROM showings s WHERE s.listing_id = l.id AND s.showing_date >= date('now', '-30 days')) AS recent_showings,
      (SELECT COUNT(*) FROM offers o WHERE o.listing_id = l.id) AS total_offers,
      (SELECT ROUND(AVG(sold.sold_price / sold.sqft), 2)
       FROM listings sold
       WHERE sold.status = 'Sold'
         AND sold.neighborhood = l.neighborhood
         AND sold.property_type = l.property_type
      ) AS comp_price_per_sqft
    FROM listings l
    JOIN agents a ON l.listing_agent_id = a.id
    WHERE l.status = 'Active'
      AND CAST(julianday(date('now')) - julianday(l.listing_date) AS INTEGER) >= @threshold
    ORDER BY days_on_market DESC
  `).all({ threshold: daysThreshold }) as Array<Record<string, unknown>>;
}
