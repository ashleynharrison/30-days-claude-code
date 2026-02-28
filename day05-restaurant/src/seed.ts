import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '..', 'data', 'restaurant.db');

// Remove old DB
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// === SCHEMA ===
db.exec(`
  CREATE TABLE staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('server','cook','host','bartender','manager','busser')),
    phone TEXT,
    email TEXT,
    hire_date TEXT NOT NULL,
    hourly_rate REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive'))
  );

  CREATE TABLE tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number INTEGER NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    section TEXT NOT NULL CHECK(section IN ('patio','bar','main','private')),
    status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','occupied','reserved','cleaning'))
  );

  CREATE TABLE menu_items (
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

  CREATE TABLE reservations (
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

  CREATE TABLE orders (
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

  CREATE TABLE order_items (
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

  CREATE TABLE shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL REFERENCES staff(id),
    shift_date TEXT NOT NULL,
    scheduled_start TEXT NOT NULL,
    scheduled_end TEXT NOT NULL,
    actual_start TEXT,
    actual_end TEXT,
    role_override TEXT CHECK(role_override IN ('server','cook','host','bartender','manager','busser'))
  );

  CREATE TABLE eighty_sixed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
    reason TEXT NOT NULL,
    eighty_sixed_at TEXT NOT NULL DEFAULT (datetime('now')),
    restored_at TEXT,
    staff_id INTEGER REFERENCES staff(id)
  );
`);

// === STAFF (12 employees) ===
const insertStaff = db.prepare('INSERT INTO staff (name, role, phone, email, hire_date, hourly_rate, status) VALUES (?,?,?,?,?,?,?)');
const staffData: [string, string, string, string, string, number, string][] = [
  ['Maria Rodriguez', 'manager', '323-555-0101', 'maria@thecommons.la', '2022-03-15', 28.00, 'active'],
  ['James Park', 'server', '323-555-0102', 'james@thecommons.la', '2023-06-01', 18.00, 'active'],
  ['Sophie Chen', 'server', '323-555-0103', 'sophie@thecommons.la', '2023-09-12', 18.00, 'active'],
  ['Marcus Williams', 'server', '323-555-0104', 'marcus@thecommons.la', '2024-01-08', 16.50, 'active'],
  ['Chef Amir Hadid', 'cook', '323-555-0105', 'amir@thecommons.la', '2022-03-15', 32.00, 'active'],
  ['Rosa Jimenez', 'cook', '323-555-0106', 'rosa@thecommons.la', '2023-04-20', 24.00, 'active'],
  ['Tyler Kim', 'cook', '323-555-0107', 'tyler@thecommons.la', '2024-03-01', 20.00, 'active'],
  ['Destiny Brooks', 'host', '323-555-0108', 'destiny@thecommons.la', '2024-06-15', 16.00, 'active'],
  ['Carlos Reyes', 'bartender', '323-555-0109', 'carlos@thecommons.la', '2023-01-10', 20.00, 'active'],
  ['Lena Okafor', 'bartender', '323-555-0110', 'lena@thecommons.la', '2024-02-14', 18.00, 'active'],
  ['Kevin Tran', 'busser', '323-555-0111', 'kevin@thecommons.la', '2024-08-01', 15.00, 'active'],
  ['Alex Rivera', 'server', '323-555-0112', 'alex@thecommons.la', '2024-11-01', 16.50, 'inactive'],
];
staffData.forEach(s => insertStaff.run(...s));

// === TABLES (18 tables) ===
const insertTable = db.prepare('INSERT INTO tables (table_number, capacity, section, status) VALUES (?,?,?,?)');
const tableData: [number, number, string, string][] = [
  // Main dining (8 tables)
  [1, 2, 'main', 'occupied'], [2, 2, 'main', 'available'], [3, 4, 'main', 'occupied'],
  [4, 4, 'main', 'cleaning'], [5, 6, 'main', 'occupied'], [6, 6, 'main', 'reserved'],
  [7, 4, 'main', 'available'], [8, 4, 'main', 'available'],
  // Patio (4 tables)
  [9, 2, 'patio', 'occupied'], [10, 4, 'patio', 'available'],
  [11, 4, 'patio', 'available'], [12, 6, 'patio', 'reserved'],
  // Bar (4 seats treated as tables)
  [13, 2, 'bar', 'occupied'], [14, 2, 'bar', 'available'],
  [15, 2, 'bar', 'occupied'], [16, 2, 'bar', 'available'],
  // Private dining
  [17, 8, 'private', 'reserved'], [18, 12, 'private', 'available'],
];
tableData.forEach(t => insertTable.run(...t));

// === MENU ITEMS (30 items) ===
const insertMenu = db.prepare('INSERT INTO menu_items (name, category, price, cost, prep_time_minutes, is_vegetarian, is_vegan, is_gluten_free, is_available, description) VALUES (?,?,?,?,?,?,?,?,?,?)');
const menuData: [string, string, number, number, number, number, number, number, number, string][] = [
  // Appetizers
  ['Crispy Brussels Sprouts', 'appetizer', 14, 3.50, 12, 1, 1, 1, 1, 'Balsamic glaze, shaved parmesan, chili flake'],
  ['Tuna Tartare', 'appetizer', 19, 7.00, 8, 0, 0, 1, 1, 'Avocado, sesame, wonton chips'],
  ['Burrata & Heirloom Tomato', 'appetizer', 17, 5.50, 5, 1, 0, 1, 1, 'Basil oil, flaky salt, grilled bread'],
  ['Wagyu Beef Sliders', 'appetizer', 22, 9.00, 15, 0, 0, 0, 1, 'Three sliders, caramelized onion, gruyere'],
  ['Roasted Bone Marrow', 'appetizer', 18, 5.00, 20, 0, 0, 1, 1, 'Herb gremolata, sourdough toast'],
  ['Charred Shishito Peppers', 'appetizer', 12, 2.50, 8, 1, 1, 1, 1, 'Lime, sea salt, togarashi'],
  // Entrees
  ['Pan-Seared Halibut', 'entree', 42, 16.00, 22, 0, 0, 1, 1, 'Spring peas, fingerling potatoes, beurre blanc'],
  ['Dry-Aged NY Strip', 'entree', 56, 22.00, 25, 0, 0, 1, 1, '14oz, bone-in, compound butter, roasted garlic'],
  ['Truffle Pasta', 'entree', 34, 8.00, 18, 1, 0, 0, 1, 'Fresh tagliatelle, black truffle, pecorino, egg yolk'],
  ['Lobster Risotto', 'entree', 44, 18.00, 25, 0, 0, 1, 0, 'Maine lobster tail, saffron, mascarpone'],
  ['Grilled Branzino', 'entree', 38, 14.00, 20, 0, 0, 1, 1, 'Whole fish, lemon, capers, olive oil'],
  ['Short Rib Bourguignon', 'entree', 36, 12.00, 30, 0, 0, 1, 1, 'Red wine braised, root vegetables, horseradish cream'],
  ['Mushroom & Squash Risotto', 'entree', 28, 6.00, 20, 1, 1, 1, 1, 'Wild mushrooms, roasted squash, truffle oil'],
  ['Pan-Roasted Chicken', 'entree', 32, 9.00, 22, 0, 0, 1, 1, 'Half chicken, herbed jus, seasonal vegetables'],
  // Sides
  ['Truffle Fries', 'side', 12, 2.50, 10, 1, 1, 0, 1, 'Parmesan, herbs, truffle aioli'],
  ['Grilled Broccolini', 'side', 11, 2.00, 8, 1, 1, 1, 1, 'Lemon, chili, garlic'],
  ['Creamed Spinach', 'side', 10, 2.00, 8, 1, 0, 1, 1, 'Nutmeg, gruyere gratin'],
  ['Roasted Cauliflower', 'side', 11, 2.50, 12, 1, 1, 1, 1, 'Tahini, pomegranate, herbs'],
  // Desserts
  ['Dark Chocolate Fondant', 'dessert', 16, 4.00, 15, 1, 0, 0, 1, 'Molten center, vanilla bean ice cream, raspberry'],
  ['Crème Brûlée', 'dessert', 14, 3.00, 10, 1, 0, 1, 1, 'Classic vanilla, caramelized sugar'],
  ['Seasonal Fruit Tart', 'dessert', 15, 4.50, 5, 1, 0, 0, 1, 'Pastry cream, fresh fruit, apricot glaze'],
  ['Affogato', 'dessert', 10, 2.50, 3, 1, 0, 1, 1, 'Espresso, vanilla gelato, amaretto'],
  // Drinks
  ['The Commons Old Fashioned', 'drink', 18, 4.50, 3, 0, 0, 0, 1, 'Bourbon, demerara, angostura, orange'],
  ['Spicy Mezcal Margarita', 'drink', 17, 4.00, 3, 0, 0, 0, 1, 'Mezcal, jalapeño, lime, agave'],
  ['Lavender French 75', 'drink', 16, 3.50, 3, 0, 0, 0, 1, 'Gin, lavender syrup, champagne, lemon'],
  ['Negroni Sbagliato', 'drink', 15, 3.00, 2, 0, 0, 0, 1, 'Campari, sweet vermouth, prosecco'],
  ['Espresso Martini', 'drink', 17, 4.00, 3, 0, 0, 0, 1, 'Vodka, espresso, coffee liqueur, vanilla'],
  ['Glass of Cab Sauv', 'drink', 18, 5.00, 1, 0, 0, 0, 1, 'Napa Valley, 2021 vintage'],
  ['Glass of Chardonnay', 'drink', 16, 4.00, 1, 0, 0, 0, 1, 'Sonoma, 2022, lightly oaked'],
  ['Sparkling Water', 'drink', 5, 0.50, 1, 0, 0, 0, 1, 'San Pellegrino, 750ml'],
];
menuData.forEach(m => insertMenu.run(...m));

// === DATES ===
// We'll seed a full Friday night (last Friday) and a current partial service
const today = new Date();
const dayOfWeek = today.getDay();
const lastFriday = new Date(today);
lastFriday.setDate(today.getDate() - ((dayOfWeek + 2) % 7)); // most recent Friday
const lastFridayStr = lastFriday.toISOString().split('T')[0];
const todayStr = today.toISOString().split('T')[0];

// === LAST FRIDAY RESERVATIONS (busy night — 22 reservations) ===
const insertRes = db.prepare('INSERT INTO reservations (guest_name, guest_phone, guest_email, party_size, reservation_date, reservation_time, table_id, status, notes) VALUES (?,?,?,?,?,?,?,?,?)');

const fridayReservations: [string, string, string | null, number, string, string, number | null, string, string | null][] = [
  // 5:30 PM wave
  ['Thompson Party', '310-555-0201', null, 2, lastFridayStr, '17:30', 1, 'completed', null],
  ['Nakamura', '310-555-0202', 'k.nakamura@gmail.com', 4, lastFridayStr, '17:30', 3, 'completed', null],
  ['Chen Family', '310-555-0203', null, 6, lastFridayStr, '17:30', 5, 'completed', 'Birthday celebration, bring cake at dessert'],
  // 6:00 PM wave
  ['Morrison', '310-555-0204', null, 2, lastFridayStr, '18:00', 2, 'completed', null],
  ['Patel', '310-555-0205', 'dpatel@outlook.com', 4, lastFridayStr, '18:00', 7, 'completed', 'One vegetarian, one gluten-free'],
  ['Williams Date Night', '310-555-0206', null, 2, lastFridayStr, '18:00', 9, 'completed', 'Anniversary — champagne on arrival'],
  ['Garcia', '310-555-0207', null, 4, lastFridayStr, '18:00', 10, 'completed', null],
  // 6:30 PM
  ['Kim Birthday', '310-555-0208', 'jkim@gmail.com', 8, lastFridayStr, '18:30', 17, 'completed', 'Private dining, prix fixe, surprise party'],
  ['Dubois', '310-555-0209', null, 2, lastFridayStr, '18:30', 13, 'completed', 'Bar seating ok'],
  // 7:00 PM wave (peak)
  ['Johnson', '310-555-0210', null, 4, lastFridayStr, '19:00', 3, 'completed', null],
  ['Okonkwo', '310-555-0211', null, 6, lastFridayStr, '19:00', 12, 'completed', null],
  ['Rivera', '310-555-0212', null, 2, lastFridayStr, '19:00', 15, 'completed', null],
  ['Singh', '310-555-0213', null, 4, lastFridayStr, '19:00', 8, 'completed', null],
  // 7:30 PM
  ['Davis', '310-555-0214', null, 2, lastFridayStr, '19:30', 1, 'completed', null],
  ['Ahmad', '310-555-0215', null, 4, lastFridayStr, '19:30', 11, 'no_show', null],
  ['Park Corporate', '310-555-0216', 'events@parkco.com', 6, lastFridayStr, '19:30', 5, 'completed', 'Client dinner, expense account'],
  // 8:00 PM
  ['Lee', '310-555-0217', null, 2, lastFridayStr, '20:00', 9, 'completed', null],
  ['Foster', '310-555-0218', null, 4, lastFridayStr, '20:00', 4, 'completed', null],
  ['Martinez', '310-555-0219', null, 2, lastFridayStr, '20:00', 14, 'completed', null],
  // 8:30 PM
  ['Taylor', '310-555-0220', null, 4, lastFridayStr, '20:30', 7, 'completed', null],
  ['Brooks', '310-555-0221', null, 2, lastFridayStr, '20:30', 2, 'cancelled', 'Called 2 hours before'],
  // No-shows and late cancel
  ['Harrison', '310-555-0222', null, 6, lastFridayStr, '19:00', 6, 'no_show', null],
];
fridayReservations.forEach(r => insertRes.run(...r));

// === TODAY'S RESERVATIONS (current service) ===
const todayReservations: [string, string, string | null, number, string, string, number | null, string, string | null][] = [
  ['Mitchell', '310-555-0301', null, 2, todayStr, '18:00', 1, 'seated', null],
  ['Zhao', '310-555-0302', 'jzhao@gmail.com', 4, todayStr, '18:00', 3, 'seated', 'One vegan'],
  ['Anderson', '310-555-0303', null, 6, todayStr, '18:30', 5, 'seated', null],
  ['Nakamura Return', '310-555-0202', null, 2, todayStr, '18:30', 9, 'seated', 'Loved it Friday — coming back'],
  ['Robinson', '310-555-0304', null, 4, todayStr, '19:00', null, 'confirmed', null],
  ['White', '310-555-0305', null, 2, todayStr, '19:00', null, 'confirmed', null],
  ['Lopez Engagement', '310-555-0306', 'lopez.m@gmail.com', 6, todayStr, '19:30', 12, 'confirmed', 'Engagement dinner — ring in champagne glass'],
  ['Gupta', '310-555-0307', null, 8, todayStr, '19:30', 17, 'confirmed', 'Business dinner'],
  ['Ellis', '310-555-0308', null, 2, todayStr, '20:00', null, 'confirmed', null],
  ['Park', '310-555-0309', null, 4, todayStr, '20:00', null, 'confirmed', null],
  ['Carter', '310-555-0310', null, 2, todayStr, '20:30', null, 'confirmed', null],
  ['Fernandez', '310-555-0311', null, 4, todayStr, '20:30', null, 'confirmed', 'Gluten-free needed'],
];
todayReservations.forEach(r => insertRes.run(...r));

// === FRIDAY NIGHT ORDERS (20 closed orders for the full service) ===
const insertOrder = db.prepare('INSERT INTO orders (reservation_id, table_id, server_id, status, opened_at, closed_at, subtotal, tax, tip, total, guest_count) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, modifications, status, item_price, fired_at, served_at) VALUES (?,?,?,?,?,?,?,?)');

// Helper: generate order times
function fridayTime(hour: number, min: number) {
  return `${lastFridayStr} ${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}:00`;
}

// Servers rotate: James(2), Sophie(3), Marcus(4)
const serverRotation = [2, 3, 4, 2, 3, 4, 2, 3, 4, 2, 3, 4, 2, 3, 4, 2, 3, 4, 2, 3];

// Friday orders (matched to completed reservations)
interface FridayOrder {
  resId: number; tableId: number; serverId: number; guestCount: number;
  openH: number; openM: number; closeH: number; closeM: number;
  subtotal: number; items: [number, number, string | null, number][]; // menuItemId, qty, mods, price
}

const fridayOrders: FridayOrder[] = [
  // 5:30 wave
  { resId: 1, tableId: 1, serverId: 2, guestCount: 2, openH: 17, openM: 35, closeH: 19, closeM: 10,
    subtotal: 118, items: [[2,1,null,19],[8,1,'medium rare',56],[9,1,null,34],[20,1,null,14],[23,1,null,18]] },
  { resId: 2, tableId: 3, serverId: 3, guestCount: 4, openH: 17, openM: 38, closeH: 19, closeM: 25,
    subtotal: 196, items: [[1,2,null,14],[3,1,null,17],[7,1,null,42],[9,2,null,34],[8,1,'rare',56],[15,1,null,12],[16,1,null,11]] },
  { resId: 3, tableId: 5, serverId: 4, guestCount: 6, openH: 17, openM: 33, closeH: 19, closeM: 45,
    subtotal: 334, items: [[4,2,null,22],[6,2,null,12],[8,2,'med rare',56],[7,1,null,42],[11,1,null,38],[12,1,null,36],[15,2,null,12],[17,1,null,10],[19,2,null,16],[25,2,null,16]] },
  // 6:00 wave
  { resId: 4, tableId: 2, serverId: 2, guestCount: 2, openH: 18, openM: 5, closeH: 19, closeM: 35,
    subtotal: 88, items: [[6,1,null,12],[9,1,null,34],[14,1,null,32],[22,1,null,10]] },
  { resId: 5, tableId: 7, serverId: 3, guestCount: 4, openH: 18, openM: 8, closeH: 20, closeM: 0,
    subtotal: 174, items: [[1,1,null,14],[3,1,null,17],[13,1,null,28],[9,1,'no egg yolk',34],[14,1,null,32],[16,1,null,11],[18,1,null,11],[20,2,null,14],[27,1,null,17]] },
  { resId: 6, tableId: 9, serverId: 4, guestCount: 2, openH: 18, openM: 3, closeH: 19, closeM: 50,
    subtotal: 148, items: [[2,1,null,19],[8,1,'medium',56],[7,1,null,42],[15,1,null,12],[19,1,null,16],[25,1,null,16]] },
  { resId: 7, tableId: 10, serverId: 2, guestCount: 4, openH: 18, openM: 10, closeH: 20, closeM: 5,
    subtotal: 186, items: [[1,1,null,14],[5,1,null,18],[9,2,null,34],[11,1,null,38],[14,1,null,32],[17,1,null,10],[15,1,null,12],[20,1,null,14],[21,1,null,15]] },
  // 6:30 — Private dining
  { resId: 8, tableId: 17, serverId: 3, guestCount: 8, openH: 18, openM: 35, closeH: 21, closeM: 15,
    subtotal: 524, items: [[2,3,null,19],[4,2,null,22],[3,2,null,17],[8,4,'assorted temps',56],[10,2,null,44],[9,2,null,34],[15,2,null,12],[16,2,null,11],[19,4,null,16],[27,8,null,17]] },
  { resId: 9, tableId: 13, serverId: 4, guestCount: 2, openH: 18, openM: 40, closeH: 20, closeM: 10,
    subtotal: 79, items: [[6,1,null,12],[12,1,null,36],[23,1,null,18],[26,1,null,15]] },
  // 7:00 wave (peak)
  { resId: 10, tableId: 3, serverId: 2, guestCount: 4, openH: 19, openM: 10, closeH: 21, closeM: 0,
    subtotal: 210, items: [[1,1,null,14],[2,1,null,19],[8,2,'one med, one MR',56],[9,1,null,34],[16,1,null,11],[15,1,null,12],[19,1,null,16],[27,2,null,17]] },
  { resId: 11, tableId: 12, serverId: 3, guestCount: 6, openH: 19, openM: 5, closeH: 21, closeM: 20,
    subtotal: 298, items: [[3,2,null,17],[6,1,null,12],[7,2,null,42],[12,2,null,36],[9,1,null,34],[18,2,null,11],[20,2,null,14],[24,3,null,17],[28,2,null,18]] },
  { resId: 12, tableId: 15, serverId: 4, guestCount: 2, openH: 19, openM: 8, closeH: 20, closeM: 35,
    subtotal: 86, items: [[5,1,null,18],[14,1,null,32],[24,1,null,17],[22,1,null,10],[30,1,null,5]] },
  { resId: 13, tableId: 8, serverId: 2, guestCount: 4, openH: 19, openM: 12, closeH: 21, closeM: 5,
    subtotal: 188, items: [[1,1,null,14],[4,1,null,22],[9,2,null,34],[11,1,null,38],[14,1,null,32],[15,1,null,12],[17,1,null,10],[20,1,null,14],[27,1,null,17]] },
  // 7:30
  { resId: 14, tableId: 1, serverId: 3, guestCount: 2, openH: 19, openM: 35, closeH: 21, closeM: 10,
    subtotal: 106, items: [[2,1,null,19],[8,1,'medium rare',56],[16,1,null,11],[20,1,null,14],[28,1,null,18]] },
  { resId: 16, tableId: 5, serverId: 4, guestCount: 6, openH: 19, openM: 40, closeH: 21, closeM: 50,
    subtotal: 362, items: [[2,2,null,19],[4,1,null,22],[8,3,'assorted',56],[10,1,null,44],[7,1,null,42],[15,2,null,12],[16,1,null,11],[19,2,null,16],[27,4,null,17],[28,2,null,18]] },
  // 8:00
  { resId: 17, tableId: 9, serverId: 2, guestCount: 2, openH: 20, openM: 5, closeH: 21, closeM: 40,
    subtotal: 96, items: [[3,1,null,17],[9,1,null,34],[12,1,null,36],[22,1,null,10]] },
  { resId: 18, tableId: 4, serverId: 3, guestCount: 4, openH: 20, openM: 8, closeH: 22, closeM: 0,
    subtotal: 186, items: [[1,1,null,14],[6,1,null,12],[8,1,'well done',56],[9,1,null,34],[13,1,null,28],[15,1,null,12],[20,2,null,14],[24,2,null,17]] },
  { resId: 19, tableId: 14, serverId: 4, guestCount: 2, openH: 20, openM: 10, closeH: 21, closeM: 30,
    subtotal: 68, items: [[6,1,null,12],[9,1,null,34],[22,1,null,10],[26,1,null,15]] },
  // 8:30
  { resId: 20, tableId: 7, serverId: 2, guestCount: 4, openH: 20, openM: 35, closeH: 22, closeM: 15,
    subtotal: 172, items: [[1,1,null,14],[2,1,null,19],[8,1,'medium',56],[7,1,null,42],[15,1,null,12],[20,1,null,14],[19,1,null,16],[27,1,null,17]] },
];

fridayOrders.forEach(fo => {
  const tax = Math.round(fo.subtotal * 0.0925 * 100) / 100;
  const tipPct = 0.15 + Math.random() * 0.12; // 15-27% tips
  const tip = Math.round(fo.subtotal * tipPct * 100) / 100;
  const total = Math.round((fo.subtotal + tax + tip) * 100) / 100;

  const result = insertOrder.run(
    fo.resId, fo.tableId, fo.serverId, 'closed',
    fridayTime(fo.openH, fo.openM), fridayTime(fo.closeH, fo.closeM),
    fo.subtotal, tax, tip, total, fo.guestCount
  );
  const orderId = result.lastInsertRowid;

  fo.items.forEach(([menuId, qty, mods, price]) => {
    const firedAt = fridayTime(fo.openH, fo.openM + 8 + Math.floor(Math.random() * 5));
    const servedAt = fridayTime(fo.openH, fo.openM + 20 + Math.floor(Math.random() * 10));
    insertOrderItem.run(orderId, menuId, qty, mods, 'served', price, firedAt, servedAt);
  });
});

// === TODAY'S OPEN ORDERS (4 tables currently seated) ===
const todayTime = (h: number, m: number) => `${todayStr} ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`;

const todayOrders = [
  { resId: 23, tableId: 1, serverId: 2, guestCount: 2, openH: 18, openM: 5,
    items: [[6,1,null,12,'served'],[9,1,null,34,'fired'],[28,1,null,18,'served']] as [number,number,string|null,number,string][] },
  { resId: 24, tableId: 3, serverId: 3, guestCount: 4, openH: 18, openM: 8,
    items: [[1,1,null,14,'served'],[3,1,null,17,'served'],[13,1,null,28,'fired'],[9,1,null,34,'fired'],[15,1,null,12,'ordered']] as [number,number,string|null,number,string][] },
  { resId: 25, tableId: 5, serverId: 4, guestCount: 6, openH: 18, openM: 33,
    items: [[2,2,null,19,'served'],[4,1,null,22,'served'],[8,2,'medium rare',56,'fired'],[7,1,null,42,'ordered'],[15,1,null,12,'ordered']] as [number,number,string|null,number,string][] },
  { resId: 26, tableId: 9, serverId: 2, guestCount: 2, openH: 18, openM: 35,
    items: [[6,1,null,12,'served'],[14,1,null,32,'ordered'],[29,1,null,16,'served']] as [number,number,string|null,number,string][] },
  // Walk-in at bar
  { resId: null, tableId: 13, serverId: 4, guestCount: 2, openH: 18, openM: 20,
    items: [[23,1,null,18,'served'],[24,1,null,17,'served'],[5,1,null,18,'fired']] as [number,number,string|null,number,string][] },
  { resId: null, tableId: 15, serverId: 2, guestCount: 1, openH: 18, openM: 45,
    items: [[27,1,null,17,'served'],[6,1,null,12,'served'],[9,1,null,34,'ordered']] as [number,number,string|null,number,string][] },
];

todayOrders.forEach(to => {
  const result = insertOrder.run(
    to.resId, to.tableId, to.serverId, 'open',
    todayTime(to.openH, to.openM), null,
    null, null, null, null, to.guestCount
  );
  const orderId = result.lastInsertRowid;

  to.items.forEach(([menuId, qty, mods, price, status]) => {
    const firedAt = status !== 'ordered' ? todayTime(to.openH, to.openM + 5 + Math.floor(Math.random() * 5)) : null;
    const servedAt = status === 'served' ? todayTime(to.openH, to.openM + 15 + Math.floor(Math.random() * 8)) : null;
    insertOrderItem.run(orderId, menuId, qty, mods, status, price, firedAt, servedAt);
  });
});

// === SHIFTS ===
const insertShift = db.prepare('INSERT INTO shifts (staff_id, shift_date, scheduled_start, scheduled_end, actual_start, actual_end) VALUES (?,?,?,?,?,?)');

// Friday shifts (full staffing)
const fridayShifts: [number, string, string, string, string, string | null][] = [
  [1, lastFridayStr, '15:00', '23:00', '14:50', '23:15'], // Maria (manager)
  [2, lastFridayStr, '16:00', '23:00', '15:55', '23:10'], // James (server)
  [3, lastFridayStr, '16:00', '23:00', '16:05', '23:05'], // Sophie (server)
  [4, lastFridayStr, '17:00', '23:00', '16:55', '23:00'], // Marcus (server)
  [5, lastFridayStr, '14:00', '23:00', '13:45', '23:20'], // Chef Amir
  [6, lastFridayStr, '15:00', '23:00', '15:00', '23:10'], // Rosa (cook)
  [7, lastFridayStr, '16:00', '22:00', '16:10', '22:00'], // Tyler (cook)
  [8, lastFridayStr, '16:00', '23:00', '15:50', '23:00'], // Destiny (host)
  [9, lastFridayStr, '16:00', '01:00', '16:00', '01:15'], // Carlos (bartender)
  [10, lastFridayStr, '17:00', '01:00', '17:05', '01:00'], // Lena (bartender)
  [11, lastFridayStr, '16:00', '23:00', '16:00', '23:00'], // Kevin (busser)
];
fridayShifts.forEach(s => insertShift.run(...s));

// Today's shifts
const todayShifts: [number, string, string, string, string | null, string | null][] = [
  [1, todayStr, '15:00', '23:00', '14:55', null],
  [2, todayStr, '16:00', '23:00', '15:58', null],
  [3, todayStr, '16:00', '23:00', '16:02', null],
  [4, todayStr, '17:00', '23:00', '17:00', null],
  [5, todayStr, '14:00', '23:00', '13:50', null],
  [6, todayStr, '15:00', '23:00', '15:05', null],
  [8, todayStr, '16:00', '23:00', '15:55', null],
  [9, todayStr, '16:00', '01:00', '16:00', null],
  [11, todayStr, '16:00', '23:00', '16:00', null],
];
todayShifts.forEach(s => insertShift.run(...s));

// === 86'D ITEMS ===
const insert86 = db.prepare('INSERT INTO eighty_sixed (menu_item_id, reason, eighty_sixed_at, restored_at, staff_id) VALUES (?,?,?,?,?)');

// Friday: Lobster Risotto ran out, Wagyu Sliders ran low
insert86.run(10, 'Sold out — all 6 lobster tails used', fridayTime(20, 15), fridayTime(20, 15), 5); // stays 86'd rest of night
insert86.run(4, 'Down to last portion — holding for VIP', fridayTime(19, 45), fridayTime(20, 30), 5); // restored

// Today: Tuna Tartare — supplier delivery late
insert86.run(2, 'Supplier delivery delayed — no sushi-grade tuna', todayTime(16, 30), null, 5);

console.log(`✓ Seeded restaurant database: ${lastFridayStr} (Friday) + ${todayStr} (today)`);
console.log('  12 staff, 18 tables, 30 menu items');
console.log('  34 reservations, 25 orders, 86+ order items');
console.log('  22 shifts, 3 86\'d items');

db.close();
