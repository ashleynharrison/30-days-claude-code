import db from './database.js';

// Clear existing data
db.exec(`
  DELETE FROM win_loss;
  DELETE FROM positioning;
  DELETE FROM market_moves;
  DELETE FROM features;
  DELETE FROM pricing;
  DELETE FROM competitors;
`);

// ── Competitors ────────────────────────────────────────────────────
const insertCompetitor = db.prepare(`INSERT INTO competitors (name, website, category, founded_year, hq_location, employee_count, funding_total, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const c1 = insertCompetitor.run('RivalStack', 'rivalstack.io', 'Developer Tools', 2019, 'San Francisco, CA', '150-200', '$42M Series B', 'active', 'Primary competitor. Strong engineering team, aggressive pricing.').lastInsertRowid;
const c2 = insertCompetitor.run('CloudPilot', 'cloudpilot.com', 'Developer Tools', 2020, 'Austin, TX', '80-120', '$28M Series A', 'active', 'Fast-growing. Targeting mid-market aggressively.').lastInsertRowid;
const c3 = insertCompetitor.run('BuildForge', 'buildforge.dev', 'Developer Tools', 2018, 'New York, NY', '300-400', '$85M Series C', 'active', 'Market leader in enterprise. Slower to innovate but deep pockets.').lastInsertRowid;
const c4 = insertCompetitor.run('DeployHQ', 'deployhq.io', 'DevOps', 2021, 'London, UK', '40-60', '$12M Seed+', 'active', 'Niche player in deployment automation. Strong in EU market.').lastInsertRowid;
const c5 = insertCompetitor.run('ShipFast', 'shipfast.dev', 'Developer Tools', 2022, 'Remote', '20-30', '$5M Seed', 'active', 'Scrappy startup. Developer-first approach. Growing fast on Twitter.').lastInsertRowid;
const c6 = insertCompetitor.run('PlatformNine', 'platformnine.com', 'Platform Engineering', 2017, 'Seattle, WA', '500-700', '$120M Series D', 'active', 'Enterprise heavyweight. Slow sales cycle but huge ACV.').lastInsertRowid;

// ── Pricing ────────────────────────────────────────────────────
const insertPricing = db.prepare(`INSERT INTO pricing (competitor_id, tier_name, price_monthly, price_annual, billing_model, key_limits, recorded_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

// RivalStack pricing
insertPricing.run(c1, 'Starter', 0, 0, 'free', '1 project, 100 builds/mo', '2026-03-01', 'Free tier to capture developers');
insertPricing.run(c1, 'Pro', 29, 290, 'per_seat', '10 projects, unlimited builds', '2026-03-01', 'Main revenue tier');
insertPricing.run(c1, 'Team', 79, 790, 'per_seat', 'Unlimited projects, priority support', '2026-03-01', 'Added SAML SSO in Feb 2026');
insertPricing.run(c1, 'Enterprise', null, null, 'custom', 'Custom limits, SLA, dedicated support', '2026-03-01', 'Starting at ~$500/seat/yr');

// CloudPilot pricing
insertPricing.run(c2, 'Free', 0, 0, 'free', '2 projects, 50 deployments/mo', '2026-03-01', null);
insertPricing.run(c2, 'Growth', 19, 190, 'per_seat', '5 projects, 500 deployments/mo', '2026-03-01', 'Undercuts RivalStack by 34%');
insertPricing.run(c2, 'Scale', 49, 490, 'per_seat', 'Unlimited projects, advanced analytics', '2026-03-01', null);
insertPricing.run(c2, 'Enterprise', null, null, 'custom', 'SSO, audit log, SLA', '2026-03-01', 'New enterprise tier launched Jan 2026');

// BuildForge pricing
insertPricing.run(c3, 'Community', 0, 0, 'free', '1 project, basic features', '2026-03-01', null);
insertPricing.run(c3, 'Professional', 45, 450, 'per_seat', '25 projects, all integrations', '2026-03-01', 'Price increase from $39 in Q4 2025');
insertPricing.run(c3, 'Business', 99, 990, 'per_seat', 'Unlimited, RBAC, audit trails', '2026-03-01', null);
insertPricing.run(c3, 'Enterprise', null, null, 'custom', 'On-prem option, dedicated CSM', '2026-03-01', 'Avg ACV reportedly $150K+');

// DeployHQ pricing
insertPricing.run(c4, 'Solo', 0, 0, 'free', '1 project', '2026-03-01', null);
insertPricing.run(c4, 'Team', 25, 250, 'flat_rate', '10 projects, 5 users', '2026-03-01', 'Flat rate, not per-seat');
insertPricing.run(c4, 'Business', 75, 750, 'flat_rate', '50 projects, 20 users', '2026-03-01', null);

// ShipFast pricing
insertPricing.run(c5, 'Hacker', 0, 0, 'free', '3 projects, community support', '2026-03-01', 'Generous free tier');
insertPricing.run(c5, 'Pro', 15, 150, 'per_seat', 'Unlimited projects, email support', '2026-03-01', 'Cheapest paid tier in the market');
insertPricing.run(c5, 'Team', 39, 390, 'per_seat', 'Org features, Slack support', '2026-03-01', null);

// PlatformNine pricing
insertPricing.run(c6, 'Starter', 99, 990, 'per_seat', '10 services, basic observability', '2026-03-01', 'No free tier');
insertPricing.run(c6, 'Professional', 199, 1990, 'per_seat', '50 services, full observability', '2026-03-01', null);
insertPricing.run(c6, 'Enterprise', null, null, 'custom', 'Unlimited, on-prem, dedicated team', '2026-03-01', 'Min contract ~$250K/yr');

// ── Features ────────────────────────────────────────────────────
const insertFeature = db.prepare(`INSERT INTO features (competitor_id, feature_category, feature_name, supported, maturity, notes, recorded_date) VALUES (?, ?, ?, ?, ?, ?, ?)`);

const featureMatrix = [
  // CI/CD
  { cat: 'CI/CD', name: 'GitHub Actions Integration', data: [[c1,1,'mature'],[c2,1,'mature'],[c3,1,'mature'],[c4,1,'growing'],[c5,1,'mature'],[c6,1,'mature']] },
  { cat: 'CI/CD', name: 'GitLab CI Integration', data: [[c1,1,'mature'],[c2,1,'growing'],[c3,1,'mature'],[c4,0,null],[c5,0,null],[c6,1,'mature']] },
  { cat: 'CI/CD', name: 'Preview Deployments', data: [[c1,1,'mature'],[c2,1,'mature'],[c3,1,'growing'],[c4,1,'mature'],[c5,1,'growing'],[c6,0,null]] },
  { cat: 'CI/CD', name: 'Rollback Protection', data: [[c1,1,'growing'],[c2,0,null],[c3,1,'mature'],[c4,1,'mature'],[c5,0,null],[c6,1,'mature']] },
  // Collaboration
  { cat: 'Collaboration', name: 'Team Workspaces', data: [[c1,1,'mature'],[c2,1,'growing'],[c3,1,'mature'],[c4,0,null],[c5,1,'new'],[c6,1,'mature']] },
  { cat: 'Collaboration', name: 'RBAC / Permissions', data: [[c1,1,'growing'],[c2,0,null],[c3,1,'mature'],[c4,0,null],[c5,0,null],[c6,1,'mature']] },
  { cat: 'Collaboration', name: 'Audit Logs', data: [[c1,1,'new'],[c2,0,null],[c3,1,'mature'],[c4,0,null],[c5,0,null],[c6,1,'mature']] },
  // Analytics
  { cat: 'Analytics', name: 'Build Analytics', data: [[c1,1,'mature'],[c2,1,'growing'],[c3,1,'mature'],[c4,0,null],[c5,0,null],[c6,1,'mature']] },
  { cat: 'Analytics', name: 'Cost Tracking', data: [[c1,0,null],[c2,1,'new'],[c3,1,'growing'],[c4,0,null],[c5,0,null],[c6,1,'mature']] },
  { cat: 'Analytics', name: 'Usage Dashboards', data: [[c1,1,'growing'],[c2,1,'growing'],[c3,1,'mature'],[c4,1,'growing'],[c5,0,null],[c6,1,'mature']] },
  // Security
  { cat: 'Security', name: 'SSO / SAML', data: [[c1,1,'new'],[c2,0,null],[c3,1,'mature'],[c4,0,null],[c5,0,null],[c6,1,'mature']] },
  { cat: 'Security', name: 'SOC 2 Compliance', data: [[c1,1,'mature'],[c2,0,null],[c3,1,'mature'],[c4,0,null],[c5,0,null],[c6,1,'mature']] },
  { cat: 'Security', name: 'Secret Management', data: [[c1,1,'mature'],[c2,1,'growing'],[c3,1,'mature'],[c4,1,'growing'],[c5,1,'growing'],[c6,1,'mature']] },
  // AI
  { cat: 'AI Features', name: 'AI Code Review', data: [[c1,1,'new'],[c2,0,null],[c3,1,'growing'],[c4,0,null],[c5,1,'new'],[c6,0,null]] },
  { cat: 'AI Features', name: 'AI Error Diagnosis', data: [[c1,1,'new'],[c2,0,null],[c3,0,null],[c4,0,null],[c5,1,'new'],[c6,0,null]] },
  { cat: 'AI Features', name: 'Natural Language Queries', data: [[c1,0,null],[c2,0,null],[c3,0,null],[c4,0,null],[c5,0,null],[c6,0,null]] },
];

for (const feat of featureMatrix) {
  for (const [compId, supported, maturity] of feat.data) {
    insertFeature.run(compId, feat.cat, feat.name, supported, maturity, null, '2026-03-01');
  }
}

// ── Market Moves ────────────────────────────────────────────────────
const insertMove = db.prepare(`INSERT INTO market_moves (competitor_id, move_type, title, description, impact, source_url, move_date) VALUES (?, ?, ?, ?, ?, ?, ?)`);

insertMove.run(c1, 'product_launch', 'RivalStack launches AI Code Review', 'Integrated AI-powered code review directly into their CI pipeline. Automatic suggestions on PRs.', 'high', 'https://rivalstack.io/blog/ai-code-review', '2026-02-15');
insertMove.run(c1, 'pricing_change', 'RivalStack adds SAML SSO to Team tier', 'Previously enterprise-only, SSO is now available on the $79/seat Team plan.', 'medium', null, '2026-02-01');
insertMove.run(c1, 'partnership', 'RivalStack partners with Datadog', 'Deep integration with Datadog for build observability and error tracking.', 'medium', null, '2026-01-20');

insertMove.run(c2, 'funding', 'CloudPilot raises $28M Series A', 'Led by Andreessen Horowitz. Plans to expand into EU and add enterprise features.', 'high', null, '2026-01-10');
insertMove.run(c2, 'product_launch', 'CloudPilot launches Enterprise tier', 'New enterprise plan with SSO, audit logs, and SLA. Targeting mid-market accounts.', 'high', null, '2026-01-25');
insertMove.run(c2, 'hire', 'CloudPilot hires ex-Vercel VP of Engineering', 'Key hire signals aggressive push into developer experience.', 'medium', null, '2026-02-10');

insertMove.run(c3, 'pricing_change', 'BuildForge raises Pro tier from $39 to $45', 'First price increase in 2 years. Grandfathered existing customers for 6 months.', 'medium', null, '2025-12-01');
insertMove.run(c3, 'acquisition', 'BuildForge acquires TestRunner.io', 'Acqui-hire of 15-person testing infrastructure startup. Expanding CI capabilities.', 'high', null, '2026-02-20');
insertMove.run(c3, 'product_launch', 'BuildForge launches on-prem offering', 'Self-hosted option for regulated industries. HIPAA and FedRAMP in progress.', 'high', null, '2026-03-01');

insertMove.run(c4, 'product_launch', 'DeployHQ adds Kubernetes support', 'Native K8s deployment support with Helm chart integration.', 'medium', null, '2026-02-05');
insertMove.run(c4, 'expansion', 'DeployHQ opens APAC region', 'Singapore and Tokyo data centers now available. Targeting Asia-Pacific expansion.', 'medium', null, '2026-01-15');

insertMove.run(c5, 'viral', 'ShipFast hits #1 on Hacker News', 'Show HN post reached top spot. 2,000 signups in 48 hours.', 'high', null, '2026-02-25');
insertMove.run(c5, 'product_launch', 'ShipFast launches AI error diagnosis', 'Uses LLM to automatically diagnose build failures and suggest fixes.', 'medium', null, '2026-03-05');
insertMove.run(c5, 'hire', 'ShipFast hires head of sales (first sales hire)', 'Moving from PLG-only to adding sales motion. Targeting $1M ARR.', 'low', null, '2026-03-10');

insertMove.run(c6, 'product_launch', 'PlatformNine launches self-service portal', 'Developer portal for internal platform teams. Backstage alternative.', 'medium', null, '2026-01-30');
insertMove.run(c6, 'partnership', 'PlatformNine partners with AWS', 'Official AWS Partner Network (APN) Advanced Partner status.', 'high', null, '2026-02-18');

// ── Positioning ────────────────────────────────────────────────────
const insertPositioning = db.prepare(`INSERT INTO positioning (competitor_id, tagline, target_audience, value_proposition, differentiators, tone, recorded_date) VALUES (?, ?, ?, ?, ?, ?, ?)`);

insertPositioning.run(c1, 'Ship faster. Break nothing.', 'Mid-market engineering teams (50-500 devs)', 'Speed + reliability in one platform. CI/CD, preview deploys, and now AI code review.', 'AI-powered features, generous free tier, fast onboarding', 'Developer-friendly, technical, confident', '2026-03-01');
insertPositioning.run(c2, 'Deploy with confidence.', 'Startups and mid-market (10-200 devs)', 'Simple, affordable deployment pipeline. Get from code to production in minutes.', 'Lowest pricing in market, simplicity, speed to value', 'Approachable, startup-y, "we get it"', '2026-03-01');
insertPositioning.run(c3, 'Enterprise-grade. Developer-loved.', 'Enterprise engineering orgs (500+ devs)', 'Full platform for CI/CD, testing, and deployment at scale. Compliance built in.', 'Enterprise compliance (SOC2, HIPAA), on-prem option, deep integrations', 'Professional, enterprise, trust-focused', '2026-03-01');
insertPositioning.run(c4, 'Deployment, simplified.', 'Small teams and agencies (5-50 devs)', 'One tool for deployments. No complexity. Flat-rate pricing.', 'Flat-rate pricing (not per-seat), EU-based, GDPR-first', 'Straightforward, no-nonsense, European', '2026-03-01');
insertPositioning.run(c5, 'From commit to production in 30 seconds.', 'Individual developers and small teams (1-20 devs)', 'The fastest way to ship. Developer experience above everything else.', 'Speed, DX, cheapest paid tier, AI features early', 'Casual, meme-friendly, Twitter-native', '2026-03-01');
insertPositioning.run(c6, 'The platform for platforms.', 'Platform engineering teams in enterprise (100+ devs)', 'Internal developer platform. Service catalog, golden paths, self-service.', 'Platform engineering focus, IDP, service mesh, deep K8s', 'Enterprise, consultative, thought-leadership', '2026-03-01');

// ── Win/Loss ────────────────────────────────────────────────────
const insertWinLoss = db.prepare(`INSERT INTO win_loss (competitor_id, deal_name, outcome, deal_size, industry, reason, notes, deal_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

insertWinLoss.run(c1, 'Acme Corp Migration', 'loss', '$45K ARR', 'SaaS', 'Better AI features and faster onboarding', 'They loved our support but RivalStack AI code review was a differentiator', '2026-02-20');
insertWinLoss.run(c1, 'TechStart Inc', 'win', '$18K ARR', 'Startup', 'Pricing and existing relationship', 'Chose us over RivalStack on price. AI features were nice-to-have for them', '2026-01-15');
insertWinLoss.run(c2, 'GrowthCo Platform', 'loss', '$22K ARR', 'E-Commerce', 'Lower price point and simpler setup', 'CloudPilot was 40% cheaper. Customer valued simplicity over features', '2026-02-05');
insertWinLoss.run(c2, 'DataFlow Systems', 'win', '$35K ARR', 'FinTech', 'Compliance requirements CloudPilot could not meet', 'SOC2 requirement eliminated CloudPilot. Our compliance story won it', '2026-03-01');
insertWinLoss.run(c3, 'MegaCorp Renewal', 'loss', '$180K ARR', 'Enterprise', 'Existing relationship and on-prem option', 'BuildForge on-prem option was a requirement. We could not compete', '2026-01-30');
insertWinLoss.run(c3, 'Global Logistics Co', 'win', '$95K ARR', 'Logistics', 'Better developer experience and faster implementation', 'BuildForge sales cycle was 6 months. We closed in 6 weeks', '2026-02-15');
insertWinLoss.run(c5, 'IndieDevShop', 'loss', '$8K ARR', 'Agency', 'Price sensitivity and Twitter community', 'Small agency picked ShipFast at $15/seat. Hard to compete on price alone', '2026-03-05');
insertWinLoss.run(c6, 'FinanceHub Platform', 'loss', '$200K ARR', 'Finance', 'IDP capabilities we do not offer', 'PlatformNine service catalog was exactly what they needed. Different category', '2026-02-28');
insertWinLoss.run(c4, 'EU Consulting Group', 'loss', '$15K ARR', 'Consulting', 'GDPR and data residency requirements', 'DeployHQ EU data centers and GDPR-first approach was a must-have', '2026-01-20');
insertWinLoss.run(c1, 'SeriesB Startup', 'win', '$28K ARR', 'SaaS', 'Integration depth and team features', 'RivalStack lacked the Jira integration they needed. Our ecosystem won', '2026-03-10');

// Count and log
const competitorCount = (db.prepare('SELECT COUNT(*) as c FROM competitors').get() as any).c;
const pricingCount = (db.prepare('SELECT COUNT(*) as c FROM pricing').get() as any).c;
const featureCount = (db.prepare('SELECT COUNT(*) as c FROM features').get() as any).c;
const moveCount = (db.prepare('SELECT COUNT(*) as c FROM market_moves').get() as any).c;
const positioningCount = (db.prepare('SELECT COUNT(*) as c FROM positioning').get() as any).c;
const winLossCount = (db.prepare('SELECT COUNT(*) as c FROM win_loss').get() as any).c;

console.log(`Seeded: ${competitorCount} competitors, ${pricingCount} pricing tiers, ${featureCount} features, ${moveCount} market moves, ${positioningCount} positioning snapshots, ${winLossCount} win/loss records`);
