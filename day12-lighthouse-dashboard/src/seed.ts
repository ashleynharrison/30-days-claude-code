import db from './database.js';

db.exec(`
  DELETE FROM tasks;
  DELETE FROM trends;
  DELETE FROM budgets;
  DELETE FROM findings;
  DELETE FROM audits;
  DELETE FROM sites;
`);

// ============================================================
// SITES
// ============================================================
const insertSite = db.prepare(`
  INSERT INTO sites (name, url, category, owner, status, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const sites = [
  ['Cascade Digital Agency', 'https://cascadedigital.com', 'Agency Website', 'Marketing Team', 'active', '2025-10-01'],
  ['ShopVibe', 'https://shopvibe.io', 'E-Commerce', 'Product Team', 'active', '2025-11-01'],
  ['Meridian Health Portal', 'https://portal.meridianhealth.com', 'Healthcare Portal', 'Engineering', 'active', '2025-12-01'],
  ['Kindred Kitchen', 'https://kindredkitchen.com', 'Restaurant', 'Owner', 'active', '2026-01-01'],
  ['Forge Labs Docs', 'https://docs.forgelabs.dev', 'Documentation', 'DevRel', 'active', '2026-01-15'],
  ['Vantage Advisory', 'https://vantageadvisory.com', 'Financial Services', 'Marketing Team', 'active', '2026-02-01'],
];

for (const s of sites) {
  insertSite.run(...s);
}

// ============================================================
// AUDITS — 3 audits per site (showing progression over time)
// ============================================================
const insertAudit = db.prepare(`
  INSERT INTO audits (site_id, run_at, device, performance_score, accessibility_score, best_practices_score, seo_score, fcp_ms, lcp_ms, cls, tbt_ms, si_ms, tti_ms, total_byte_weight, dom_size, request_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const audits = [
  // Cascade Digital — improving over time
  [1, '2026-01-15 09:00:00', 'mobile', 42, 78, 83, 90, 3200, 5800, 0.35, 1800, 6200, 8500, 4200000, 1850, 95],
  [1, '2026-02-15 09:00:00', 'mobile', 58, 85, 87, 92, 2400, 4200, 0.18, 1200, 4800, 6200, 3100000, 1450, 72],
  [1, '2026-03-01 09:00:00', 'mobile', 71, 92, 91, 95, 1800, 3100, 0.08, 650, 3400, 4800, 2200000, 1100, 58],

  // ShopVibe — performance issues (heavy e-commerce)
  [2, '2026-01-20 10:00:00', 'mobile', 28, 72, 75, 82, 4100, 8200, 0.42, 3200, 9500, 12000, 6800000, 3200, 142],
  [2, '2026-02-20 10:00:00', 'mobile', 35, 74, 78, 85, 3600, 7100, 0.38, 2800, 8200, 10500, 5900000, 2900, 128],
  [2, '2026-03-02 10:00:00', 'mobile', 38, 76, 79, 86, 3400, 6800, 0.32, 2600, 7800, 9800, 5500000, 2800, 118],

  // Meridian Health — decent but accessibility gaps
  [3, '2026-01-10 08:00:00', 'mobile', 65, 58, 87, 88, 2100, 3800, 0.12, 900, 4200, 5800, 2800000, 1600, 68],
  [3, '2026-02-10 08:00:00', 'mobile', 68, 64, 87, 90, 2000, 3500, 0.10, 850, 3900, 5400, 2600000, 1500, 62],
  [3, '2026-03-03 08:00:00', 'mobile', 72, 68, 91, 92, 1800, 3200, 0.08, 750, 3600, 5000, 2400000, 1400, 55],

  // Kindred Kitchen — good performance, some SEO gaps
  [4, '2026-02-01 11:00:00', 'mobile', 82, 90, 91, 72, 1400, 2400, 0.05, 350, 2800, 3200, 1800000, 800, 38],
  [4, '2026-02-15 11:00:00', 'mobile', 85, 92, 91, 75, 1300, 2200, 0.04, 300, 2600, 3000, 1700000, 780, 35],
  [4, '2026-03-01 11:00:00', 'mobile', 88, 94, 95, 78, 1200, 2100, 0.03, 250, 2400, 2800, 1500000, 750, 32],

  // Forge Labs Docs — excellent (static site)
  [5, '2026-02-01 14:00:00', 'mobile', 95, 98, 100, 97, 600, 1100, 0.01, 50, 1200, 1400, 580000, 420, 18],
  [5, '2026-02-15 14:00:00', 'mobile', 96, 98, 100, 98, 580, 1050, 0.01, 45, 1150, 1350, 560000, 410, 17],
  [5, '2026-03-01 14:00:00', 'mobile', 97, 100, 100, 98, 550, 980, 0.00, 40, 1100, 1300, 540000, 400, 16],

  // Vantage Advisory — mixed (heavy imagery)
  [6, '2026-02-15 09:00:00', 'mobile', 52, 82, 83, 90, 2800, 5200, 0.22, 1500, 5800, 7200, 3800000, 1300, 62],
  [6, '2026-03-01 09:00:00', 'mobile', 55, 85, 87, 92, 2600, 4800, 0.18, 1300, 5200, 6800, 3400000, 1200, 55],
  [6, '2026-03-03 09:00:00', 'mobile', 58, 86, 87, 93, 2500, 4500, 0.15, 1200, 5000, 6400, 3200000, 1150, 52],
];

for (const a of audits) {
  insertAudit.run(...a);
}

// ============================================================
// FINDINGS — tied to the latest audit for each site
// ============================================================
const insertFinding = db.prepare(`
  INSERT INTO findings (audit_id, category, severity, title, description, savings_ms, savings_bytes, element, recommendation)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const findings = [
  // Cascade Digital (audit 3 — latest)
  [3, 'performance', 'medium', 'Render-blocking CSS', '2 external stylesheets block first paint for 800ms.', 800, null, '<link rel="stylesheet" href="/css/animations.css">', 'Inline critical CSS and defer non-critical stylesheets. Use media="print" for print styles.'],
  [3, 'performance', 'high', 'Unoptimized hero image', 'Hero image is 1.2MB PNG. Could be 180KB as WebP.', 1200, 1020000, '<img src="/images/hero-dtla.png">', 'Convert to WebP format. Add width/height attributes. Use srcset for responsive sizes.'],
  [3, 'accessibility', 'medium', 'Missing alt text on 3 images', '3 decorative images lack alt="" attribute.', null, null, '<img src="/images/team-photo.jpg">', 'Add alt="" for decorative images or descriptive alt text for informational images.'],
  [3, 'seo', 'low', 'Missing meta description on /services', 'Services page has no meta description tag.', null, null, '<head> on /services', 'Add unique meta description (150-160 chars) describing the services offered.'],

  // ShopVibe (audit 6 — latest)
  [6, 'performance', 'critical', 'Excessive JavaScript payload', '2.1MB of JavaScript loaded on product pages. Main bundle is 890KB.', 3200, 2100000, '<script src="/js/bundle.min.js">', 'Code-split by route. Lazy-load product image carousels and review widgets. Tree-shake unused lodash methods.'],
  [6, 'performance', 'critical', 'Unoptimized product images', '42 product images are uncompressed JPEGs averaging 320KB each.', 2800, 11200000, '<img src="/products/shoe-001.jpg">', 'Implement lazy loading with loading="lazy". Convert to WebP. Use CDN with auto-optimization (Cloudinary, imgix).'],
  [6, 'performance', 'high', 'No HTTP caching headers', 'Static assets served without Cache-Control headers. Browser re-downloads on every visit.', 1500, null, 'All static assets', 'Set Cache-Control: public, max-age=31536000 for versioned assets. Use immutable for hashed filenames.'],
  [6, 'performance', 'high', 'Third-party script impact', 'Analytics, chat widget, and A/B testing scripts add 1.8s to TBT.', 1800, 680000, 'Multiple <script> tags', 'Defer non-critical scripts. Load chat widget on user interaction. Use Partytown for analytics.'],
  [6, 'accessibility', 'high', 'Color contrast failures', '14 elements fail WCAG AA contrast requirements.', null, null, '.product-price, .sale-badge', 'Increase text contrast. Sale badge (#FF6B35 on white = 3.1:1) needs darker shade or background.'],
  [6, 'accessibility', 'medium', 'Missing form labels', 'Newsletter signup and search inputs lack associated labels.', null, null, '<input type="email" placeholder="Subscribe">', 'Add <label> elements or aria-label attributes to all form inputs.'],
  [6, 'seo', 'medium', 'Missing structured data', 'Product pages lack JSON-LD Product schema markup.', null, null, 'Product detail pages', 'Add Product schema with name, price, availability, reviews. Enables rich snippets in search results.'],

  // Meridian Health (audit 9 — latest)
  [9, 'accessibility', 'critical', 'Missing ARIA landmarks', 'No main, navigation, or complementary landmarks. Screen reader users cannot navigate.', null, null, '<body>', 'Add role="main" or <main>, role="navigation" or <nav>, and role="complementary" or <aside>.'],
  [9, 'accessibility', 'high', 'Form validation not announced', 'Error messages appear visually but are not announced to screen readers.', null, null, '<div class="error-msg">', 'Add role="alert" or aria-live="polite" to error containers. Associate errors with inputs via aria-describedby.'],
  [9, 'accessibility', 'high', 'Keyboard navigation broken', 'Modal dialogs do not trap focus. Users can tab behind the modal.', null, null, '<div class="modal">', 'Implement focus trapping in modals. Return focus to trigger element on close. Add Escape key handler.'],
  [9, 'performance', 'medium', 'Unused CSS', '68% of CSS is unused on the patient portal dashboard.', 400, 180000, '<link href="/css/portal.css">', 'Use PurgeCSS or CSS modules. Split portal.css into route-specific chunks.'],

  // Kindred Kitchen (audit 12 — latest)
  [12, 'seo', 'high', 'Missing Open Graph tags', 'No og:image, og:title, or og:description on menu and location pages.', null, null, '<head> on /menu, /locations', 'Add Open Graph tags with appetizing food imagery. Critical for social sharing of menu items.'],
  [12, 'seo', 'medium', 'No sitemap.xml', 'Site lacks an XML sitemap. 4 locations + menu + catering pages may not be indexed.', null, null, 'Root domain', 'Generate and submit sitemap.xml to Google Search Console. Include lastmod dates.'],
  [12, 'performance', 'low', 'Font display swap', 'Playfair Display loads without font-display: swap, causing 200ms FOIT.', 200, null, '@font-face for Playfair Display', 'Add font-display: swap to @font-face declaration or Google Fonts URL parameter.'],

  // Vantage Advisory (audit 18 — latest)
  [18, 'performance', 'high', 'Oversized hero video', 'Background video on homepage is 8.2MB MP4 that autoplays.', 2200, 8200000, '<video autoplay src="/videos/skyline.mp4">', 'Replace with compressed WebM (target 1.5MB). Add poster image for immediate visual. Defer video load.'],
  [18, 'performance', 'medium', 'Web font overhead', 'Loading 6 weights of EB Garamond and 4 weights of Inter (420KB total).', 600, 420000, '@font-face declarations', 'Subset to Latin characters. Reduce to 3 weights per font. Use variable fonts if available.'],
  [18, 'accessibility', 'medium', 'Low contrast on silver text', 'Secondary text (#9CA3AF on #F8F6F3) has 2.6:1 contrast — fails WCAG AA.', null, null, '.meta-text, .date-label', 'Darken secondary text to #6B7280 (4.5:1 contrast) or use a darker background.'],
];

for (const f of findings) {
  insertFinding.run(...f);
}

// ============================================================
// BUDGETS
// ============================================================
const insertBudget = db.prepare(`
  INSERT INTO budgets (site_id, metric, budget_value, unit, status)
  VALUES (?, ?, ?, ?, ?)
`);

const budgets = [
  [1, 'LCP', 2500, 'ms', 'over_budget'],
  [1, 'CLS', 0.10, 'score', 'within_budget'],
  [1, 'Total Weight', 2000000, 'bytes', 'over_budget'],
  [1, 'Performance Score', 80, 'score', 'within_budget'],

  [2, 'LCP', 2500, 'ms', 'over_budget'],
  [2, 'CLS', 0.10, 'score', 'over_budget'],
  [2, 'Total Weight', 3000000, 'bytes', 'over_budget'],
  [2, 'Performance Score', 60, 'score', 'over_budget'],
  [2, 'Request Count', 80, 'count', 'over_budget'],

  [4, 'LCP', 2500, 'ms', 'within_budget'],
  [4, 'Performance Score', 85, 'score', 'within_budget'],
  [4, 'SEO Score', 90, 'score', 'over_budget'],

  [5, 'LCP', 1500, 'ms', 'within_budget'],
  [5, 'Performance Score', 95, 'score', 'within_budget'],
  [5, 'Accessibility Score', 98, 'score', 'within_budget'],

  [6, 'LCP', 2500, 'ms', 'over_budget'],
  [6, 'Total Weight', 2500000, 'bytes', 'over_budget'],
  [6, 'Performance Score', 70, 'score', 'over_budget'],
];

for (const b of budgets) {
  insertBudget.run(...b);
}

// ============================================================
// TRENDS (weekly snapshots)
// ============================================================
const insertTrend = db.prepare(`
  INSERT INTO trends (site_id, week_of, device, avg_performance, avg_accessibility, avg_best_practices, avg_seo, avg_lcp_ms, avg_cls, avg_fcp_ms)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const trendWeeks = ['2026-01-06', '2026-01-13', '2026-01-20', '2026-01-27', '2026-02-03', '2026-02-10', '2026-02-17', '2026-02-24', '2026-03-03'];

// Cascade — steady improvement
const cascadeTrend = [42, 45, 48, 52, 55, 58, 62, 67, 71];
for (let i = 0; i < trendWeeks.length; i++) {
  insertTrend.run(1, trendWeeks[i], 'mobile', cascadeTrend[i], 78 + i * 2, 83 + i, 90 + Math.floor(i / 2), 5800 - i * 300, 0.35 - i * 0.03, 3200 - i * 160);
}

// ShopVibe — struggling
const shopTrend = [25, 28, 27, 30, 32, 35, 34, 36, 38];
for (let i = 0; i < trendWeeks.length; i++) {
  insertTrend.run(2, trendWeeks[i], 'mobile', shopTrend[i], 72 + Math.floor(i / 2), 75 + Math.floor(i / 2), 82 + Math.floor(i / 2), 8200 - i * 150, 0.42 - i * 0.01, 4100 - i * 80);
}

// Forge Labs — consistently excellent
const forgeTrend = [93, 94, 95, 95, 96, 96, 96, 97, 97];
for (let i = 0; i < trendWeeks.length; i++) {
  insertTrend.run(5, trendWeeks[i], 'mobile', forgeTrend[i], 98, 100, 97 + Math.floor(i / 4), 1100 - i * 15, 0.01, 600 - i * 6);
}

// ============================================================
// OPTIMIZATION TASKS
// ============================================================
const insertTask = db.prepare(`
  INSERT INTO tasks (site_id, finding_id, title, priority, category, estimated_impact, status, assigned_to, created_at, completed_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const tasks = [
  // Cascade
  [1, 2, 'Convert hero image to WebP', 'high', 'performance', '+15 performance, -1s LCP', 'in_progress', 'Dev Team', '2026-03-01', null],
  [1, 1, 'Inline critical CSS', 'medium', 'performance', '+5 performance, -800ms FCP', 'open', 'Dev Team', '2026-03-01', null],
  [1, 3, 'Add alt text to team photos', 'medium', 'accessibility', '+3 accessibility', 'completed', 'Content Team', '2026-03-01', '2026-03-02'],

  // ShopVibe
  [2, 5, 'Code-split JavaScript bundles', 'critical', 'performance', '+20 performance, -3s TTI', 'open', 'Engineering', '2026-03-02', null],
  [2, 6, 'Implement image optimization pipeline', 'critical', 'performance', '+15 performance, -2.8s LCP', 'open', 'Engineering', '2026-03-02', null],
  [2, 7, 'Add HTTP caching headers', 'high', 'performance', '+8 performance', 'in_progress', 'DevOps', '2026-03-02', null],
  [2, 8, 'Defer third-party scripts', 'high', 'performance', '-1.8s TBT', 'open', 'Engineering', '2026-03-02', null],
  [2, 9, 'Fix color contrast on product pages', 'high', 'accessibility', '+8 accessibility', 'open', 'Design', '2026-03-02', null],
  [2, 11, 'Add Product schema markup', 'medium', 'seo', '+5 SEO, rich snippets', 'open', 'Engineering', '2026-03-02', null],

  // Meridian Health
  [3, 12, 'Add ARIA landmarks to portal', 'critical', 'accessibility', '+15 accessibility', 'in_progress', 'Engineering', '2026-03-03', null],
  [3, 13, 'Fix form validation announcements', 'high', 'accessibility', '+8 accessibility', 'open', 'Engineering', '2026-03-03', null],
  [3, 14, 'Implement modal focus trapping', 'high', 'accessibility', '+5 accessibility', 'open', 'Engineering', '2026-03-03', null],

  // Kindred Kitchen
  [4, 16, 'Add Open Graph tags', 'high', 'seo', '+10 SEO, social sharing', 'open', 'Dev Team', '2026-03-01', null],
  [4, 17, 'Generate and submit sitemap', 'medium', 'seo', '+5 SEO', 'completed', 'Dev Team', '2026-03-01', '2026-03-02'],

  // Vantage Advisory
  [6, 19, 'Compress/replace hero video', 'high', 'performance', '+15 performance, -2s LCP', 'open', 'Marketing', '2026-03-03', null],
  [6, 20, 'Optimize web font loading', 'medium', 'performance', '+5 performance, -600ms', 'open', 'Dev Team', '2026-03-03', null],
];

for (const t of tasks) {
  insertTask.run(...t);
}

console.log('Seeded: 6 sites, 18 audits, 22 findings, 18 budgets, 27 trend snapshots, 16 tasks');
