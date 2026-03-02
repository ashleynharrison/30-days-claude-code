import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'ecommerce.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// --- Schema ---
db.exec(`
  CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('skincare','haircare','bodycare','fragrance','sets','tools')),
    description TEXT,
    price REAL NOT NULL,
    cost REAL NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    reorder_point INTEGER NOT NULL DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','discontinued','out_of_season','draft')),
    weight_oz REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address_line1 TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    tier TEXT NOT NULL DEFAULT 'standard' CHECK(tier IN ('standard','silver','gold','vip')),
    joined_date TEXT NOT NULL,
    notes TEXT
  );

  CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    order_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','shipped','delivered','cancelled','refunded')),
    subtotal REAL NOT NULL,
    discount REAL NOT NULL DEFAULT 0,
    shipping REAL NOT NULL DEFAULT 0,
    tax REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    shipping_method TEXT CHECK(shipping_method IN ('standard','express','economy','pickup')),
    tracking_number TEXT,
    notes TEXT
  );

  CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL
  );
`);

// --- Helpers ---
const today = new Date();
function dateStr(d: Date): string { return d.toISOString().split('T')[0]; }
function daysAgo(n: number): string { const d = new Date(today); d.setDate(d.getDate() - n); return dateStr(d); }

// --- Products (24) — "Solara" DTC beauty/skincare brand ---
const insertProduct = db.prepare(`
  INSERT INTO products (sku, name, category, description, price, cost, stock_quantity, reorder_point, status, weight_oz)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const products: any[][] = [
  // Skincare
  ['SOL-SC-001', 'Vitamin C Brightening Serum', 'skincare', '30ml brightening serum with 15% L-ascorbic acid and ferulic acid.', 48, 12, 142, 30, 'active', 2.0],
  ['SOL-SC-002', 'Hyaluronic Acid Moisturizer', 'skincare', '50ml lightweight gel moisturizer with 3 molecular weights of HA.', 38, 9, 8, 25, 'active', 3.0],  // LOW STOCK
  ['SOL-SC-003', 'Retinol Night Cream', 'skincare', '50ml encapsulated retinol (0.5%) with squalane and ceramides.', 56, 14, 67, 20, 'active', 3.2],
  ['SOL-SC-004', 'Gentle Foaming Cleanser', 'skincare', '150ml pH-balanced cleanser with amino acid surfactants.', 24, 6, 210, 40, 'active', 6.0],
  ['SOL-SC-005', 'SPF 50 Daily Sunscreen', 'skincare', '50ml mineral sunscreen. No white cast. Reef-safe.', 34, 8, 0, 35, 'active', 2.8],  // OUT OF STOCK
  ['SOL-SC-006', 'Niacinamide Pore Serum', 'skincare', '30ml 10% niacinamide + zinc PCA for pore refinement.', 32, 8, 95, 25, 'active', 2.0],

  // Haircare
  ['SOL-HC-001', 'Keratin Repair Shampoo', 'haircare', '250ml sulfate-free shampoo with hydrolyzed keratin.', 28, 7, 78, 20, 'active', 9.0],
  ['SOL-HC-002', 'Deep Conditioning Mask', 'haircare', '200ml weekly treatment with argan oil and shea butter.', 36, 9, 45, 15, 'active', 7.5],
  ['SOL-HC-003', 'Scalp Detox Treatment', 'haircare', '100ml exfoliating scalp treatment with salicylic acid.', 42, 11, 32, 10, 'active', 4.0],
  ['SOL-HC-004', 'Leave-In Heat Protectant', 'haircare', '150ml spray with up to 450°F heat protection.', 22, 5, 120, 25, 'active', 5.5],

  // Bodycare
  ['SOL-BC-001', 'Whipped Body Butter', 'bodycare', '200ml rich body butter with cocoa butter and vitamin E.', 26, 6, 55, 15, 'active', 7.5],
  ['SOL-BC-002', 'Exfoliating Body Scrub', 'bodycare', '250ml sugar scrub with coconut oil and sea salt.', 24, 5, 3, 12, 'active', 9.5],  // LOW STOCK
  ['SOL-BC-003', 'Hydrating Body Oil', 'bodycare', '100ml dry oil blend with jojoba, rosehip, and marula.', 34, 8, 88, 20, 'active', 4.0],

  // Fragrance
  ['SOL-FR-001', 'Golden Hour Eau de Parfum', 'fragrance', '50ml warm amber, vanilla, and sandalwood.', 68, 16, 42, 10, 'active', 3.5],
  ['SOL-FR-002', 'Sea Glass Body Mist', 'fragrance', '150ml light, fresh scent with sea salt and bergamot.', 28, 6, 180, 30, 'active', 5.5],  // OVERSTOCKED
  ['SOL-FR-003', 'Midnight Jasmine Rollerball', 'fragrance', '10ml travel-size rollerball. Jasmine, oud, musk.', 24, 5, 65, 15, 'active', 0.8],

  // Sets
  ['SOL-ST-001', 'Glow Starter Kit', 'sets', 'Cleanser + Vitamin C Serum + SPF minis (15ml each).', 42, 10, 28, 10, 'active', 4.0],
  ['SOL-ST-002', 'The Routine Set', 'sets', 'Full-size cleanser, serum, moisturizer, and SPF in a keepsake box.', 128, 30, 15, 8, 'active', 14.0],
  ['SOL-ST-003', 'Hair Revival Duo', 'sets', 'Shampoo + deep conditioning mask bundle.', 54, 14, 22, 8, 'active', 16.0],
  ['SOL-ST-004', 'Holiday Gift Set 2025', 'sets', 'Limited edition holiday box — body butter, body oil, fragrance mini.', 58, 14, 310, 20, 'out_of_season', 12.0],  // OVERSTOCKED out of season

  // Tools
  ['SOL-TL-001', 'Jade Gua Sha', 'tools', 'Hand-carved genuine jade gua sha tool.', 32, 8, 40, 10, 'active', 2.5],
  ['SOL-TL-002', 'Rose Quartz Roller', 'tools', 'Dual-ended face roller with genuine rose quartz.', 28, 7, 52, 12, 'active', 3.0],
  ['SOL-TL-003', 'Silicone Cleansing Pad', 'tools', 'Antibacterial silicone pad for gentle face cleansing.', 14, 3, 150, 30, 'active', 1.5],
  ['SOL-TL-004', 'Scalp Massager', 'tools', 'Silicone scalp massager for use with shampoo or treatment.', 12, 2, 0, 20, 'discontinued', 1.0],
];

products.forEach(p => insertProduct.run(...p));

// --- Customers (20) ---
const insertCustomer = db.prepare(`
  INSERT INTO customers (name, email, phone, address_line1, address_city, address_state, address_zip, tier, joined_date, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const customers: any[][] = [
  ['Maya Thompson', 'maya.t@email.com', '310-555-2001', '1420 Ocean Ave', 'Santa Monica', 'CA', '90401', 'vip', daysAgo(380), 'Influencer — 45K followers. Gets PR packages. Always reviews products.'],
  ['Jordan Lee', 'jordan.lee@email.com', '213-555-2002', '800 S Figueroa St', 'Los Angeles', 'CA', '90017', 'gold', daysAgo(290), 'Repeat buyer — skincare obsessed. Subscribed to restock reminders.'],
  ['Priya Shah', 'priya.shah@email.com', '415-555-2003', '2200 Mission St', 'San Francisco', 'CA', '94110', 'gold', daysAgo(200), 'Bought The Routine Set twice. Gifted 3 Glow Kits.'],
  ['Alex Rivera', 'alex.r@email.com', '512-555-2004', '1100 Congress Ave', 'Austin', 'TX', '78701', 'silver', daysAgo(150), null],
  ['Sam Chen', 'sam.chen@email.com', '206-555-2005', '400 Pine St', 'Seattle', 'WA', '98101', 'silver', daysAgo(120), 'Haircare focus. Loved the scalp treatment.'],
  ['Nadia Kowalski', 'nadia.k@email.com', '312-555-2006', '233 N Michigan Ave', 'Chicago', 'IL', '60601', 'standard', daysAgo(90), null],
  ['Emma Brooks', 'emma.b@email.com', '617-555-2007', '100 Federal St', 'Boston', 'MA', '02110', 'standard', daysAgo(75), 'First order was a gift. Came back for herself.'],
  ['Tyler Osei', 'tyler.o@email.com', '404-555-2008', '191 Peachtree St', 'Atlanta', 'GA', '30303', 'gold', daysAgo(260), 'Bulk buyer — orders for his barbershop clients.'],
  ['Isabella Moreno', 'isabella.m@email.com', '305-555-2009', '1200 Brickell Ave', 'Miami', 'FL', '33131', 'silver', daysAgo(180), null],
  ['Liam O\'Brien', 'liam.ob@email.com', '503-555-2010', '1000 SW Broadway', 'Portland', 'OR', '97205', 'standard', daysAgo(60), 'Fragrance buyer. Loves Golden Hour.'],
  ['Zoe Park', 'zoe.park@email.com', '646-555-2011', '350 5th Ave', 'New York', 'NY', '10118', 'vip', daysAgo(340), 'Beauty editor — featured us in her column. VIP tier.'],
  ['Derek Washington', 'derek.w@email.com', '720-555-2012', '1601 Blake St', 'Denver', 'CO', '80202', 'standard', daysAgo(45), null],
  ['Aisha Johnson', 'aisha.j@email.com', '615-555-2013', '501 Broadway', 'Nashville', 'TN', '37203', 'silver', daysAgo(130), null],
  ['Chris Tanaka', 'chris.t@email.com', '808-555-2014', '1450 Ala Moana Blvd', 'Honolulu', 'HI', '96814', 'standard', daysAgo(30), 'First-time customer. Express shipping to HI.'],
  ['Rachel Green', 'rachel.g@email.com', '602-555-2015', '2 E Jefferson St', 'Phoenix', 'AZ', '85004', 'standard', daysAgo(100), null],
  ['Marcus Hall', 'marcus.h@email.com', '919-555-2016', '150 Fayetteville St', 'Raleigh', 'NC', '27601', 'standard', daysAgo(55), null],
  ['Olivia Kim', 'olivia.kim@email.com', '310-555-2017', '9876 Wilshire Blvd', 'Beverly Hills', 'CA', '90210', 'gold', daysAgo(220), 'Buys sets as gifts for her team every quarter.'],
  ['Ben Torres', 'ben.t@email.com', '214-555-2018', '1530 Main St', 'Dallas', 'TX', '75201', 'standard', daysAgo(40), null],
  ['Sophie Laurent', 'sophie.l@email.com', '504-555-2019', '700 Bourbon St', 'New Orleans', 'LA', '70116', 'silver', daysAgo(170), 'Bodycare loyalist. Reorders body butter monthly.'],
  ['Kai Nakamura', 'kai.n@email.com', '425-555-2020', '600 Pine St', 'Seattle', 'WA', '98101', 'standard', daysAgo(20), 'Brand new customer. Found us through TikTok.'],
];

customers.forEach(c => insertCustomer.run(...c));

// --- Orders (40+) ---
const insertOrder = db.prepare(`
  INSERT INTO orders (order_number, customer_id, order_date, status, subtotal, discount, shipping, tax, total, shipping_method, tracking_number, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertItem = db.prepare(`
  INSERT INTO order_items (order_id, product_id, quantity, unit_price)
  VALUES (?, ?, ?, ?)
`);

let orderNum = 1000;
function nextOrderNum(): string { orderNum++; return `SOL-${orderNum}`; }

interface OrderDef {
  customerId: number;
  daysAgoVal: number;
  status: string;
  items: [number, number, number][]; // [productId, qty, price]
  shipping: string;
  tracking?: string;
  discount?: number;
  notes?: string;
}

const orders: OrderDef[] = [
  // VIP Maya — frequent buyer
  { customerId: 1, daysAgoVal: 3, status: 'processing', items: [[1, 2, 48], [3, 1, 56], [6, 1, 32]], shipping: 'express', discount: 15, notes: 'VIP — expedite' },
  { customerId: 1, daysAgoVal: 30, status: 'delivered', items: [[18, 1, 128], [14, 1, 68]], shipping: 'express', tracking: '1Z999AA10123456784' },
  { customerId: 1, daysAgoVal: 75, status: 'delivered', items: [[1, 1, 48], [2, 1, 38], [5, 1, 34]], shipping: 'standard', tracking: '1Z999AA10123456785' },

  // Jordan — skincare repeat
  { customerId: 2, daysAgoVal: 5, status: 'shipped', items: [[1, 1, 48], [3, 1, 56], [5, 2, 34]], shipping: 'standard', tracking: '9400111899223100001' },
  { customerId: 2, daysAgoVal: 45, status: 'delivered', items: [[2, 2, 38], [4, 1, 24]], shipping: 'standard', tracking: '9400111899223100002' },
  { customerId: 2, daysAgoVal: 95, status: 'delivered', items: [[17, 2, 42]], shipping: 'standard', tracking: '9400111899223100003' },

  // Priya — gift buyer
  { customerId: 3, daysAgoVal: 8, status: 'pending', items: [[17, 3, 42], [18, 1, 128]], shipping: 'standard', notes: 'Gift wrapping requested' },
  { customerId: 3, daysAgoVal: 60, status: 'delivered', items: [[18, 2, 128]], shipping: 'express', tracking: '1Z999AA10123456786', notes: 'Birthday gifts' },

  // Alex
  { customerId: 4, daysAgoVal: 12, status: 'shipped', items: [[7, 1, 28], [8, 1, 36], [9, 1, 42]], shipping: 'standard', tracking: '9400111899223100004' },
  { customerId: 4, daysAgoVal: 70, status: 'delivered', items: [[11, 1, 26], [13, 1, 34]], shipping: 'economy', tracking: '9400111899223100005' },

  // Sam — haircare
  { customerId: 5, daysAgoVal: 15, status: 'delivered', items: [[7, 2, 28], [9, 1, 42], [10, 1, 22]], shipping: 'standard', tracking: '9400111899223100006' },
  { customerId: 5, daysAgoVal: 55, status: 'delivered', items: [[19, 1, 54], [8, 1, 36]], shipping: 'standard', tracking: '9400111899223100007' },

  // Nadia — new-ish
  { customerId: 6, daysAgoVal: 20, status: 'delivered', items: [[17, 1, 42]], shipping: 'standard', tracking: '9400111899223100008' },

  // Emma
  { customerId: 7, daysAgoVal: 25, status: 'delivered', items: [[14, 1, 68], [15, 1, 28]], shipping: 'standard', tracking: '9400111899223100009' },
  { customerId: 7, daysAgoVal: 50, status: 'delivered', items: [[17, 1, 42]], shipping: 'standard', tracking: '9400111899223100010', notes: 'Gift order — different shipping address' },

  // Tyler — bulk barbershop
  { customerId: 8, daysAgoVal: 7, status: 'processing', items: [[7, 6, 28], [8, 4, 36], [9, 3, 42]], shipping: 'standard', notes: 'Barbershop bulk order — apply wholesale discount next time' },
  { customerId: 8, daysAgoVal: 40, status: 'delivered', items: [[7, 4, 28], [10, 6, 22]], shipping: 'standard', tracking: '9400111899223100011' },
  { customerId: 8, daysAgoVal: 100, status: 'delivered', items: [[7, 8, 28], [8, 4, 36]], shipping: 'standard', tracking: '9400111899223100012' },

  // Isabella
  { customerId: 9, daysAgoVal: 18, status: 'shipped', items: [[1, 1, 48], [6, 1, 32], [21, 1, 32]], shipping: 'express', tracking: '1Z999AA10123456787' },

  // Liam — fragrance
  { customerId: 10, daysAgoVal: 10, status: 'delivered', items: [[14, 2, 68], [16, 1, 24]], shipping: 'standard', tracking: '9400111899223100013' },

  // Zoe — VIP beauty editor
  { customerId: 11, daysAgoVal: 2, status: 'pending', items: [[3, 1, 56], [6, 1, 32], [22, 1, 28]], shipping: 'express', notes: 'Product review — PR package. Comp shipping.' },
  { customerId: 11, daysAgoVal: 35, status: 'delivered', items: [[18, 1, 128]], shipping: 'express', tracking: '1Z999AA10123456788', notes: 'Photographed for magazine feature' },

  // Derek — new
  { customerId: 12, daysAgoVal: 14, status: 'delivered', items: [[4, 1, 24], [11, 1, 26]], shipping: 'economy', tracking: '9400111899223100014' },

  // Aisha
  { customerId: 13, daysAgoVal: 22, status: 'delivered', items: [[1, 1, 48], [2, 1, 38], [21, 1, 32]], shipping: 'standard', tracking: '9400111899223100015' },

  // Chris — Hawaii express
  { customerId: 14, daysAgoVal: 1, status: 'pending', items: [[17, 1, 42], [15, 2, 28]], shipping: 'express', notes: 'Hawaii — verify shipping surcharge' },

  // Rachel
  { customerId: 15, daysAgoVal: 28, status: 'delivered', items: [[12, 1, 24], [13, 1, 34]], shipping: 'standard', tracking: '9400111899223100016' },

  // Marcus
  { customerId: 16, daysAgoVal: 16, status: 'delivered', items: [[23, 2, 14], [4, 1, 24]], shipping: 'economy', tracking: '9400111899223100017' },

  // Olivia — quarterly gifter
  { customerId: 17, daysAgoVal: 4, status: 'processing', items: [[17, 5, 42], [16, 5, 24]], shipping: 'standard', notes: 'Q1 team gifts — 5 kits + 5 rollerballs' },
  { customerId: 17, daysAgoVal: 90, status: 'delivered', items: [[20, 4, 58]], shipping: 'express', tracking: '1Z999AA10123456789', notes: 'Q4 holiday gifts for team' },

  // Ben
  { customerId: 18, daysAgoVal: 9, status: 'shipped', items: [[1, 1, 48], [5, 1, 34]], shipping: 'standard', tracking: '9400111899223100018' },

  // Sophie — bodycare reorder
  { customerId: 19, daysAgoVal: 6, status: 'shipped', items: [[11, 2, 26], [12, 1, 24], [13, 1, 34]], shipping: 'standard', tracking: '9400111899223100019' },
  { customerId: 19, daysAgoVal: 36, status: 'delivered', items: [[11, 2, 26]], shipping: 'standard', tracking: '9400111899223100020' },
  { customerId: 19, daysAgoVal: 65, status: 'delivered', items: [[11, 2, 26], [13, 1, 34]], shipping: 'standard', tracking: '9400111899223100021' },

  // Kai — brand new TikTok customer
  { customerId: 20, daysAgoVal: 2, status: 'pending', items: [[17, 1, 42]], shipping: 'standard', notes: 'Referred by TikTok video #SolaraSkin' },

  // Some cancelled/refunded orders
  { customerId: 4, daysAgoVal: 35, status: 'cancelled', items: [[14, 1, 68]], shipping: 'standard', notes: 'Customer cancelled — changed mind' },
  { customerId: 9, daysAgoVal: 50, status: 'refunded', items: [[3, 1, 56]], shipping: 'standard', notes: 'Allergic reaction reported. Full refund + apology credit issued.' },
];

orders.forEach(o => {
  const subtotal = o.items.reduce((sum, [, qty, price]) => sum + qty * price, 0);
  const discount = o.discount || 0;
  const shippingCost = o.shipping === 'express' ? 12.99 : o.shipping === 'economy' ? 4.99 : subtotal >= 75 ? 0 : 7.99;
  const taxable = subtotal - discount;
  const tax = Math.round(taxable * 0.0875 * 100) / 100; // 8.75% tax
  const total = Math.round((taxable + shippingCost + tax) * 100) / 100;

  const result = insertOrder.run(
    nextOrderNum(), o.customerId, daysAgo(o.daysAgoVal), o.status,
    subtotal, discount, shippingCost, tax, total,
    o.shipping, o.tracking || null, o.notes || null
  );

  const orderId = result.lastInsertRowid;
  o.items.forEach(([productId, qty, price]) => {
    insertItem.run(orderId, productId, qty, price);
  });
});

db.close();

console.log('Seeded Solara Beauty:');
console.log(`  ${products.length} products (skincare, haircare, bodycare, fragrance, sets, tools)`);
console.log(`  ${customers.length} customers (VIP, gold, silver, standard tiers)`);
console.log(`  ${orders.length} orders (pending, processing, shipped, delivered, cancelled, refunded)`);
console.log('  Low stock: Hyaluronic Acid Moisturizer (8), Body Scrub (3)');
console.log('  Out of stock: SPF 50 Daily Sunscreen');
console.log('  Overstocked: Sea Glass Body Mist (180), Holiday Gift Set (310 — out of season)');
