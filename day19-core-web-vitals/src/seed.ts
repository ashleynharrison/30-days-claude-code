import db from './database.js';

// Clear existing data
db.exec(`
  DELETE FROM resources;
  DELETE FROM alerts;
  DELETE FROM recommendations;
  DELETE FROM budgets;
  DELETE FROM measurements;
  DELETE FROM sites;
`);

const now = new Date();
function daysAgo(n: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ── Sites ────────────────────────────────────────────────────
const insertSite = db.prepare(`INSERT INTO sites (name, url, category, owner, status) VALUES (?, ?, ?, ?, ?)`);

const s1 = insertSite.run('Acme Store', 'https://store.acme.com', 'E-Commerce', 'Sarah Chen', 'active').lastInsertRowid;
const s2 = insertSite.run('Acme Blog', 'https://blog.acme.com', 'Content', 'Jake Torres', 'active').lastInsertRowid;
const s3 = insertSite.run('Acme Dashboard', 'https://app.acme.com', 'SaaS App', 'Priya Patel', 'active').lastInsertRowid;
const s4 = insertSite.run('Acme Marketing', 'https://acme.com', 'Marketing', 'Sarah Chen', 'active').lastInsertRowid;
const s5 = insertSite.run('Acme Docs', 'https://docs.acme.com', 'Documentation', 'Marcus Lee', 'active').lastInsertRowid;
const s6 = insertSite.run('Acme Careers', 'https://careers.acme.com', 'Careers', 'HR Team', 'active').lastInsertRowid;

// ── Measurements (8 weeks of history, weekly snapshots) ────────────────
const insertMeasurement = db.prepare(`INSERT INTO measurements (site_id, lcp_ms, cls, inp_ms, fcp_ms, ttfb_ms, speed_index, total_blocking_time_ms, device, measured_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

// Acme Store — LCP regression (hero image got bigger)
const storeData = [
  { day: 56, lcp: 2100, cls: 0.05, inp: 180, fcp: 1200, ttfb: 320, si: 2800, tbt: 220, note: null },
  { day: 49, lcp: 2200, cls: 0.06, inp: 175, fcp: 1250, ttfb: 310, si: 2900, tbt: 230, note: null },
  { day: 42, lcp: 2150, cls: 0.04, inp: 190, fcp: 1180, ttfb: 330, si: 2750, tbt: 210, note: null },
  { day: 35, lcp: 2400, cls: 0.08, inp: 200, fcp: 1300, ttfb: 340, si: 3100, tbt: 250, note: 'New hero image deployed — 4.2MB unoptimized' },
  { day: 28, lcp: 3200, cls: 0.12, inp: 210, fcp: 1400, ttfb: 360, si: 3800, tbt: 280, note: 'LCP regression detected' },
  { day: 21, lcp: 3400, cls: 0.11, inp: 220, fcp: 1450, ttfb: 350, si: 3900, tbt: 290, note: null },
  { day: 14, lcp: 3100, cls: 0.09, inp: 205, fcp: 1350, ttfb: 340, si: 3600, tbt: 260, note: 'Partial fix: lazy-loaded below-fold images' },
  { day: 7,  lcp: 2800, cls: 0.07, inp: 195, fcp: 1280, ttfb: 330, si: 3300, tbt: 240, note: 'Hero image compressed to 850KB' },
];
for (const m of storeData) {
  insertMeasurement.run(s1, m.lcp, m.cls, m.inp, m.fcp, m.ttfb, m.si, m.tbt, 'mobile', daysAgo(m.day), m.note);
  insertMeasurement.run(s1, m.lcp * 0.7, m.cls * 0.8, m.inp * 0.6, m.fcp * 0.7, m.ttfb * 0.9, m.si * 0.7, m.tbt * 0.6, 'desktop', daysAgo(m.day), m.note);
}

// Acme Blog — stable, good performance
const blogData = [
  { day: 56, lcp: 1400, cls: 0.02, inp: 90, fcp: 800, ttfb: 180, si: 1600, tbt: 80 },
  { day: 49, lcp: 1350, cls: 0.02, inp: 85, fcp: 780, ttfb: 175, si: 1550, tbt: 75 },
  { day: 42, lcp: 1380, cls: 0.03, inp: 92, fcp: 810, ttfb: 185, si: 1580, tbt: 82 },
  { day: 35, lcp: 1420, cls: 0.02, inp: 88, fcp: 790, ttfb: 178, si: 1620, tbt: 78 },
  { day: 28, lcp: 1390, cls: 0.01, inp: 86, fcp: 785, ttfb: 176, si: 1570, tbt: 76 },
  { day: 21, lcp: 1360, cls: 0.02, inp: 91, fcp: 805, ttfb: 182, si: 1560, tbt: 81 },
  { day: 14, lcp: 1410, cls: 0.02, inp: 87, fcp: 795, ttfb: 179, si: 1600, tbt: 77 },
  { day: 7,  lcp: 1370, cls: 0.01, inp: 84, fcp: 775, ttfb: 173, si: 1540, tbt: 74 },
];
for (const m of blogData) {
  insertMeasurement.run(s2, m.lcp, m.cls, m.inp, m.fcp, m.ttfb, m.si, m.tbt, 'mobile', daysAgo(m.day), null);
  insertMeasurement.run(s2, m.lcp * 0.7, m.cls * 0.8, m.inp * 0.6, m.fcp * 0.7, m.ttfb * 0.9, m.si * 0.7, m.tbt * 0.6, 'desktop', daysAgo(m.day), null);
}

// Acme Dashboard — poor INP (heavy JS)
const dashData = [
  { day: 56, lcp: 1800, cls: 0.03, inp: 380, fcp: 1100, ttfb: 250, si: 2200, tbt: 520 },
  { day: 49, lcp: 1850, cls: 0.04, inp: 400, fcp: 1120, ttfb: 260, si: 2300, tbt: 540 },
  { day: 42, lcp: 1780, cls: 0.03, inp: 420, fcp: 1080, ttfb: 240, si: 2150, tbt: 560 },
  { day: 35, lcp: 1900, cls: 0.05, inp: 450, fcp: 1150, ttfb: 270, si: 2400, tbt: 600 },
  { day: 28, lcp: 1820, cls: 0.04, inp: 430, fcp: 1110, ttfb: 255, si: 2250, tbt: 570 },
  { day: 21, lcp: 1750, cls: 0.03, inp: 410, fcp: 1070, ttfb: 235, si: 2100, tbt: 550 },
  { day: 14, lcp: 1830, cls: 0.04, inp: 390, fcp: 1130, ttfb: 260, si: 2280, tbt: 530 },
  { day: 7,  lcp: 1790, cls: 0.03, inp: 370, fcp: 1090, ttfb: 245, si: 2180, tbt: 510 },
];
for (const m of dashData) {
  insertMeasurement.run(s3, m.lcp, m.cls, m.inp, m.fcp, m.ttfb, m.si, m.tbt, 'mobile', daysAgo(m.day), null);
  insertMeasurement.run(s3, m.lcp * 0.7, m.cls * 0.8, m.inp * 0.6, m.fcp * 0.7, m.ttfb * 0.9, m.si * 0.7, m.tbt * 0.6, 'desktop', daysAgo(m.day), null);
}

// Acme Marketing — CLS issues (ad slots shifting layout)
const marketingData = [
  { day: 56, lcp: 1900, cls: 0.18, inp: 150, fcp: 1000, ttfb: 200, si: 2400, tbt: 160 },
  { day: 49, lcp: 1950, cls: 0.20, inp: 155, fcp: 1020, ttfb: 210, si: 2450, tbt: 170 },
  { day: 42, lcp: 1880, cls: 0.22, inp: 148, fcp: 990, ttfb: 195, si: 2380, tbt: 155 },
  { day: 35, lcp: 1920, cls: 0.25, inp: 160, fcp: 1010, ttfb: 205, si: 2420, tbt: 165 },
  { day: 28, lcp: 1870, cls: 0.19, inp: 145, fcp: 980, ttfb: 190, si: 2360, tbt: 150 },
  { day: 21, lcp: 1910, cls: 0.21, inp: 152, fcp: 1005, ttfb: 200, si: 2400, tbt: 158 },
  { day: 14, lcp: 1860, cls: 0.15, inp: 142, fcp: 970, ttfb: 188, si: 2340, tbt: 148 },
  { day: 7,  lcp: 1840, cls: 0.13, inp: 138, fcp: 960, ttfb: 185, si: 2300, tbt: 142 },
];
for (const m of marketingData) {
  insertMeasurement.run(s4, m.lcp, m.cls, m.inp, m.fcp, m.ttfb, m.si, m.tbt, 'mobile', daysAgo(m.day), null);
  insertMeasurement.run(s4, m.lcp * 0.7, m.cls * 0.8, m.inp * 0.6, m.fcp * 0.7, m.ttfb * 0.9, m.si * 0.7, m.tbt * 0.6, 'desktop', daysAgo(m.day), null);
}

// Acme Docs — fast, minimal
const docsData = [
  { day: 56, lcp: 900, cls: 0.01, inp: 60, fcp: 500, ttfb: 120, si: 1000, tbt: 30 },
  { day: 49, lcp: 920, cls: 0.01, inp: 62, fcp: 510, ttfb: 125, si: 1020, tbt: 32 },
  { day: 42, lcp: 880, cls: 0.00, inp: 58, fcp: 490, ttfb: 118, si: 980, tbt: 28 },
  { day: 35, lcp: 910, cls: 0.01, inp: 61, fcp: 505, ttfb: 122, si: 1010, tbt: 31 },
  { day: 28, lcp: 890, cls: 0.01, inp: 59, fcp: 495, ttfb: 119, si: 990, tbt: 29 },
  { day: 21, lcp: 930, cls: 0.01, inp: 63, fcp: 515, ttfb: 126, si: 1030, tbt: 33 },
  { day: 14, lcp: 900, cls: 0.00, inp: 57, fcp: 488, ttfb: 117, si: 995, tbt: 27 },
  { day: 7,  lcp: 885, cls: 0.01, inp: 56, fcp: 485, ttfb: 115, si: 975, tbt: 26 },
];
for (const m of docsData) {
  insertMeasurement.run(s5, m.lcp, m.cls, m.inp, m.fcp, m.ttfb, m.si, m.tbt, 'mobile', daysAgo(m.day), null);
  insertMeasurement.run(s5, m.lcp * 0.7, m.cls * 0.8, m.inp * 0.6, m.fcp * 0.7, m.ttfb * 0.9, m.si * 0.7, m.tbt * 0.6, 'desktop', daysAgo(m.day), null);
}

// Acme Careers — slow TTFB (server-side rendering bottleneck)
const careersData = [
  { day: 56, lcp: 2600, cls: 0.04, inp: 130, fcp: 1600, ttfb: 800, si: 3200, tbt: 180 },
  { day: 49, lcp: 2700, cls: 0.05, inp: 135, fcp: 1650, ttfb: 820, si: 3300, tbt: 190 },
  { day: 42, lcp: 2550, cls: 0.04, inp: 128, fcp: 1580, ttfb: 780, si: 3100, tbt: 175 },
  { day: 35, lcp: 2800, cls: 0.06, inp: 140, fcp: 1700, ttfb: 850, si: 3400, tbt: 200 },
  { day: 28, lcp: 2650, cls: 0.05, inp: 132, fcp: 1620, ttfb: 810, si: 3250, tbt: 185 },
  { day: 21, lcp: 2750, cls: 0.05, inp: 138, fcp: 1680, ttfb: 840, si: 3350, tbt: 195 },
  { day: 14, lcp: 2500, cls: 0.03, inp: 125, fcp: 1550, ttfb: 760, si: 3050, tbt: 170 },
  { day: 7,  lcp: 2450, cls: 0.03, inp: 122, fcp: 1520, ttfb: 740, si: 2980, tbt: 165 },
];
for (const m of careersData) {
  insertMeasurement.run(s6, m.lcp, m.cls, m.inp, m.fcp, m.ttfb, m.si, m.tbt, 'mobile', daysAgo(m.day), null);
  insertMeasurement.run(s6, m.lcp * 0.7, m.cls * 0.8, m.inp * 0.6, m.fcp * 0.7, m.ttfb * 0.9, m.si * 0.7, m.tbt * 0.6, 'desktop', daysAgo(m.day), null);
}

// ── Budgets ────────────────────────────────────────────────────
const insertBudget = db.prepare(`INSERT INTO budgets (site_id, metric, threshold_good, threshold_poor, current_value, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`);

const today = daysAgo(0);

// Google's Core Web Vitals thresholds: LCP good <2500ms poor >4000ms, CLS good <0.1 poor >0.25, INP good <200ms poor >500ms
for (const [siteId, lcp, cls, inp] of [
  [s1, 2800, 0.07, 195],
  [s2, 1370, 0.01, 84],
  [s3, 1790, 0.03, 370],
  [s4, 1840, 0.13, 138],
  [s5, 885, 0.01, 56],
  [s6, 2450, 0.03, 122],
] as [number | bigint, number, number, number][]) {
  insertBudget.run(siteId, 'LCP', 2500, 4000, lcp, lcp <= 2500 ? 'passing' : lcp <= 4000 ? 'warning' : 'failing', today);
  insertBudget.run(siteId, 'CLS', 0.1, 0.25, cls, cls <= 0.1 ? 'passing' : cls <= 0.25 ? 'warning' : 'failing', today);
  insertBudget.run(siteId, 'INP', 200, 500, inp, inp <= 200 ? 'passing' : inp <= 500 ? 'warning' : 'failing', today);
}

// ── Recommendations ────────────────────────────────────────────────────
const insertRec = db.prepare(`INSERT INTO recommendations (site_id, category, title, description, impact, effort, status, estimated_savings_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

// Acme Store
insertRec.run(s1, 'Images', 'Compress hero image to WebP', 'The hero image on the homepage is 4.2MB PNG. Converting to WebP and resizing to 1920px wide would save ~3.5MB and improve LCP by an estimated 800ms.', 'high', 'low', 'in_progress', 800);
insertRec.run(s1, 'Images', 'Lazy-load below-fold product images', 'Product grid images are all loaded eagerly. Adding loading="lazy" to images below the fold would reduce initial page weight by ~2MB.', 'medium', 'low', 'completed', 400);
insertRec.run(s1, 'JavaScript', 'Defer third-party analytics scripts', 'Google Analytics, Hotjar, and Segment are all render-blocking. Moving to async loading would reduce TBT by ~120ms.', 'medium', 'low', 'open', 120);
insertRec.run(s1, 'CSS', 'Inline critical CSS above the fold', 'The main stylesheet is 180KB and render-blocking. Inlining critical CSS would improve FCP by ~200ms.', 'medium', 'medium', 'open', 200);
insertRec.run(s1, 'Fonts', 'Preload primary web font', 'The heading font causes a 300ms FOIT. Adding a preload link would eliminate the flash of invisible text.', 'low', 'low', 'open', 150);

// Acme Dashboard
insertRec.run(s3, 'JavaScript', 'Code-split dashboard routes', 'The main JS bundle is 1.8MB. Route-based code splitting would reduce initial load by ~60% and improve INP.', 'high', 'high', 'open', 500);
insertRec.run(s3, 'JavaScript', 'Replace Moment.js with date-fns', 'Moment.js adds 280KB to the bundle. date-fns tree-shakes to ~15KB for the functions used.', 'medium', 'medium', 'open', 150);
insertRec.run(s3, 'JavaScript', 'Virtualize large data tables', 'The transactions table renders 500+ rows on mount. Virtualizing would reduce INP from 370ms to under 100ms.', 'high', 'medium', 'open', 270);
insertRec.run(s3, 'API', 'Add pagination to dashboard API', 'The /api/transactions endpoint returns all records. Paginating to 50 per request would reduce payload from 2MB to 100KB.', 'high', 'medium', 'open', 300);

// Acme Marketing
insertRec.run(s4, 'Layout', 'Reserve space for ad slots', 'Ad containers have no explicit dimensions, causing layout shifts when ads load. Adding min-height would fix CLS.', 'high', 'low', 'open', null);
insertRec.run(s4, 'Layout', 'Set width/height on hero video', 'The hero video element has no intrinsic dimensions, causing a 0.08 CLS shift when the video loads.', 'medium', 'low', 'open', null);
insertRec.run(s4, 'Images', 'Serve responsive images with srcset', 'Mobile users download the 2400px desktop hero. Adding srcset would serve a 750px image on mobile, saving 1.2MB.', 'high', 'low', 'open', 350);

// Acme Careers
insertRec.run(s6, 'Server', 'Add edge caching for job listings', 'Job listing pages have 800ms TTFB due to database queries on every request. Edge caching with 5-min TTL would drop TTFB to ~100ms.', 'high', 'medium', 'open', 700);
insertRec.run(s6, 'Server', 'Optimize database queries for search', 'The job search endpoint runs unindexed LIKE queries. Adding a full-text search index would reduce server response from 400ms to 50ms.', 'high', 'medium', 'open', 350);
insertRec.run(s6, 'Fonts', 'Self-host Google Fonts', 'Google Fonts adds an extra DNS lookup and 200ms delay. Self-hosting would eliminate the external dependency.', 'low', 'low', 'open', 200);

// ── Alerts ────────────────────────────────────────────────────
const insertAlert = db.prepare(`INSERT INTO alerts (site_id, metric, value, threshold, severity, message, acknowledged, triggered_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

insertAlert.run(s1, 'LCP', 3400, 2500, 'critical', 'Acme Store LCP exceeded 2500ms threshold (3400ms on mobile). Hero image regression detected.', 1, daysAgo(21));
insertAlert.run(s1, 'CLS', 0.12, 0.1, 'warning', 'Acme Store CLS exceeded 0.1 threshold (0.12). Product image lazy-loading causing layout shift.', 1, daysAgo(28));
insertAlert.run(s1, 'LCP', 2800, 2500, 'warning', 'Acme Store LCP still above 2500ms threshold (2800ms). Hero image partially optimized.', 0, daysAgo(7));
insertAlert.run(s3, 'INP', 450, 200, 'critical', 'Acme Dashboard INP exceeded 200ms threshold (450ms). Heavy JS bundle causing interaction delays.', 0, daysAgo(35));
insertAlert.run(s3, 'INP', 370, 200, 'warning', 'Acme Dashboard INP still above 200ms threshold (370ms). Improvement trend but still failing.', 0, daysAgo(7));
insertAlert.run(s4, 'CLS', 0.25, 0.1, 'critical', 'Acme Marketing CLS exceeded 0.25 threshold. Ad slots and hero video causing severe layout instability.', 0, daysAgo(35));
insertAlert.run(s4, 'CLS', 0.13, 0.1, 'warning', 'Acme Marketing CLS still above 0.1 threshold (0.13). Improving but ad slots still shifting.', 0, daysAgo(7));
insertAlert.run(s6, 'LCP', 2800, 2500, 'warning', 'Acme Careers LCP exceeded 2500ms threshold (2800ms). Slow TTFB from server-side rendering.', 0, daysAgo(35));

// ── Resources ────────────────────────────────────────────────────
const insertResource = db.prepare(`INSERT INTO resources (site_id, resource_type, url, size_kb, load_time_ms, blocking, page_path, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

// Acme Store resources
insertResource.run(s1, 'image', '/images/hero-banner.png', 4200, 1800, 0, '/', today);
insertResource.run(s1, 'image', '/images/product-grid-1.jpg', 380, 250, 0, '/', today);
insertResource.run(s1, 'image', '/images/product-grid-2.jpg', 420, 280, 0, '/', today);
insertResource.run(s1, 'image', '/images/product-grid-3.jpg', 350, 230, 0, '/', today);
insertResource.run(s1, 'script', '/js/analytics-bundle.js', 95, 180, 1, '/', today);
insertResource.run(s1, 'script', '/js/hotjar.js', 45, 120, 1, '/', today);
insertResource.run(s1, 'script', '/js/segment.js', 68, 150, 1, '/', today);
insertResource.run(s1, 'stylesheet', '/css/main.css', 180, 80, 1, '/', today);
insertResource.run(s1, 'font', '/fonts/heading.woff2', 42, 300, 0, '/', today);
insertResource.run(s1, 'script', '/js/app.js', 320, 200, 0, '/', today);

// Acme Dashboard resources
insertResource.run(s3, 'script', '/js/vendor.js', 890, 400, 0, '/', today);
insertResource.run(s3, 'script', '/js/app.js', 920, 380, 0, '/', today);
insertResource.run(s3, 'script', '/js/moment.min.js', 280, 120, 0, '/', today);
insertResource.run(s3, 'script', '/js/chart-lib.js', 350, 150, 0, '/', today);
insertResource.run(s3, 'stylesheet', '/css/dashboard.css', 120, 60, 1, '/', today);
insertResource.run(s3, 'font', '/fonts/inter.woff2', 38, 80, 0, '/', today);

// Acme Marketing resources
insertResource.run(s4, 'video', '/media/hero-video.mp4', 8500, 3200, 0, '/', today);
insertResource.run(s4, 'image', '/images/hero-poster.jpg', 650, 400, 0, '/', today);
insertResource.run(s4, 'script', '/js/ad-loader.js', 120, 200, 1, '/', today);
insertResource.run(s4, 'script', '/js/app.js', 250, 150, 0, '/', today);
insertResource.run(s4, 'stylesheet', '/css/main.css', 95, 50, 1, '/', today);

// Acme Careers resources
insertResource.run(s6, 'script', '/js/app.js', 280, 180, 0, '/', today);
insertResource.run(s6, 'stylesheet', '/css/careers.css', 65, 40, 1, '/', today);
insertResource.run(s6, 'font', 'https://fonts.googleapis.com/css2?family=Inter', 32, 200, 1, '/', today);
insertResource.run(s6, 'image', '/images/team-photo.jpg', 520, 350, 0, '/', today);

// Count and log
const siteCount = (db.prepare('SELECT COUNT(*) as c FROM sites').get() as any).c;
const measurementCount = (db.prepare('SELECT COUNT(*) as c FROM measurements').get() as any).c;
const budgetCount = (db.prepare('SELECT COUNT(*) as c FROM budgets').get() as any).c;
const recCount = (db.prepare('SELECT COUNT(*) as c FROM recommendations').get() as any).c;
const alertCount = (db.prepare('SELECT COUNT(*) as c FROM alerts').get() as any).c;
const resourceCount = (db.prepare('SELECT COUNT(*) as c FROM resources').get() as any).c;

console.log(`Seeded: ${siteCount} sites, ${measurementCount} measurements, ${budgetCount} budgets, ${recCount} recommendations, ${alertCount} alerts, ${resourceCount} resources`);
