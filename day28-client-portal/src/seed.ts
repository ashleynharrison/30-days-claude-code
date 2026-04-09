import db from './database.js';

// Clear existing data
db.exec('DELETE FROM activity_log');
db.exec('DELETE FROM messages');
db.exec('DELETE FROM invoices');
db.exec('DELETE FROM deliverables');
db.exec('DELETE FROM projects');
db.exec('DELETE FROM clients');

// --- Clients ---
const insertClient = db.prepare(`
  INSERT INTO clients (name, company, email, phone, industry, status, onboarded_at) VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const clients = [
  ['Sarah Mitchell', 'Greenleaf Wellness', 'sarah@greenleafwellness.com', '(415) 555-0142', 'Healthcare / Wellness', 'active', '2025-09-15'],
  ['David Park', 'Apex Ventures', 'david@apexventures.io', '(212) 555-0198', 'Finance / VC', 'active', '2025-11-02'],
  ['Maria Santos', 'Buena Mesa', 'maria@buenamesa.com', '(305) 555-0167', 'Restaurant / Hospitality', 'active', '2026-01-10'],
  ['James Whitfield', 'Whitfield & Associates', 'james@whitfieldlaw.com', '(312) 555-0134', 'Legal', 'active', '2025-08-20'],
  ['Nina Okafor', 'Radiant Studios', 'nina@radiantstudios.co', '(310) 555-0189', 'Creative / Media', 'active', '2026-02-01'],
  ['Tom Brennan', 'Ironclad Construction', 'tom@ironcladbuilds.com', '(617) 555-0156', 'Construction', 'paused', '2025-10-05'],
  ['Aisha Rahman', 'EduPath Online', 'aisha@edupathonline.com', '(512) 555-0178', 'Education / EdTech', 'active', '2026-01-20'],
  ['Kevin Liu', 'Stackline SaaS', 'kevin@stackline.dev', '(415) 555-0123', 'Technology / SaaS', 'completed', '2025-06-12'],
];

for (const c of clients) {
  insertClient.run(...c);
}

// --- Projects ---
const insertProject = db.prepare(`
  INSERT INTO projects (client_id, name, description, status, start_date, target_date, completed_date, budget, spent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const projects = [
  [1, 'Brand Refresh & Website', 'Complete brand overhaul including logo, color system, and Next.js website with booking integration.', 'in_progress', '2025-10-01', '2026-04-30', null, 28000, 19200],
  [1, 'Patient Portal MVP', 'Secure patient portal for appointment scheduling, records access, and telehealth links.', 'planning', '2026-05-01', '2026-08-15', null, 45000, 0],
  [2, 'Investor Dashboard', 'Real-time portfolio dashboard with fund performance, deal flow tracking, and LP reporting.', 'in_progress', '2025-12-01', '2026-05-15', null, 62000, 41500],
  [3, 'Online Ordering System', 'Custom ordering platform with menu management, delivery zones, and kitchen display integration.', 'in_progress', '2026-01-15', '2026-04-15', null, 18500, 14200],
  [3, 'Loyalty Program App', 'Points-based loyalty system with mobile app, rewards catalog, and push notifications.', 'planning', '2026-05-01', '2026-07-30', null, 22000, 0],
  [4, 'Case Management System', 'Internal case tracking with document management, deadline alerts, and billing integration.', 'in_progress', '2025-09-01', '2026-03-31', null, 55000, 48700],
  [4, 'Client Intake Portal', 'Public-facing intake system with conflict checks, engagement letters, and secure document upload.', 'in_progress', '2026-02-01', '2026-06-30', null, 32000, 12800],
  [5, 'Portfolio Website', 'Showcase site with project galleries, video embeds, team bios, and contact forms.', 'in_progress', '2026-02-15', '2026-04-15', null, 12000, 8400],
  [6, 'Project Tracker Dashboard', 'Construction project oversight tool with Gantt charts, budget tracking, and subcontractor management.', 'paused', '2025-11-01', '2026-04-01', null, 38000, 22100],
  [7, 'Course Platform', 'LMS with video hosting, quizzes, progress tracking, certificates, and instructor dashboard.', 'in_progress', '2026-02-01', '2026-06-15', null, 35000, 15400],
  [8, 'API Gateway & Docs', 'API gateway with rate limiting, usage analytics, and auto-generated documentation portal.', 'completed', '2025-07-01', '2025-12-15', '2025-12-10', 42000, 39800],
  [8, 'MCP Integration Layer', 'Model Context Protocol server connecting Stackline data to Claude Desktop for natural language queries.', 'completed', '2026-01-05', '2026-02-28', '2026-02-25', 15000, 14200],
];

for (const p of projects) {
  insertProject.run(...p);
}

// --- Deliverables ---
const insertDeliverable = db.prepare(`
  INSERT INTO deliverables (project_id, title, description, status, due_date, completed_date, approval_status, approved_by, approved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const deliverables = [
  // Project 1 — Brand Refresh & Website (Greenleaf)
  [1, 'Brand Discovery & Moodboard', 'Competitive analysis, brand audit, and visual direction moodboard.', 'completed', '2025-10-20', '2025-10-18', 'approved', 'Sarah Mitchell', '2025-10-19'],
  [1, 'Logo & Color System', 'Primary/secondary logos, color palette, typography selections.', 'completed', '2025-11-15', '2025-11-12', 'approved', 'Sarah Mitchell', '2025-11-14'],
  [1, 'Wireframes & Content Architecture', 'Page-level wireframes for all 8 pages with content hierarchy.', 'completed', '2025-12-10', '2025-12-08', 'approved', 'Sarah Mitchell', '2025-12-10'],
  [1, 'Homepage & Core Pages', 'Responsive design and development of homepage, about, services, and contact pages.', 'in_progress', '2026-03-15', null, 'pending', null, null],
  [1, 'Booking Integration', 'Calendar booking system integration with email confirmations.', 'pending', '2026-04-15', null, 'pending', null, null],
  [1, 'QA & Launch', 'Cross-browser testing, performance optimization, DNS migration, and go-live.', 'pending', '2026-04-30', null, 'pending', null, null],

  // Project 3 — Investor Dashboard (Apex)
  [3, 'Data Architecture & API Design', 'Database schema, API endpoints, and authentication flow.', 'completed', '2026-01-10', '2026-01-08', 'approved', 'David Park', '2026-01-10'],
  [3, 'Portfolio Overview Dashboard', 'Main dashboard with fund performance charts, AUM tracking, and vintage year analysis.', 'completed', '2026-02-15', '2026-02-14', 'approved', 'David Park', '2026-02-16'],
  [3, 'Deal Flow Module', 'Pipeline tracking for prospective investments with stage gates and evaluation scoring.', 'in_progress', '2026-04-01', null, 'pending', null, null],
  [3, 'LP Reporting Module', 'Quarterly reports, capital call tracking, and distribution waterfall calculations.', 'pending', '2026-05-01', null, 'pending', null, null],
  [3, 'Security Audit & Deployment', 'Penetration testing, SOC 2 compliance checks, and production deployment.', 'pending', '2026-05-15', null, 'pending', null, null],

  // Project 4 — Online Ordering (Buena Mesa)
  [4, 'Menu Management Backend', 'Admin dashboard for menu items, categories, modifiers, and pricing.', 'completed', '2026-02-01', '2026-01-30', 'approved', 'Maria Santos', '2026-02-01'],
  [4, 'Customer Ordering Flow', 'Public-facing ordering UI with cart, customization, and checkout.', 'completed', '2026-03-01', '2026-02-28', 'approved', 'Maria Santos', '2026-03-02'],
  [4, 'Payment & Delivery Integration', 'Stripe payments, delivery zone configuration, and order notifications.', 'in_progress', '2026-04-01', null, 'pending', null, null],
  [4, 'Kitchen Display System', 'Real-time order display for kitchen staff with status management.', 'pending', '2026-04-15', null, 'pending', null, null],

  // Project 6 — Case Management (Whitfield)
  [6, 'Case Database & Search', 'Full case record system with matter types, status tracking, and full-text search.', 'completed', '2025-10-15', '2025-10-14', 'approved', 'James Whitfield', '2025-10-15'],
  [6, 'Document Management', 'File upload, version control, OCR indexing, and secure sharing.', 'completed', '2025-12-01', '2025-11-28', 'approved', 'James Whitfield', '2025-12-01'],
  [6, 'Deadline & Calendar System', 'Court date tracking, statute of limitations alerts, and calendar sync.', 'completed', '2026-01-15', '2026-01-12', 'approved', 'James Whitfield', '2026-01-14'],
  [6, 'Billing Integration', 'Time tracking, invoice generation, trust account management, and LEDES export.', 'in_progress', '2026-03-15', null, 'in_review', 'James Whitfield', null],
  [6, 'Training & Rollout', 'Staff training sessions, data migration, and phased rollout plan.', 'pending', '2026-03-31', null, 'pending', null, null],

  // Project 8 — Portfolio Website (Radiant)
  [8, 'Design Mockups', 'Full-page designs for homepage, portfolio grid, project detail, and contact page.', 'completed', '2026-03-01', '2026-02-27', 'approved', 'Nina Okafor', '2026-02-28'],
  [8, 'Frontend Development', 'Next.js build with animations, video embeds, and responsive layout.', 'in_progress', '2026-03-30', null, 'pending', null, null],
  [8, 'CMS Integration', 'Headless CMS setup for project management and team bios.', 'pending', '2026-04-10', null, 'pending', null, null],
  [8, 'Launch & SEO', 'Performance optimization, meta tags, sitemap, and DNS cutover.', 'pending', '2026-04-15', null, 'pending', null, null],

  // Project 10 — Course Platform (EduPath)
  [10, 'Platform Architecture', 'Tech stack selection, database design, and infrastructure setup.', 'completed', '2026-02-20', '2026-02-18', 'approved', 'Aisha Rahman', '2026-02-19'],
  [10, 'Video Hosting & Player', 'Custom video player with adaptive streaming, playback speed, and bookmarks.', 'completed', '2026-03-15', '2026-03-14', 'approved', 'Aisha Rahman', '2026-03-15'],
  [10, 'Course Builder & Quizzes', 'Instructor dashboard for course creation, lesson ordering, and quiz authoring.', 'in_progress', '2026-04-15', null, 'pending', null, null],
  [10, 'Student Dashboard & Certificates', 'Progress tracking, grade book, and auto-generated completion certificates.', 'pending', '2026-05-15', null, 'pending', null, null],
  [10, 'Payment & Enrollment', 'Stripe integration for course purchases, subscription tiers, and refund handling.', 'pending', '2026-06-01', null, 'pending', null, null],
  [10, 'Launch & Marketing Site', 'Public-facing marketing site with course previews, testimonials, and SEO.', 'pending', '2026-06-15', null, 'pending', null, null],
];

for (const d of deliverables) {
  insertDeliverable.run(...d);
}

// --- Invoices ---
const insertInvoice = db.prepare(`
  INSERT INTO invoices (client_id, project_id, invoice_number, amount, status, issued_date, due_date, paid_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const invoices = [
  // Greenleaf
  [1, 1, 'INV-2025-001', 8400, 'paid', '2025-10-01', '2025-10-31', '2025-10-22', 'Brand Refresh — Discovery & Moodboard (30% deposit)'],
  [1, 1, 'INV-2025-002', 5600, 'paid', '2025-11-15', '2025-12-15', '2025-12-01', 'Brand Refresh — Logo & Color System'],
  [1, 1, 'INV-2026-001', 5200, 'paid', '2026-01-01', '2026-01-31', '2026-01-20', 'Brand Refresh — Wireframes & Content Architecture'],
  [1, 1, 'INV-2026-005', 4800, 'sent', '2026-03-15', '2026-04-15', null, 'Brand Refresh — Homepage & Core Pages (progress billing)'],

  // Apex Ventures
  [2, 3, 'INV-2025-003', 18600, 'paid', '2025-12-01', '2025-12-31', '2025-12-18', 'Investor Dashboard — Phase 1 (30% deposit)'],
  [2, 3, 'INV-2026-002', 12400, 'paid', '2026-02-15', '2026-03-15', '2026-03-02', 'Investor Dashboard — Portfolio Overview milestone'],
  [2, 3, 'INV-2026-006', 10500, 'sent', '2026-04-01', '2026-05-01', null, 'Investor Dashboard — Deal Flow Module (progress billing)'],

  // Buena Mesa
  [3, 4, 'INV-2026-003', 5550, 'paid', '2026-01-15', '2026-02-15', '2026-02-08', 'Online Ordering — Phase 1 deposit'],
  [3, 4, 'INV-2026-007', 4650, 'paid', '2026-03-01', '2026-03-31', '2026-03-20', 'Online Ordering — Menu & Ordering Flow'],
  [3, 4, 'INV-2026-010', 4000, 'sent', '2026-04-01', '2026-05-01', null, 'Online Ordering — Payment & Delivery Integration'],

  // Whitfield
  [4, 6, 'INV-2025-004', 16500, 'paid', '2025-09-01', '2025-09-30', '2025-09-15', 'Case Management — Phase 1 deposit'],
  [4, 6, 'INV-2025-005', 16500, 'paid', '2025-12-01', '2025-12-31', '2025-12-20', 'Case Management — Document Management milestone'],
  [4, 6, 'INV-2026-004', 15700, 'paid', '2026-01-15', '2026-02-15', '2026-02-10', 'Case Management — Calendar & Deadlines milestone'],
  [4, 7, 'INV-2026-008', 12800, 'sent', '2026-03-01', '2026-03-31', null, 'Client Intake Portal — Phase 1 deposit'],

  // Radiant Studios
  [5, 8, 'INV-2026-009', 4800, 'paid', '2026-02-15', '2026-03-15', '2026-03-05', 'Portfolio Website — Design Mockups'],
  [5, 8, 'INV-2026-011', 3600, 'sent', '2026-04-01', '2026-05-01', null, 'Portfolio Website — Frontend Development (progress billing)'],

  // Ironclad (paused)
  [6, 9, 'INV-2025-006', 11400, 'paid', '2025-11-01', '2025-11-30', '2025-11-22', 'Project Tracker — Phase 1 deposit'],
  [6, 9, 'INV-2026-012', 10700, 'paid', '2026-01-15', '2026-02-15', '2026-02-12', 'Project Tracker — Phase 2 milestone'],

  // EduPath
  [7, 10, 'INV-2026-013', 10500, 'paid', '2026-02-01', '2026-02-28', '2026-02-20', 'Course Platform — Phase 1 deposit'],
  [7, 10, 'INV-2026-014', 4900, 'sent', '2026-03-15', '2026-04-15', null, 'Course Platform — Video Hosting milestone'],

  // Stackline (completed)
  [8, 11, 'INV-2025-007', 21000, 'paid', '2025-07-01', '2025-07-31', '2025-07-18', 'API Gateway — Phase 1 deposit'],
  [8, 11, 'INV-2025-008', 18800, 'paid', '2025-12-10', '2026-01-10', '2025-12-22', 'API Gateway — Final delivery'],
  [8, 12, 'INV-2026-015', 14200, 'paid', '2026-02-25', '2026-03-25', '2026-03-10', 'MCP Integration — Full project'],
];

for (const inv of invoices) {
  insertInvoice.run(...inv);
}

// --- Messages ---
const insertMessage = db.prepare(`
  INSERT INTO messages (client_id, project_id, sender, content, read, created_at) VALUES (?, ?, ?, ?, ?, ?)
`);

const messages = [
  [1, 1, 'Sarah Mitchell', 'The homepage mockup looks great! Can we make the hero image larger and add a booking CTA above the fold?', 1, '2026-03-20 09:15'],
  [1, 1, 'Tell a Vsn', 'Absolutely — I\'ll update the hero section with a full-bleed image and move the booking button into the first viewport. Will have a revision ready by Thursday.', 1, '2026-03-20 10:30'],
  [1, 1, 'Sarah Mitchell', 'Perfect. Also, can we add a testimonials section? I have 5 patient reviews I\'d love to feature.', 1, '2026-03-21 11:00'],
  [2, 3, 'David Park', 'The LP reporting module is our top priority for Q2. Our LPs are asking for quarterly distribution waterfalls — can we accelerate that?', 1, '2026-03-28 14:20'],
  [2, 3, 'Tell a Vsn', 'I can move LP reporting up in the schedule. It would mean pushing the security audit to mid-May. Want me to put together a revised timeline?', 1, '2026-03-28 15:45'],
  [2, 3, 'David Park', 'Yes, let\'s do that. Security audit can slip as long as we hit the April LP meeting deadline.', 0, '2026-03-29 09:00'],
  [3, 4, 'Maria Santos', 'Kitchen staff is excited about the display system! Quick question — can we show estimated prep time on each order?', 1, '2026-03-25 16:30'],
  [3, 4, 'Tell a Vsn', 'Great feedback from the team! Yes, we can add prep time estimates based on item complexity. I\'ll include it in the KDS build.', 1, '2026-03-25 17:15'],
  [4, 7, 'James Whitfield', 'We need the intake portal to support multi-party conflict checks. Our current process misses related entities.', 0, '2026-04-02 10:00'],
  [4, 6, 'Tell a Vsn', 'Billing integration is ready for your review. I\'ve sent over the demo credentials. The LEDES export covers all the formats your accounting team requested.', 1, '2026-03-30 11:00'],
  [5, 8, 'Nina Okafor', 'Love the animations on the portfolio grid! Can we add a video reel that auto-plays on the homepage hero?', 0, '2026-04-01 13:45'],
  [7, 10, 'Aisha Rahman', 'The quiz builder is exactly what we needed. Can we add a question bank feature so instructors can reuse questions across courses?', 0, '2026-04-03 09:30'],
  [7, 10, 'Tell a Vsn', 'Question bank is a great idea — I\'ll scope it as an add-on to the current sprint. Should be straightforward since we already have the quiz data model.', 0, '2026-04-03 11:00'],
];

for (const m of messages) {
  insertMessage.run(...m);
}

// --- Activity Log ---
const insertActivity = db.prepare(`
  INSERT INTO activity_log (client_id, project_id, action, details, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)
`);

const activities = [
  [1, 1, 'deliverable_completed', 'Wireframes & Content Architecture approved by client.', 'Tell a Vsn', '2025-12-10 14:00'],
  [1, 1, 'invoice_paid', 'Invoice INV-2026-001 ($5,200) paid.', 'Sarah Mitchell', '2026-01-20 10:30'],
  [1, 1, 'deliverable_started', 'Homepage & Core Pages development started.', 'Tell a Vsn', '2026-01-15 09:00'],
  [1, 1, 'message_sent', 'Client requested hero image changes and booking CTA.', 'Sarah Mitchell', '2026-03-20 09:15'],
  [1, 1, 'invoice_sent', 'Invoice INV-2026-005 ($4,800) sent for progress billing.', 'Tell a Vsn', '2026-03-15 10:00'],
  [2, 3, 'deliverable_completed', 'Portfolio Overview Dashboard approved by client.', 'Tell a Vsn', '2026-02-16 11:00'],
  [2, 3, 'invoice_paid', 'Invoice INV-2026-002 ($12,400) paid.', 'David Park', '2026-03-02 09:45'],
  [2, 3, 'deliverable_started', 'Deal Flow Module development started.', 'Tell a Vsn', '2026-03-01 09:00'],
  [2, 3, 'schedule_change', 'LP Reporting moved up in priority per client request. Security audit shifted to mid-May.', 'Tell a Vsn', '2026-03-29 10:00'],
  [3, 4, 'deliverable_completed', 'Customer Ordering Flow approved by client.', 'Tell a Vsn', '2026-03-02 14:00'],
  [3, 4, 'invoice_paid', 'Invoice INV-2026-007 ($4,650) paid.', 'Maria Santos', '2026-03-20 11:00'],
  [3, 4, 'deliverable_started', 'Payment & Delivery Integration started.', 'Tell a Vsn', '2026-03-05 09:00'],
  [4, 6, 'deliverable_review', 'Billing Integration submitted for client review.', 'Tell a Vsn', '2026-03-15 15:00'],
  [4, 7, 'project_started', 'Client Intake Portal project kicked off.', 'Tell a Vsn', '2026-02-01 10:00'],
  [4, 7, 'invoice_sent', 'Invoice INV-2026-008 ($12,800) sent for Phase 1 deposit.', 'Tell a Vsn', '2026-03-01 09:00'],
  [5, 8, 'deliverable_completed', 'Design Mockups approved by client.', 'Tell a Vsn', '2026-02-28 16:00'],
  [5, 8, 'deliverable_started', 'Frontend Development started.', 'Tell a Vsn', '2026-03-01 09:00'],
  [5, 8, 'invoice_paid', 'Invoice INV-2026-009 ($4,800) paid.', 'Nina Okafor', '2026-03-05 10:30'],
  [6, 9, 'project_paused', 'Project paused — client requested hold pending permit approvals.', 'Tom Brennan', '2026-02-15 14:00'],
  [7, 10, 'deliverable_completed', 'Video Hosting & Player approved by client.', 'Tell a Vsn', '2026-03-15 11:00'],
  [7, 10, 'deliverable_started', 'Course Builder & Quizzes development started.', 'Tell a Vsn', '2026-03-16 09:00'],
  [8, 11, 'project_completed', 'API Gateway & Docs delivered and deployed.', 'Tell a Vsn', '2025-12-10 16:00'],
  [8, 12, 'project_completed', 'MCP Integration Layer delivered and deployed.', 'Tell a Vsn', '2026-02-25 14:00'],
  [8, 12, 'invoice_paid', 'Invoice INV-2026-015 ($14,200) paid. All Stackline work complete.', 'Kevin Liu', '2026-03-10 09:00'],
];

for (const a of activities) {
  insertActivity.run(...a);
}

console.log('Seeded client portal database:');
console.log(`  ${clients.length} clients`);
console.log(`  ${projects.length} projects`);
console.log(`  ${deliverables.length} deliverables`);
console.log(`  ${invoices.length} invoices`);
console.log(`  ${messages.length} messages`);
console.log(`  ${activities.length} activity log entries`);
