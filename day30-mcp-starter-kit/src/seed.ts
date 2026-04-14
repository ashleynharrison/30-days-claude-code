// ---------------------------------------------------------------------------
// Seed data. Small, varied, and realistic enough that every tool returns
// something interesting on first run. Replace with your own data — the
// tools don't care what the rows mean.
// ---------------------------------------------------------------------------

import db from './database.js';

// Reset
db.exec(`
  DELETE FROM activity;
  DELETE FROM transactions;
  DELETE FROM items;
  DELETE FROM contacts;
  DELETE FROM sqlite_sequence;
`);

const insertContact = db.prepare(`
  INSERT INTO contacts (name, email, phone, company, status, tags, notes, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertItem = db.prepare(`
  INSERT INTO items (contact_id, title, category, status, priority, due_date, assignee, metadata, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertTx = db.prepare(`
  INSERT INTO transactions (contact_id, item_id, kind, amount, status, occurred_at, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertActivity = db.prepare(`
  INSERT INTO activity (contact_id, item_id, action, details, actor, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString().replace('T', ' ').slice(0, 19);
const daysFromNow = (n: number) => new Date(now.getTime() + n * 86400000).toISOString().slice(0, 10);

const contacts = [
  ['Maya Chen',     'maya@northwind.co',   '555-0101', 'Northwind Labs',   'active',   '["enterprise","priority"]', 'Key account. Quarterly business review in April.', daysAgo(120)],
  ['Jordan Reyes',  'jordan@fernpath.io',  '555-0102', 'Fernpath',         'active',   '["startup"]',               'Referred by Maya. Fast-moving pilot.',               daysAgo(60)],
  ['Sam Okafor',    'sam@lumentide.com',   '555-0103', 'Lumentide',        'active',   '["enterprise"]',            null,                                                daysAgo(45)],
  ['Priya Raman',   'priya@cressida.dev',  '555-0104', 'Cressida',         'paused',   '["startup","pilot"]',       'Paused pending Q2 budget approval.',                 daysAgo(90)],
  ['Diego Almeida', 'diego@hollowgate.io', '555-0105', 'Hollowgate',       'active',   '["agency"]',                null,                                                daysAgo(30)],
  ['Lena Brooks',   'lena@saltspoke.com',  '555-0106', 'Saltspoke',        'archived', '["churned"]',               'Churned after trial — budget froze.',                daysAgo(180)],
  ['Amara Osei',    'amara@tidewall.co',   '555-0107', 'Tidewall',         'active',   '["enterprise","priority"]', null,                                                daysAgo(15)],
  ['Ken Takahashi', 'ken@pineridge.dev',   '555-0108', 'Pineridge',        'active',   '["solo"]',                  null,                                                daysAgo(7)],
];

const contactIds = contacts.map((c) => insertContact.run(...c).lastInsertRowid as number);

// Items — open, in_progress, closed, overdue
const items: [number, string, string, string, string, string | null, string | null, string | null, string][] = [
  [contactIds[0], 'Q1 integration review',       'engagement', 'in_progress', 'high',   daysFromNow(7),   'ashley', '{"hours":12}', daysAgo(20)],
  [contactIds[0], 'Renewal prep',                 'renewal',    'open',        'normal', daysFromNow(45),  'ashley', null,            daysAgo(5)],
  [contactIds[1], 'Pilot onboarding',             'onboarding', 'in_progress', 'high',   daysFromNow(3),   'ashley', null,            daysAgo(14)],
  [contactIds[1], 'Custom webhook build',         'engagement', 'open',        'normal', daysFromNow(30),  'ashley', null,            daysAgo(2)],
  [contactIds[2], 'Quarterly review',             'engagement', 'closed',      'normal', daysAgo(10),      'ashley', null,            daysAgo(40)],
  [contactIds[3], 'Pilot pause checkpoint',       'admin',      'open',        'low',    daysAgo(3),       'ashley', null,            daysAgo(30)], // overdue
  [contactIds[4], 'Agency white-label setup',     'engagement', 'in_progress', 'urgent', daysFromNow(1),   'ashley', null,            daysAgo(10)],
  [contactIds[6], 'Enterprise SSO rollout',       'engagement', 'open',        'urgent', daysFromNow(5),   'ashley', null,            daysAgo(3)],
  [contactIds[7], 'Solo plan kickoff call',       'onboarding', 'closed',      'normal', daysAgo(5),       'ashley', null,            daysAgo(7)],
];
const itemIds = items.map((i) => insertItem.run(...i).lastInsertRowid as number);

// Transactions
const txs: [number, number | null, string, number, string, string, string | null][] = [
  [contactIds[0], itemIds[0], 'payment',     18000, 'completed', daysAgo(60),  'Q1 retainer'],
  [contactIds[0], itemIds[1], 'payment',     18000, 'completed', daysAgo(30),  'Q2 retainer'],
  [contactIds[1], itemIds[2], 'payment',      4500, 'completed', daysAgo(12),  'Pilot phase 1'],
  [contactIds[2], itemIds[4], 'payment',      9000, 'completed', daysAgo(38),  'Quarterly review'],
  [contactIds[2], itemIds[4], 'refund',       -500, 'completed', daysAgo(35),  'Scope adjustment'],
  [contactIds[3], null,        'payment',     2000, 'completed', daysAgo(85),  'Pilot deposit'],
  [contactIds[4], itemIds[6], 'payment',      6000, 'completed', daysAgo(5),   null],
  [contactIds[5], null,        'payment',     1500, 'completed', daysAgo(175), 'Final trial invoice'],
  [contactIds[6], itemIds[7], 'payment',     24000, 'pending',   daysAgo(1),   'Net-30 invoice sent'],
  [contactIds[7], itemIds[8], 'payment',       500, 'completed', daysAgo(6),   'Solo plan kickoff'],
];
txs.forEach((t) => insertTx.run(...t));

// Activity
const activity: [number | null, number | null, string, string | null, string, string][] = [
  [contactIds[0], null,        'contact_created', 'Welcome email sent',           'system', daysAgo(120)],
  [contactIds[0], itemIds[0],  'item_started',    'Q1 review kicked off',         'ashley', daysAgo(20)],
  [contactIds[1], null,        'contact_created', 'Referred by Maya Chen',        'ashley', daysAgo(60)],
  [contactIds[1], itemIds[2],  'note_added',      'Pilot scoped at 4 weeks',      'ashley', daysAgo(14)],
  [contactIds[3], null,        'status_changed',  'active → paused',              'ashley', daysAgo(45)],
  [contactIds[4], itemIds[6],  'priority_raised', 'Bumped to urgent — launch Fri','ashley', daysAgo(2)],
  [contactIds[5], null,        'status_changed',  'active → archived',            'ashley', daysAgo(160)],
  [contactIds[6], itemIds[7],  'invoice_sent',    'Net-30, $24,000',              'system', daysAgo(1)],
  [contactIds[7], null,        'contact_created', 'Self-signup from tellavsn.com','system', daysAgo(7)],
];
activity.forEach((a) => insertActivity.run(...a));

console.log('✅ Seeded starter-kit database');
console.log(`   Contacts: ${contactIds.length}`);
console.log(`   Items: ${itemIds.length}`);
console.log(`   Transactions: ${txs.length}`);
console.log(`   Activity entries: ${activity.length}`);
