import db from './database.js';

// Clear existing data
db.exec(`
  DELETE FROM line_items;
  DELETE FROM proposal_sections;
  DELETE FROM proposals;
  DELETE FROM templates;
  DELETE FROM services;
  DELETE FROM clients;
`);

const now = new Date();
function daysAgo(n: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString().replace('T', ' ').split('.')[0];
}

// ── Clients ────────────────────────────────────────────────────
const insertClient = db.prepare(`INSERT INTO clients (name, company, email, industry, budget_range, notes) VALUES (?, ?, ?, ?, ?, ?)`);

const c1 = insertClient.run('Maria Gonzalez', 'Verdant Wellness', 'maria@verdantwellness.com', 'Health & Wellness', '$15K–$30K', 'Referred by Jake Torres. Looking for a patient portal and booking system. Has an existing WordPress site that needs replacing.').lastInsertRowid;
const c2 = insertClient.run('James Whitfield', 'Whitfield & Associates', 'james@whitfieldlaw.com', 'Legal', '$25K–$50K', 'Managing partner. Wants to modernize their case management and client intake. Currently using paper forms and spreadsheets.').lastInsertRowid;
const c3 = insertClient.run('Priya Mehta', 'NovaByte', 'priya@novabyte.io', 'SaaS / Technology', '$40K–$80K', 'Series A startup. Needs a multi-tenant dashboard for their analytics product. Tight timeline — wants MVP in 6 weeks.').lastInsertRowid;
const c4 = insertClient.run('Derek Chang', 'Summit Construction Group', 'derek@summitcg.com', 'Construction', '$10K–$20K', 'Operations manager. Needs a project tracker with subcontractor management. Mobile-first requirement.').lastInsertRowid;
const c5 = insertClient.run('Aisha Rahman', 'Bright Futures Foundation', 'aisha@brightfutures.org', 'Nonprofit', '$8K–$15K', 'Executive director. Needs donor management and grant tracking. Small team, limited technical resources.').lastInsertRowid;
const c6 = insertClient.run('Tom Nakamura', 'Coastal Realty Partners', 'tom@coastalrealty.com', 'Real Estate', '$20K–$40K', 'Brokerage owner. Wants a listings platform with MCP-powered search. 12 agents on the team.').lastInsertRowid;

// ── Services ────────────────────────────────────────────────────
const insertService = db.prepare(`INSERT INTO services (name, category, description, hourly_rate, min_hours, typical_hours, deliverables) VALUES (?, ?, ?, ?, ?, ?, ?)`);

const s1 = insertService.run('MCP Server Development', 'AI Engineering', 'Custom MCP server that connects your business data to Claude. Query your database, CRM, or internal tools through natural language.', 175, 16, 40, 'MCP server, database schema, seed data, Claude Desktop config, documentation').lastInsertRowid;
const s2 = insertService.run('Web Application Development', 'Custom Development', 'Full-stack web application built with Next.js, React, and Tailwind. Includes authentication, database, and deployment.', 165, 40, 80, 'Next.js application, Supabase backend, auth system, Vercel deployment, documentation').lastInsertRowid;
const s3 = insertService.run('AI Workflow Automation', 'AI Engineering', 'Automated workflows powered by Claude — document processing, email triage, data extraction, or custom AI pipelines.', 185, 20, 50, 'AI pipeline, integration code, monitoring dashboard, runbook').lastInsertRowid;
const s4 = insertService.run('UI/UX Design & Implementation', 'Design', 'End-to-end design and implementation — wireframes, component library, responsive layouts, dark mode, accessibility.', 155, 20, 40, 'Figma designs, component library, responsive implementation, accessibility audit').lastInsertRowid;
const s5 = insertService.run('Performance Audit & Optimization', 'Performance', 'Lighthouse audit, Core Web Vitals optimization, bundle analysis, image optimization, caching strategy.', 160, 8, 20, 'Audit report, optimization implementation, before/after metrics, monitoring setup').lastInsertRowid;
const s6 = insertService.run('Security Audit & Hardening', 'Security', 'Auth review, RLS policy audit, dependency scanning, OWASP compliance check, penetration testing.', 185, 12, 30, 'Security report, remediation implementation, compliance checklist, ongoing monitoring').lastInsertRowid;
const s7 = insertService.run('Data Migration & Integration', 'Custom Development', 'Migrate from legacy systems, spreadsheets, or other platforms. ETL pipelines, data cleaning, validation.', 155, 16, 35, 'Migration scripts, data validation report, rollback plan, documentation').lastInsertRowid;
const s8 = insertService.run('Strategy & Technical Consulting', 'Strategy', 'Technical architecture review, vendor evaluation, build-vs-buy analysis, roadmap planning, team augmentation strategy.', 200, 4, 16, 'Strategy document, architecture diagram, recommendation deck, implementation roadmap').lastInsertRowid;

// ── Templates ────────────────────────────────────────────────────
const insertTemplate = db.prepare(`INSERT INTO templates (name, type, description, sections, tone) VALUES (?, ?, ?, ?, ?)`);

const t1 = insertTemplate.run(
  'Standard SOW',
  'sow',
  'Full statement of work with scope, timeline, deliverables, and pricing. Best for projects over $15K.',
  JSON.stringify(['Executive Summary', 'Understanding Your Needs', 'Proposed Solution', 'Scope of Work', 'Timeline & Milestones', 'Deliverables', 'Investment', 'Terms & Conditions', 'Next Steps']),
  'professional'
).lastInsertRowid;

const t2 = insertTemplate.run(
  'Quick Proposal',
  'proposal',
  'Streamlined proposal for smaller engagements. Gets to the point fast. Best for projects under $15K.',
  JSON.stringify(['Overview', 'What We\'ll Build', 'Timeline', 'Investment', 'Let\'s Go']),
  'conversational'
).lastInsertRowid;

const t3 = insertTemplate.run(
  'Discovery & Strategy',
  'discovery',
  'Proposal for a paid discovery phase before a larger engagement. Reduces risk for both sides.',
  JSON.stringify(['Why Discovery First', 'What We\'ll Explore', 'Process', 'Deliverables', 'Investment', 'What Happens Next']),
  'consultative'
).lastInsertRowid;

const t4 = insertTemplate.run(
  'Retainer Agreement',
  'retainer',
  'Ongoing monthly engagement. Best for clients who need continuous development, support, or strategy.',
  JSON.stringify(['Partnership Overview', 'Scope of Services', 'Monthly Allocation', 'Communication & Process', 'Investment', 'Terms']),
  'partnership'
).lastInsertRowid;

// ── Proposals ────────────────────────────────────────────────────
const insertProposal = db.prepare(`INSERT INTO proposals (client_id, template_id, title, status, total_hours, total_cost, timeline_weeks, brief, created_at, sent_at, accepted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

// Accepted proposal for Whitfield & Associates
const p1 = insertProposal.run(
  c2, t1, 'Case Management & Client Intake Modernization',
  'accepted', 120, 20400, 8,
  'Whitfield & Associates needs to replace their paper-based intake process and spreadsheet case tracking. They want clients to fill out forms online, conflicts checked automatically, and cases tracked in a real system. 3 attorneys, 2 paralegals, 1 office manager.',
  daysAgo(30), daysAgo(28), daysAgo(21)
).lastInsertRowid;

// Sent proposal for NovaByte
const p2 = insertProposal.run(
  c3, t1, 'Multi-Tenant Analytics Dashboard MVP',
  'sent', 200, 34500, 6,
  'NovaByte needs a multi-tenant dashboard for their analytics SaaS product. Each customer org sees only their data. Role-based access, data visualization, CSV export, API integrations. Series A funded, need MVP for investor demo in 6 weeks.',
  daysAgo(7), daysAgo(5), null
).lastInsertRowid;

// Draft proposal for Verdant Wellness
const p3 = insertProposal.run(
  c1, t2, 'Patient Portal & Booking System',
  'draft', 60, 9900, 4,
  'Maria wants to replace their WordPress site with a proper patient portal. Online booking, intake forms, appointment reminders, and a clean modern design. Must be mobile-friendly. Budget is tight.',
  daysAgo(2), null, null
).lastInsertRowid;

// Accepted proposal for Bright Futures (nonprofit)
const p4 = insertProposal.run(
  c5, t2, 'Donor Management & Grant Tracker',
  'accepted', 45, 6975, 3,
  'Aisha needs a simple donor tracker and grant pipeline. Currently managing everything in Google Sheets. Small team of 3. Needs to track donations, donors, campaigns, and grant deadlines. Budget-conscious.',
  daysAgo(45), daysAgo(43), daysAgo(38)
).lastInsertRowid;

// Discovery proposal for Coastal Realty
const p5 = insertProposal.run(
  c6, t3, 'Listings Platform Discovery',
  'sent', 20, 4000, 2,
  'Tom wants an MCP-powered listings platform for his 12-agent brokerage. Before we build, we need to understand their current workflow, MLS integration requirements, and what "search by asking a question" actually means for their agents.',
  daysAgo(10), daysAgo(8), null
).lastInsertRowid;

// Declined proposal (edge case)
const p6 = insertProposal.run(
  c4, t2, 'Project Tracker MVP',
  'declined', 50, 8250, 3,
  'Derek wants a mobile-first project tracker with subcontractor management. Change orders, daily logs, photo uploads. Went with a competitor who promised it in 2 weeks for $4K.',
  daysAgo(60), daysAgo(58), null
).lastInsertRowid;

// ── Proposal Sections ────────────────────────────────────────────
const insertSection = db.prepare(`INSERT INTO proposal_sections (proposal_id, section_order, title, content, section_type) VALUES (?, ?, ?, ?, ?)`);

// P1 sections (Whitfield — accepted SOW)
insertSection.run(p1, 1, 'Executive Summary', 'Whitfield & Associates is ready to leave paper forms and spreadsheets behind. This proposal outlines a modern case management and client intake system that will save your team 15+ hours per week, reduce intake errors, and give you real-time visibility into your caseload.\n\nWe\'ll build a custom web application with online intake forms, automated conflict checking, case tracking, and a clean dashboard your whole team will actually use.', 'summary');
insertSection.run(p1, 2, 'Understanding Your Needs', 'After our initial conversation, here\'s what we understand:\n\n• Your current intake process involves paper forms that get manually entered into spreadsheets\n• Conflict checks require searching through multiple files and take 30+ minutes per new client\n• Case status updates happen via email chains that get lost\n• Your team of 6 (3 attorneys, 2 paralegals, 1 office manager) needs role-based access\n• You want clients to be able to fill out intake forms online before their first meeting', 'needs');
insertSection.run(p1, 3, 'Proposed Solution', 'A custom Next.js application with Supabase backend, featuring:\n\n1. **Online Client Intake**: Branded intake forms that clients fill out before meeting. Auto-saves, mobile-friendly.\n2. **Automated Conflict Checks**: Cross-reference new clients against all existing cases, parties, and related entities.\n3. **Case Dashboard**: Real-time view of all active cases, upcoming deadlines, and assigned team members.\n4. **Document Management**: Upload, organize, and tag documents per case.\n5. **Role-Based Access**: Attorneys see everything, paralegals see assigned cases, office manager handles intake.\n\nOptional add-on: MCP server so you can ask Claude questions about your caseload.', 'solution');
insertSection.run(p1, 4, 'Scope of Work', '**Phase 1 — Foundation (Weeks 1–3)**\n• Database design and Supabase setup\n• Authentication and role-based access\n• Client intake form builder\n• Conflict check engine\n\n**Phase 2 — Core Features (Weeks 4–6)**\n• Case management dashboard\n• Document upload and organization\n• Deadline and hearing tracker\n• Email notifications\n\n**Phase 3 — Polish & Launch (Weeks 7–8)**\n• UI polish and mobile optimization\n• Data migration from existing spreadsheets\n• Team training session\n• Deployment and go-live support', 'scope');
insertSection.run(p1, 5, 'Investment', '| Service | Hours | Rate | Subtotal |\n|---------|-------|------|----------|\n| Web Application Development | 80 | $165/hr | $13,200 |\n| Data Migration & Integration | 24 | $155/hr | $3,720 |\n| UI/UX Design & Implementation | 16 | $155/hr | $2,480 |\n| **Total** | **120** | | **$19,400** |\n\n50% due at project start, 25% at Phase 2 kickoff, 25% at launch.\n\nOptional: MCP server add-on — 20 hours at $175/hr ($3,500)', 'pricing');

// P2 sections (NovaByte — sent SOW)
insertSection.run(p2, 1, 'Executive Summary', 'NovaByte\'s analytics platform needs a dashboard that\'s as powerful as the data behind it. This proposal covers the design and development of a multi-tenant analytics dashboard MVP — built for your investor demo in 6 weeks, architected to scale after.\n\nWe\'ll handle the full stack: tenant isolation, role-based access, data visualization, and a clean UI that makes your Series A investors say "when can we use this?"', 'summary');
insertSection.run(p2, 2, 'Proposed Solution', 'A multi-tenant Next.js application with:\n\n1. **Tenant Isolation**: Each customer org sees only their data. Row-level security in Supabase.\n2. **Role Hierarchy**: Owner → Admin → Analyst → Viewer per org.\n3. **Analytics Dashboard**: Charts, KPIs, trend lines, and custom date ranges.\n4. **Data Pipeline**: Ingest from your existing API, transform, and display.\n5. **CSV Export**: Let customers export their data.\n6. **Invite Flow**: Org admins can invite team members via email.\n\nArchitected so post-MVP features (API keys, webhooks, white-labeling) can be added without rewriting.', 'solution');
insertSection.run(p2, 3, 'Timeline', '**Sprint 1 (Weeks 1–2)**: Auth, tenant isolation, role system, org management\n**Sprint 2 (Weeks 3–4)**: Data pipeline, dashboard components, chart library\n**Sprint 3 (Weeks 5–6)**: Polish, export, invite flow, investor demo prep\n\nDaily async updates. Weekly 30-min sync calls.', 'timeline');
insertSection.run(p2, 4, 'Investment', '| Service | Hours | Rate | Subtotal |\n|---------|-------|------|----------|\n| Web Application Development | 120 | $165/hr | $19,800 |\n| AI Workflow Automation | 30 | $185/hr | $5,550 |\n| Security Audit & Hardening | 20 | $185/hr | $3,700 |\n| UI/UX Design | 30 | $155/hr | $4,650 |\n| **Total** | **200** | | **$33,700** |\n\nNet 15 terms. Monthly invoicing.', 'pricing');

// P3 sections (Verdant Wellness — draft)
insertSection.run(p3, 1, 'Overview', 'Verdant Wellness needs a modern patient portal that replaces the aging WordPress site. Patients should be able to book appointments, fill out intake forms, and manage their profiles — all from their phone.\n\nWe\'ll build a clean, fast Next.js application that reflects the calm, professional brand Maria has built.', 'summary');
insertSection.run(p3, 2, 'What We\'ll Build', '• Online appointment booking with calendar integration\n• Digital intake forms (new patient, follow-up, consent)\n• Patient dashboard (upcoming appointments, forms, messages)\n• Mobile-first responsive design\n• Admin panel for Maria\'s team to manage bookings and patients', 'solution');
insertSection.run(p3, 3, 'Investment', '| Service | Hours | Rate | Subtotal |\n|---------|-------|------|----------|\n| Web Application Development | 40 | $165/hr | $6,600 |\n| UI/UX Design | 20 | $155/hr | $3,100 |\n| **Total** | **60** | | **$9,700** |\n\n50% upfront, 50% at launch.', 'pricing');

// ── Line Items ────────────────────────────────────────────────────
const insertLineItem = db.prepare(`INSERT INTO line_items (proposal_id, service_id, description, hours, rate, subtotal) VALUES (?, ?, ?, ?, ?, ?)`);

// P1 line items
insertLineItem.run(p1, s2, 'Web Application Development — case management, intake forms, dashboard', 80, 165, 13200);
insertLineItem.run(p1, s7, 'Data Migration — spreadsheets to Supabase', 24, 155, 3720);
insertLineItem.run(p1, s4, 'UI/UX Design — responsive layout, component library', 16, 155, 2480);

// P2 line items
insertLineItem.run(p2, s2, 'Web Application Development — multi-tenant dashboard, auth, org management', 120, 165, 19800);
insertLineItem.run(p2, s3, 'AI Workflow Automation — data pipeline, smart alerts', 30, 185, 5550);
insertLineItem.run(p2, s6, 'Security Audit — tenant isolation, RLS policies, auth hardening', 20, 185, 3700);
insertLineItem.run(p2, s4, 'UI/UX Design — dashboard components, charts, responsive', 30, 155, 4650);

// P3 line items
insertLineItem.run(p3, s2, 'Web Application Development — patient portal, booking, intake forms', 40, 165, 6600);
insertLineItem.run(p3, s4, 'UI/UX Design — mobile-first design, brand-aligned', 20, 155, 3100);

// P4 line items
insertLineItem.run(p4, s2, 'Web Application Development — donor tracker, grant pipeline', 30, 155, 4650);
insertLineItem.run(p4, s4, 'UI/UX Design — clean dashboard', 15, 155, 2325);

// P5 line items
insertLineItem.run(p5, s8, 'Strategy & Technical Consulting — workflow analysis, requirements', 12, 200, 2400);
insertLineItem.run(p5, s1, 'MCP Server Development — prototype MCP search', 8, 175, 1400);

// P6 line items
insertLineItem.run(p6, s2, 'Web Application Development — project tracker, mobile-first', 35, 165, 5775);
insertLineItem.run(p6, s4, 'UI/UX Design — mobile-first responsive design', 15, 155, 2325);

// Count and log
const clientCount = (db.prepare('SELECT COUNT(*) as c FROM clients').get() as any).c;
const serviceCount = (db.prepare('SELECT COUNT(*) as c FROM services').get() as any).c;
const templateCount = (db.prepare('SELECT COUNT(*) as c FROM templates').get() as any).c;
const proposalCount = (db.prepare('SELECT COUNT(*) as c FROM proposals').get() as any).c;
const sectionCount = (db.prepare('SELECT COUNT(*) as c FROM proposal_sections').get() as any).c;
const lineItemCount = (db.prepare('SELECT COUNT(*) as c FROM line_items').get() as any).c;

console.log(`Seeded: ${clientCount} clients, ${serviceCount} services, ${templateCount} templates, ${proposalCount} proposals, ${sectionCount} sections, ${lineItemCount} line items`);
