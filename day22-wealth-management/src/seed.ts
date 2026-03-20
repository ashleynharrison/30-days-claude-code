import db from './database.js';

// Clear existing data
db.exec(`
  DELETE FROM alerts;
  DELETE FROM transactions;
  DELETE FROM holdings;
  DELETE FROM model_allocations;
  DELETE FROM accounts;
  DELETE FROM clients;
`);

const now = new Date();
function daysAgo(n: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString().replace('T', ' ').split('.')[0];
}

// ── Clients ────────────────────────────────────────────────────
const insertClient = db.prepare(`INSERT INTO clients (name, email, phone, risk_profile, investment_goal, advisor, total_invested, notes, onboarded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const c1 = insertClient.run('Margaret Chen', 'margaret@chenventures.com', '(415) 555-0142', 'moderate', 'Retirement + legacy planning', 'David Park', 2450000, 'Former tech executive. Sold startup in 2022. Wants steady growth with some upside. Two adult children.', daysAgo(730)).lastInsertRowid;
const c2 = insertClient.run('Robert & Linda Vasquez', 'robert@vasquezfamily.com', '(212) 555-0198', 'conservative', 'Capital preservation + income', 'David Park', 4200000, 'Retired physicians. Living on portfolio income. Priority is preserving principal and generating $15K/month in distributions.', daysAgo(1095)).lastInsertRowid;
const c3 = insertClient.run('James Okafor', 'james@okafor.io', '(310) 555-0267', 'aggressive', 'Growth + wealth accumulation', 'Sarah Mitchell', 890000, 'Software engineer, 34. High income, low expenses. Maxing 401k. Wants aggressive growth for 20+ year horizon.', daysAgo(365)).lastInsertRowid;
const c4 = insertClient.run('Diane Whitfield-Torres', 'diane@wttrust.com', '(617) 555-0331', 'moderate-aggressive', 'Trust management + philanthropy', 'Sarah Mitchell', 6800000, 'Family trust. Multigenerational wealth. Active philanthropy — donates $200K+/year. Needs tax-efficient strategies.', daysAgo(1460)).lastInsertRowid;
const c5 = insertClient.run('Kevin Park', 'kevin@parkholdings.com', '(503) 555-0415', 'moderate', 'College fund + retirement', 'David Park', 520000, 'Small business owner, 42. Two kids (8 and 12). Needs college funding in 6-10 years and retirement planning. Irregular income.', daysAgo(540)).lastInsertRowid;
const c6 = insertClient.run('Amara Singh', 'amara@singhcapital.com', '(713) 555-0508', 'aggressive', 'Growth + early retirement', 'Sarah Mitchell', 1350000, 'Physician, 38. Targeting early retirement at 50. High savings rate. Comfortable with volatility. No debt.', daysAgo(270)).lastInsertRowid;

// ── Accounts ────────────────────────────────────────────────────
const insertAccount = db.prepare(`INSERT INTO accounts (client_id, name, type, custodian, account_number, cash_balance, status, opened_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

// Margaret Chen
const a1 = insertAccount.run(c1, 'Chen Revocable Trust', 'trust', 'Schwab', 'SCH-8842-TRUST', 85000, 'active', daysAgo(730)).lastInsertRowid;
const a2 = insertAccount.run(c1, 'Margaret IRA', 'ira', 'Schwab', 'SCH-8842-IRA', 12000, 'active', daysAgo(730)).lastInsertRowid;

// Vasquez family
const a3 = insertAccount.run(c2, 'Vasquez Joint Brokerage', 'brokerage', 'Fidelity', 'FID-2291-JTWROS', 145000, 'active', daysAgo(1095)).lastInsertRowid;
const a4 = insertAccount.run(c2, 'Robert Vasquez IRA', 'ira', 'Fidelity', 'FID-2291-IRA-R', 28000, 'active', daysAgo(1095)).lastInsertRowid;
const a5 = insertAccount.run(c2, 'Linda Vasquez IRA', 'ira', 'Fidelity', 'FID-2291-IRA-L', 22000, 'active', daysAgo(1095)).lastInsertRowid;

// James Okafor
const a6 = insertAccount.run(c3, 'James Individual Brokerage', 'brokerage', 'Vanguard', 'VGD-5567-IND', 35000, 'active', daysAgo(365)).lastInsertRowid;
const a7 = insertAccount.run(c3, 'James Roth IRA', 'roth_ira', 'Vanguard', 'VGD-5567-ROTH', 8500, 'active', daysAgo(365)).lastInsertRowid;

// Diane Whitfield-Torres
const a8 = insertAccount.run(c4, 'Whitfield-Torres Family Trust', 'trust', 'Goldman Sachs', 'GS-1104-TRUST', 320000, 'active', daysAgo(1460)).lastInsertRowid;
const a9 = insertAccount.run(c4, 'Diane Charitable Remainder Trust', 'charitable_trust', 'Goldman Sachs', 'GS-1104-CRT', 95000, 'active', daysAgo(900)).lastInsertRowid;

// Kevin Park
const a10 = insertAccount.run(c5, 'Park Family Brokerage', 'brokerage', 'Schwab', 'SCH-3378-IND', 18000, 'active', daysAgo(540)).lastInsertRowid;
const a11 = insertAccount.run(c5, 'Kevin 529 — Emma', '529', 'Schwab', 'SCH-3378-529E', 5200, 'active', daysAgo(540)).lastInsertRowid;
const a12 = insertAccount.run(c5, 'Kevin 529 — Lucas', '529', 'Schwab', 'SCH-3378-529L', 3800, 'active', daysAgo(400)).lastInsertRowid;

// Amara Singh
const a13 = insertAccount.run(c6, 'Amara Brokerage', 'brokerage', 'Vanguard', 'VGD-7745-IND', 42000, 'active', daysAgo(270)).lastInsertRowid;
const a14 = insertAccount.run(c6, 'Amara SEP IRA', 'sep_ira', 'Vanguard', 'VGD-7745-SEP', 15000, 'active', daysAgo(270)).lastInsertRowid;

// ── Holdings ────────────────────────────────────────────────────
const insertHolding = db.prepare(`INSERT INTO holdings (account_id, symbol, name, asset_class, sector, shares, cost_basis, current_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

// Margaret Chen — Trust (moderate, ~$2M in holdings)
const h1 = insertHolding.run(a1, 'VTI', 'Vanguard Total Stock Market ETF', 'equity', 'Broad Market', 2800, 185.20, 268.50).lastInsertRowid;
const h2 = insertHolding.run(a1, 'VXUS', 'Vanguard Total Intl Stock ETF', 'equity', 'International', 3500, 48.30, 59.75).lastInsertRowid;
const h3 = insertHolding.run(a1, 'BND', 'Vanguard Total Bond Market ETF', 'fixed_income', 'Bonds', 4200, 76.50, 72.80).lastInsertRowid;
const h4 = insertHolding.run(a1, 'VNQ', 'Vanguard Real Estate ETF', 'real_estate', 'REITs', 800, 82.10, 88.40).lastInsertRowid;
const h5 = insertHolding.run(a1, 'VTIP', 'Vanguard Short-Term TIPS ETF', 'fixed_income', 'Inflation-Protected', 2000, 48.90, 47.65).lastInsertRowid;

// Margaret Chen — IRA (~$350K)
insertHolding.run(a2, 'VFIAX', 'Vanguard 500 Index Fund', 'equity', 'Large Cap', 650, 380.00, 520.30);
insertHolding.run(a2, 'VBTLX', 'Vanguard Total Bond Mkt Index', 'fixed_income', 'Bonds', 1200, 10.20, 9.85);

// Vasquez — Joint Brokerage (conservative, income-focused ~$2.5M)
insertHolding.run(a3, 'SCHD', 'Schwab US Dividend Equity ETF', 'equity', 'Dividend', 8500, 62.40, 82.15);
insertHolding.run(a3, 'VCIT', 'Vanguard Interm-Term Corp Bond', 'fixed_income', 'Corporate Bonds', 6000, 82.50, 79.20);
insertHolding.run(a3, 'MUB', 'iShares National Muni Bond ETF', 'fixed_income', 'Municipal Bonds', 5500, 108.20, 105.40);
insertHolding.run(a3, 'JEPI', 'JPMorgan Equity Premium Income', 'equity', 'Income', 4000, 52.80, 58.90);
insertHolding.run(a3, 'O', 'Realty Income Corp', 'real_estate', 'REITs', 1200, 58.30, 55.70);
insertHolding.run(a3, 'PFF', 'iShares Preferred & Income ETF', 'fixed_income', 'Preferred Stock', 3000, 32.50, 31.20);

// Vasquez — Robert IRA (~$850K)
insertHolding.run(a4, 'VBTLX', 'Vanguard Total Bond Mkt Index', 'fixed_income', 'Bonds', 45000, 10.40, 9.85);
insertHolding.run(a4, 'VWIAX', 'Vanguard Wellesley Income', 'balanced', 'Conservative Allocation', 7500, 62.80, 68.40);

// Vasquez — Linda IRA (~$780K)
insertHolding.run(a5, 'VWINX', 'Vanguard Wellesley Income Inv', 'balanced', 'Conservative Allocation', 12000, 60.50, 64.80);

// James Okafor — Brokerage (aggressive, ~$650K)
insertHolding.run(a6, 'QQQ', 'Invesco QQQ Trust', 'equity', 'Technology', 450, 340.20, 505.80);
insertHolding.run(a6, 'ARKK', 'ARK Innovation ETF', 'equity', 'Disruptive Innovation', 1200, 48.50, 52.30);
insertHolding.run(a6, 'SOXX', 'iShares Semiconductor ETF', 'equity', 'Semiconductors', 300, 420.00, 545.20);
insertHolding.run(a6, 'NVDA', 'NVIDIA Corp', 'equity', 'Semiconductors', 200, 220.50, 875.40);
// Edge case: single stock concentration >25%
insertHolding.run(a6, 'TSLA', 'Tesla Inc', 'equity', 'Consumer Discretionary', 150, 180.30, 245.60);

// James Okafor — Roth IRA (~$200K)
insertHolding.run(a7, 'VGT', 'Vanguard Information Technology', 'equity', 'Technology', 350, 430.50, 565.20);

// Diane Whitfield-Torres — Family Trust (~$5.2M)
insertHolding.run(a8, 'VTI', 'Vanguard Total Stock Market ETF', 'equity', 'Broad Market', 6500, 195.40, 268.50);
insertHolding.run(a8, 'VXUS', 'Vanguard Total Intl Stock ETF', 'equity', 'International', 8000, 50.20, 59.75);
insertHolding.run(a8, 'AGG', 'iShares Core US Aggregate Bond', 'fixed_income', 'Bonds', 7500, 102.30, 98.60);
insertHolding.run(a8, 'VNQ', 'Vanguard Real Estate ETF', 'real_estate', 'REITs', 2000, 78.50, 88.40);
insertHolding.run(a8, 'GLD', 'SPDR Gold Shares', 'alternative', 'Commodities', 800, 168.20, 215.30);
insertHolding.run(a8, 'VTIP', 'Vanguard Short-Term TIPS ETF', 'fixed_income', 'Inflation-Protected', 5000, 49.10, 47.65);

// Diane — Charitable Trust (~$1.3M)
insertHolding.run(a9, 'VWILX', 'Vanguard Intl Growth Fund', 'equity', 'International Growth', 8000, 120.50, 145.80);
insertHolding.run(a9, 'SCHD', 'Schwab US Dividend Equity ETF', 'equity', 'Dividend', 2000, 65.20, 82.15);

// Kevin Park — Brokerage (~$380K)
insertHolding.run(a10, 'VTI', 'Vanguard Total Stock Market ETF', 'equity', 'Broad Market', 900, 210.30, 268.50);
insertHolding.run(a10, 'VXUS', 'Vanguard Total Intl Stock ETF', 'equity', 'International', 1200, 52.40, 59.75);
insertHolding.run(a10, 'BND', 'Vanguard Total Bond Market ETF', 'fixed_income', 'Bonds', 800, 74.80, 72.80);

// Kevin — 529 Emma (~$62K)
insertHolding.run(a11, 'VFTAX', 'Vanguard Target Retirement 2035', 'balanced', 'Target Date', 1800, 28.50, 34.20);

// Kevin — 529 Lucas (~$38K)
insertHolding.run(a12, 'VLXVX', 'Vanguard Target Retirement 2040', 'balanced', 'Target Date', 1100, 28.80, 34.90);

// Amara Singh — Brokerage (~$950K)
insertHolding.run(a13, 'VTI', 'Vanguard Total Stock Market ETF', 'equity', 'Broad Market', 1500, 225.60, 268.50);
insertHolding.run(a13, 'QQQ', 'Invesco QQQ Trust', 'equity', 'Technology', 400, 380.40, 505.80);
insertHolding.run(a13, 'VXUS', 'Vanguard Total Intl Stock ETF', 'equity', 'International', 2000, 54.20, 59.75);
insertHolding.run(a13, 'SOXX', 'iShares Semiconductor ETF', 'equity', 'Semiconductors', 150, 450.80, 545.20);

// Amara — SEP IRA (~$340K)
insertHolding.run(a14, 'VTI', 'Vanguard Total Stock Market ETF', 'equity', 'Broad Market', 800, 238.40, 268.50);
insertHolding.run(a14, 'BND', 'Vanguard Total Bond Market ETF', 'fixed_income', 'Bonds', 1500, 75.20, 72.80);

// ── Transactions ────────────────────────────────────────────────────
const insertTx = db.prepare(`INSERT INTO transactions (account_id, holding_id, type, symbol, shares, price, amount, fee, executed_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

// Margaret — recent rebalance
insertTx.run(a1, h1, 'sell', 'VTI', 200, 265.30, 53060, 4.95, daysAgo(14), 'Trimming equities — rebalance to target');
insertTx.run(a1, h3, 'buy', 'BND', 700, 72.50, 50750, 0, daysAgo(14), 'Adding bonds — rebalance to target');
insertTx.run(a1, null, 'dividend', 'VTI', null, null, 3920, 0, daysAgo(30), 'Q4 dividend distribution');
insertTx.run(a1, null, 'dividend', 'BND', null, null, 2850, 0, daysAgo(30), 'Q4 coupon payment');

// Vasquez — income distributions
insertTx.run(a3, null, 'dividend', 'SCHD', null, null, 6120, 0, daysAgo(7), 'Quarterly dividend');
insertTx.run(a3, null, 'dividend', 'JEPI', null, null, 4800, 0, daysAgo(7), 'Monthly distribution');
insertTx.run(a3, null, 'dividend', 'O', null, null, 1080, 0, daysAgo(7), 'Monthly dividend');
insertTx.run(a3, null, 'withdrawal', null, null, null, 15000, 0, daysAgo(5), 'Monthly living expenses distribution');

// James — aggressive buying
insertTx.run(a6, null, 'buy', 'NVDA', 50, 820.40, 41020, 0, daysAgo(21), 'Adding to NVIDIA position');
insertTx.run(a6, null, 'buy', 'SOXX', 50, 530.20, 26510, 0, daysAgo(45), 'Semiconductor exposure');
insertTx.run(a7, null, 'deposit', null, null, null, 7000, 0, daysAgo(3), 'Annual Roth IRA contribution');

// Diane — philanthropic distribution
insertTx.run(a9, null, 'withdrawal', null, null, null, 50000, 0, daysAgo(15), 'Annual charitable distribution — Community Foundation');
insertTx.run(a8, null, 'dividend', 'VTI', null, null, 9100, 0, daysAgo(30), 'Q4 dividend');
insertTx.run(a8, null, 'buy', 'GLD', 200, 210.50, 42100, 0, daysAgo(60), 'Adding gold — inflation hedge');

// Kevin — regular contributions
insertTx.run(a10, null, 'deposit', null, null, null, 2500, 0, daysAgo(2), 'Monthly investment');
insertTx.run(a11, null, 'deposit', null, null, null, 500, 0, daysAgo(2), '529 contribution — Emma');
insertTx.run(a12, null, 'deposit', null, null, null, 500, 0, daysAgo(2), '529 contribution — Lucas');

// Amara — aggressive accumulation
insertTx.run(a13, null, 'buy', 'QQQ', 100, 495.20, 49520, 0, daysAgo(10), 'Adding tech exposure');
insertTx.run(a13, null, 'buy', 'VXUS', 500, 58.40, 29200, 0, daysAgo(30), 'International diversification');
insertTx.run(a14, null, 'deposit', null, null, null, 12000, 0, daysAgo(20), 'Q1 SEP IRA contribution');

// ── Model Allocations ────────────────────────────────────────────────
const insertModel = db.prepare(`INSERT INTO model_allocations (risk_profile, asset_class, target_pct, min_pct, max_pct) VALUES (?, ?, ?, ?, ?)`);

// Conservative
insertModel.run('conservative', 'equity', 30, 20, 40);
insertModel.run('conservative', 'fixed_income', 50, 40, 60);
insertModel.run('conservative', 'real_estate', 10, 5, 15);
insertModel.run('conservative', 'alternative', 5, 0, 10);
insertModel.run('conservative', 'cash', 5, 2, 15);

// Moderate
insertModel.run('moderate', 'equity', 50, 40, 60);
insertModel.run('moderate', 'fixed_income', 30, 20, 40);
insertModel.run('moderate', 'real_estate', 10, 5, 15);
insertModel.run('moderate', 'alternative', 5, 0, 10);
insertModel.run('moderate', 'cash', 5, 2, 10);

// Moderate-Aggressive
insertModel.run('moderate-aggressive', 'equity', 65, 55, 75);
insertModel.run('moderate-aggressive', 'fixed_income', 20, 10, 30);
insertModel.run('moderate-aggressive', 'real_estate', 8, 3, 13);
insertModel.run('moderate-aggressive', 'alternative', 5, 0, 10);
insertModel.run('moderate-aggressive', 'cash', 2, 0, 8);

// Aggressive
insertModel.run('aggressive', 'equity', 80, 70, 90);
insertModel.run('aggressive', 'fixed_income', 10, 5, 20);
insertModel.run('aggressive', 'real_estate', 5, 0, 10);
insertModel.run('aggressive', 'alternative', 3, 0, 8);
insertModel.run('aggressive', 'cash', 2, 0, 5);

// ── Alerts ────────────────────────────────────────────────────
const insertAlert = db.prepare(`INSERT INTO alerts (client_id, account_id, type, severity, message, resolved, created_at, resolved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

// James — concentration risk (NVDA is >25% of brokerage)
insertAlert.run(c3, a6, 'concentration', 'warning', 'NVDA position exceeds 25% of account value. Consider trimming to reduce single-stock risk.', 0, daysAgo(7), null);

// Vasquez — approaching required minimum distribution
insertAlert.run(c2, a4, 'rmd', 'info', 'Robert Vasquez turns 73 this year. Required Minimum Distribution deadline is April 1 of next year.', 0, daysAgo(30), null);

// Margaret — allocation drift
insertAlert.run(c1, a1, 'drift', 'info', 'Trust account equity allocation has drifted 4.2% above target. Consider rebalancing.', 1, daysAgo(20), daysAgo(14));

// Diane — large withdrawal pending
insertAlert.run(c4, a9, 'distribution', 'info', 'Annual charitable distribution of $50,000 executed. Verify receipt with Community Foundation.', 0, daysAgo(15), null);

// Kevin — 529 contribution reminder
insertAlert.run(c5, null, 'contribution', 'info', 'Annual 529 contribution limit is $18,000 per beneficiary. Emma: $6,000 contributed YTD. Lucas: $4,500 contributed YTD.', 0, daysAgo(5), null);

// Amara — portfolio outperformance
insertAlert.run(c6, a13, 'performance', 'info', 'Portfolio up 28.4% YTD vs. 22.1% benchmark. Consider tax-loss harvesting opportunities in underperforming positions.', 0, daysAgo(3), null);

// James — missing international exposure
insertAlert.run(c3, null, 'diversification', 'warning', 'Portfolio has 0% international exposure. Model allocation recommends 15-20% for aggressive profile.', 0, daysAgo(14), null);

// Vasquez — resolved alert
insertAlert.run(c2, a3, 'rebalance', 'info', 'Quarterly rebalance completed. Fixed income increased from 42% to 50% target.', 1, daysAgo(45), daysAgo(40));

// Count and log
const clientCount = (db.prepare('SELECT COUNT(*) as c FROM clients').get() as any).c;
const accountCount = (db.prepare('SELECT COUNT(*) as c FROM accounts').get() as any).c;
const holdingCount = (db.prepare('SELECT COUNT(*) as c FROM holdings').get() as any).c;
const txCount = (db.prepare('SELECT COUNT(*) as c FROM transactions').get() as any).c;
const modelCount = (db.prepare('SELECT COUNT(*) as c FROM model_allocations').get() as any).c;
const alertCount = (db.prepare('SELECT COUNT(*) as c FROM alerts').get() as any).c;

console.log(`Seeded: ${clientCount} clients, ${accountCount} accounts, ${holdingCount} holdings, ${txCount} transactions, ${modelCount} model allocations, ${alertCount} alerts`);
