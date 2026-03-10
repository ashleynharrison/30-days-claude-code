import db from './database.js';

// Clear existing data
db.exec('DELETE FROM risk_scores');
db.exec('DELETE FROM support_tickets');
db.exec('DELETE FROM billing_events');
db.exec('DELETE FROM usage_metrics');
db.exec('DELETE FROM customers');

// --- Customers ---
const insertCustomer = db.prepare(`
  INSERT INTO customers (name, email, company, plan, mrr, signup_date, last_login, status, industry, employee_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const customers = [
  // Healthy customers
  ['Sarah Chen', 'sarah@acmecorp.com', 'Acme Corp', 'enterprise', 2500, '2024-03-15', '2026-03-08', 'active', 'Technology', 250],
  ['Marcus Johnson', 'marcus@brightpath.io', 'BrightPath Analytics', 'pro', 499, '2024-08-01', '2026-03-09', 'active', 'Analytics', 45],
  ['Elena Rodriguez', 'elena@greenfield.co', 'Greenfield Ventures', 'enterprise', 1800, '2024-01-20', '2026-03-07', 'active', 'Finance', 120],
  ['James Park', 'james@novadigital.com', 'Nova Digital', 'pro', 499, '2025-02-10', '2026-03-09', 'active', 'Marketing', 30],
  // At-risk — declining usage
  ['Lisa Thompson', 'lisa@meridian.co', 'Meridian Group', 'pro', 499, '2024-06-01', '2026-02-18', 'active', 'Consulting', 60],
  ['David Kim', 'david@coastaldev.io', 'Coastal Dev', 'starter', 99, '2025-01-15', '2026-02-25', 'active', 'Technology', 12],
  // At-risk — billing issues
  ['Rachel Foster', 'rachel@sunsetmedia.com', 'Sunset Media', 'pro', 499, '2024-09-01', '2026-03-05', 'active', 'Media', 35],
  ['Tom Williams', 'tom@alphalogistics.com', 'Alpha Logistics', 'enterprise', 1200, '2024-04-10', '2026-02-20', 'active', 'Logistics', 80],
  // At-risk — support heavy
  ['Amanda Cruz', 'amanda@peakfitness.com', 'Peak Fitness', 'pro', 499, '2024-11-01', '2026-03-06', 'active', 'Fitness', 25],
  ['Robert Patel', 'robert@urbanarch.com', 'Urban Architecture', 'starter', 99, '2025-04-01', '2026-03-01', 'active', 'Architecture', 8],
  // High risk — multiple signals
  ['Karen Mitchell', 'karen@blueridgelaw.com', 'Blue Ridge Law', 'pro', 499, '2024-07-15', '2026-01-28', 'active', 'Legal', 18],
  ['Steven Wright', 'steven@pacificretail.com', 'Pacific Retail', 'enterprise', 1500, '2024-02-01', '2026-02-10', 'active', 'Retail', 150],
  // Recently churned
  ['Nina Vasquez', 'nina@crestview.io', 'Crestview Solutions', 'pro', 0, '2024-05-01', '2026-01-15', 'churned', 'Technology', 40],
  ['Mike O\'Brien', 'mike@harborhealth.com', 'Harbor Health', 'starter', 0, '2025-03-01', '2025-12-20', 'churned', 'Healthcare', 15],
  // New customer — not enough data
  ['Priya Sharma', 'priya@velocityai.com', 'Velocity AI', 'pro', 499, '2026-02-01', '2026-03-09', 'active', 'Technology', 20],
];

for (const c of customers) {
  insertCustomer.run(...c);
}

// --- Usage Metrics (weekly snapshots, last 8 weeks) ---
const insertUsage = db.prepare(`
  INSERT INTO usage_metrics (customer_id, week_start, logins, api_calls, features_used, active_users, session_minutes)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const weeks = [
  '2026-01-13', '2026-01-20', '2026-01-27', '2026-02-03',
  '2026-02-10', '2026-02-17', '2026-02-24', '2026-03-03',
];

// Usage patterns per customer — [base_logins, base_api, base_features, base_users, base_minutes, trend]
// trend: 'stable', 'growing', 'declining', 'cliff', 'new'
const usagePatterns: Record<number, { base: number[]; trend: string }> = {
  1:  { base: [45, 12000, 8, 18, 4500], trend: 'stable' },
  2:  { base: [30, 8000, 6, 8, 2400], trend: 'growing' },
  3:  { base: [38, 10000, 7, 12, 3600], trend: 'stable' },
  4:  { base: [25, 5000, 5, 5, 1500], trend: 'growing' },
  5:  { base: [20, 4000, 5, 6, 1200], trend: 'declining' },
  6:  { base: [12, 1500, 3, 2, 600], trend: 'declining' },
  7:  { base: [22, 3500, 4, 5, 1100], trend: 'stable' },
  8:  { base: [28, 6000, 6, 10, 2000], trend: 'declining' },
  9:  { base: [18, 3000, 4, 4, 900], trend: 'stable' },
  10: { base: [8, 800, 2, 1, 300], trend: 'stable' },
  11: { base: [15, 2500, 4, 3, 800], trend: 'cliff' },
  12: { base: [35, 9000, 7, 15, 3200], trend: 'cliff' },
  13: { base: [18, 3000, 4, 5, 1000], trend: 'cliff' },
  14: { base: [6, 500, 2, 1, 200], trend: 'cliff' },
  15: { base: [15, 2000, 4, 3, 800], trend: 'new' },
};

for (const [custId, pattern] of Object.entries(usagePatterns)) {
  const id = Number(custId);
  const [bl, ba, bf, bu, bm] = pattern.base;

  for (let i = 0; i < weeks.length; i++) {
    let mult = 1;
    if (pattern.trend === 'growing') mult = 0.7 + (i * 0.06);
    else if (pattern.trend === 'declining') mult = 1.1 - (i * 0.08);
    else if (pattern.trend === 'cliff') mult = i < 4 ? 1 : (i < 6 ? 0.4 : 0.1);
    else if (pattern.trend === 'new') {
      if (i < 4) continue; // no data before signup
      mult = 0.8 + (i - 4) * 0.1;
    }

    const jitter = 0.85 + Math.random() * 0.3;
    const m = Math.max(0.05, mult * jitter);

    insertUsage.run(
      id,
      weeks[i],
      Math.round(bl * m),
      Math.round(ba * m),
      Math.round(Math.min(bf * m, 10)),
      Math.max(1, Math.round(bu * m)),
      Math.round(bm * m),
    );
  }
}

// --- Billing Events ---
const insertBilling = db.prepare(`
  INSERT INTO billing_events (customer_id, event_type, date, amount, details)
  VALUES (?, ?, ?, ?, ?)
`);

const billingData = [
  // Healthy billing
  [1, 'payment', '2026-03-01', 2500, 'Monthly invoice paid'],
  [1, 'payment', '2026-02-01', 2500, 'Monthly invoice paid'],
  [2, 'payment', '2026-03-01', 499, 'Monthly invoice paid'],
  [2, 'upgrade', '2026-01-15', 499, 'Upgraded from starter to pro'],
  [3, 'payment', '2026-03-01', 1800, 'Monthly invoice paid'],
  [4, 'payment', '2026-03-01', 499, 'Monthly invoice paid'],
  // At-risk billing signals
  [5, 'payment', '2026-03-01', 499, 'Monthly invoice paid'],
  [6, 'payment', '2026-03-01', 99, 'Monthly invoice paid'],
  [7, 'failed_payment', '2026-03-01', 499, 'Card declined — expired card'],
  [7, 'failed_payment', '2026-02-01', 499, 'Card declined — insufficient funds'],
  [7, 'payment', '2026-02-03', 499, 'Retry successful'],
  [8, 'downgrade', '2026-02-15', -700, 'Downgraded from enterprise ($1900) to enterprise ($1200)'],
  [8, 'payment', '2026-03-01', 1200, 'Monthly invoice paid'],
  [8, 'discount_request', '2026-02-10', 0, 'Asked about annual discount pricing'],
  // Support-heavy billing
  [9, 'payment', '2026-03-01', 499, 'Monthly invoice paid'],
  [9, 'refund', '2026-02-15', -99, 'Partial refund — outage credit'],
  [10, 'payment', '2026-03-01', 99, 'Monthly invoice paid'],
  // High risk billing
  [11, 'failed_payment', '2026-02-01', 499, 'Card declined'],
  [11, 'failed_payment', '2026-03-01', 499, 'Card declined — card removed'],
  [11, 'cancellation_request', '2026-02-20', 0, 'Requested cancellation — "not using it enough"'],
  [12, 'downgrade', '2026-01-20', -800, 'Downgraded from $2300 to $1500'],
  [12, 'discount_request', '2026-02-05', 0, 'Asked for 50% discount to stay'],
  [12, 'payment', '2026-03-01', 1500, 'Monthly invoice paid'],
  // Churned
  [13, 'cancellation', '2026-01-15', 0, 'Cancelled — switching to competitor'],
  [14, 'cancellation', '2025-12-20', 0, 'Cancelled — budget cuts'],
];

for (const b of billingData) {
  insertBilling.run(...b);
}

// --- Support Tickets ---
const insertTicket = db.prepare(`
  INSERT INTO support_tickets (customer_id, subject, category, priority, status, created_at, resolved_at, satisfaction_score)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const tickets = [
  // Healthy — few tickets, good satisfaction
  [1, 'SSO setup question', 'setup', 'low', 'resolved', '2026-02-10', '2026-02-10', 5],
  [2, 'API rate limit question', 'technical', 'medium', 'resolved', '2026-02-20', '2026-02-21', 5],
  [3, 'Feature request — custom dashboards', 'feature_request', 'low', 'resolved', '2026-01-15', '2026-01-16', 4],
  // Declining usage — frustrated
  [5, 'Reports not loading', 'bug', 'high', 'resolved', '2026-02-05', '2026-02-07', 3],
  [5, 'Integration broken after update', 'bug', 'high', 'resolved', '2026-02-18', '2026-02-22', 2],
  [6, 'Can\'t figure out onboarding', 'setup', 'medium', 'resolved', '2026-02-01', '2026-02-03', 3],
  // Billing issues
  [7, 'Card keeps getting declined', 'billing', 'high', 'open', '2026-03-02', null, null],
  [8, 'Need to review our plan options', 'billing', 'medium', 'resolved', '2026-02-10', '2026-02-12', 3],
  // Support heavy — lots of tickets, low satisfaction
  [9, 'Dashboard shows wrong data', 'bug', 'high', 'resolved', '2026-01-20', '2026-01-25', 2],
  [9, 'Export not working', 'bug', 'medium', 'resolved', '2026-02-01', '2026-02-04', 2],
  [9, 'Can\'t add team members', 'bug', 'high', 'resolved', '2026-02-15', '2026-02-18', 1],
  [9, 'Data sync delay', 'bug', 'medium', 'open', '2026-03-01', null, null],
  [10, 'Mobile app crashes', 'bug', 'high', 'open', '2026-02-28', null, null],
  // High risk — escalations
  [11, 'Nothing works properly', 'bug', 'critical', 'resolved', '2026-01-10', '2026-01-15', 1],
  [11, 'Want to speak with a manager', 'escalation', 'critical', 'resolved', '2026-02-01', '2026-02-02', 1],
  [11, 'Cancellation request', 'billing', 'high', 'open', '2026-02-20', null, null],
  [12, 'Performance issues with large datasets', 'bug', 'high', 'resolved', '2026-01-05', '2026-01-12', 2],
  [12, 'Missing features compared to competitor', 'feature_request', 'medium', 'resolved', '2026-01-20', '2026-01-22', 2],
  [12, 'Need commitment on roadmap', 'escalation', 'high', 'open', '2026-02-15', null, null],
  // Churned — last tickets
  [13, 'How to export all our data', 'general', 'medium', 'resolved', '2026-01-10', '2026-01-11', 3],
  [14, 'Cancel our account', 'billing', 'medium', 'resolved', '2025-12-18', '2025-12-20', null],
];

for (const t of tickets) {
  insertTicket.run(...t);
}

console.log('Seeded: 15 customers, usage metrics, billing events, support tickets');
console.log('Ready for churn prediction analysis');
