import db from './database.js';

// Clear existing data
db.exec('DELETE FROM notes');
db.exec('DELETE FROM decisions');
db.exec('DELETE FROM action_items');
db.exec('DELETE FROM attendees');
db.exec('DELETE FROM meetings');
db.exec('DELETE FROM participants');

// --- Participants ---
const insertParticipant = db.prepare(`
  INSERT INTO participants (name, email, role, department) VALUES (?, ?, ?, ?)
`);

const participants = [
  ['Ashley Harrison', 'ashley@tellavsn.com', 'lead', 'Engineering'],
  ['Marcus Chen', 'marcus@company.com', 'manager', 'Product'],
  ['Sofia Rodriguez', 'sofia@company.com', 'senior', 'Engineering'],
  ['James Okafor', 'james@company.com', 'senior', 'Design'],
  ['Priya Patel', 'priya@company.com', 'manager', 'Marketing'],
  ['David Kim', 'david@company.com', 'member', 'Engineering'],
  ['Rachel Torres', 'rachel@company.com', 'lead', 'QA'],
  ['Alex Nguyen', 'alex@company.com', 'director', 'Product'],
  ['Mia Johnson', 'mia@company.com', 'member', 'Design'],
  ['Carlos Mendez', 'carlos@company.com', 'senior', 'Engineering'],
  ['Emma Wright', 'emma@company.com', 'manager', 'Sales'],
  ['Omar Hassan', 'omar@company.com', 'member', 'Engineering'],
];

for (const p of participants) {
  insertParticipant.run(...p);
}

// --- Meetings ---
const insertMeeting = db.prepare(`
  INSERT INTO meetings (title, meeting_type, date, duration_minutes, organizer_id, status, summary)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const meetings = [
  ['Q2 Roadmap Planning', 'planning', '2026-03-25 10:00', 90, 8, 'completed', 'Aligned on Q2 priorities. Three major initiatives approved: client portal v2, API rate limiting, and mobile push notifications. Budget approved for two contractor hires.'],
  ['Sprint 14 Retro', 'retrospective', '2026-03-26 14:00', 45, 2, 'completed', 'Team velocity improved 15% over Sprint 13. Main friction point was unclear acceptance criteria on portal tickets. Agreed to add AC review step to grooming.'],
  ['Design System Review', 'review', '2026-03-27 11:00', 60, 4, 'completed', 'Reviewed new component library progress. Button and input variants approved. Modal and drawer components need accessibility fixes before merge.'],
  ['Client Portal Architecture', 'technical', '2026-03-28 09:30', 75, 3, 'completed', 'Decided on Next.js App Router with server components for the client portal. Supabase RLS for multi-tenant data isolation. Real-time features via Supabase subscriptions.'],
  ['Weekly Standup — Engineering', 'standup', '2026-03-31 09:00', 15, 1, 'completed', 'All engineers on track. David blocked on API rate limiting — needs Redis config from DevOps. Carlos finishing auth migration by Wednesday.'],
  ['Marketing × Product Sync', 'cross_functional', '2026-03-31 13:00', 30, 5, 'completed', 'Aligned launch messaging for client portal. Marketing needs screenshots by April 4. Product confirmed feature freeze date of April 7.'],
  ['Security Audit Findings', 'review', '2026-04-01 10:00', 60, 7, 'completed', 'Reviewed penetration test results. Two critical findings: exposed debug endpoints in staging and weak session token rotation. Both need fixes before April 10 release.'],
  ['1:1 — Ashley × Marcus', 'one_on_one', '2026-04-01 15:00', 30, 2, 'completed', 'Discussed team capacity for Q2. Ashley flagged risk on mobile timeline — suggested bringing in a React Native contractor. Marcus agreed to escalate budget request.'],
  ['Sprint 15 Planning', 'planning', '2026-04-02 10:00', 60, 2, 'completed', 'Planned 42 story points across 8 tickets. Top priority: security fixes from audit. Secondary: client portal MVP features. Stretch: API documentation refresh.'],
  ['Incident Postmortem — API Outage', 'postmortem', '2026-03-29 16:00', 45, 1, 'completed', 'Root cause: connection pool exhaustion during traffic spike. Mitigation: increased pool size, added circuit breaker. Long-term: migrate to connection pooler (PgBouncer).'],
  ['All Hands — March Wrap', 'all_hands', '2026-03-28 16:00', 45, 8, 'completed', 'Celebrated 26-day shipping streak. Revenue up 18% MoM. Two new enterprise clients onboarded. Hiring update: 3 offers extended, 1 accepted.'],
  ['UX Research Readout', 'review', '2026-03-26 11:00', 45, 9, 'completed', 'User testing revealed confusion around project status labels. Recommendation: simplify to 3 states (active, paused, complete) from current 7. Dashboard navigation scored 4.2/5.'],
  ['API Rate Limiting Design', 'technical', '2026-03-27 14:00', 60, 6, 'completed', 'Chose sliding window algorithm with Redis backend. Limits: 100 req/min free tier, 1000 req/min pro, 10000 req/min enterprise. Need to add rate limit headers to all responses.'],
  ['Sales Pipeline Review', 'review', '2026-04-01 11:00', 30, 11, 'completed', 'Pipeline at $340K. Three deals in final negotiation: Meridian Health ($85K), Coastal Finance ($62K), and TechStart ($45K). Meridian needs SOC 2 compliance doc by Friday.'],
  ['Onboarding Flow Redesign', 'planning', '2026-03-25 14:00', 60, 4, 'completed', 'Current onboarding has 40% drop-off at step 3 (team invite). Redesign: reduce to 3 steps, add skip options, implement progressive profiling. Design mockups due April 3.'],
];

for (const m of meetings) {
  insertMeeting.run(...m);
}

// --- Attendees ---
const insertAttendee = db.prepare(`
  INSERT INTO attendees (meeting_id, participant_id, attended) VALUES (?, ?, ?)
`);

const attendeeData: [number, number, number][] = [
  // Q2 Roadmap Planning (meeting 1)
  [1, 1, 1], [1, 2, 1], [1, 3, 1], [1, 4, 1], [1, 5, 1], [1, 8, 1], [1, 11, 1],
  // Sprint 14 Retro (meeting 2)
  [2, 1, 1], [2, 2, 1], [2, 3, 1], [2, 6, 1], [2, 7, 1], [2, 10, 1], [2, 12, 1],
  // Design System Review (meeting 3)
  [3, 1, 1], [3, 3, 1], [3, 4, 1], [3, 9, 1], [3, 6, 0],
  // Client Portal Architecture (meeting 4)
  [4, 1, 1], [4, 3, 1], [4, 6, 1], [4, 10, 1], [4, 12, 1],
  // Weekly Standup (meeting 5)
  [5, 1, 1], [5, 3, 1], [5, 6, 1], [5, 10, 1], [5, 12, 1],
  // Marketing × Product (meeting 6)
  [6, 2, 1], [6, 5, 1], [6, 8, 1], [6, 9, 1],
  // Security Audit (meeting 7)
  [7, 1, 1], [7, 3, 1], [7, 7, 1], [7, 10, 1], [7, 12, 1],
  // 1:1 (meeting 8)
  [8, 1, 1], [8, 2, 1],
  // Sprint 15 Planning (meeting 9)
  [9, 1, 1], [9, 2, 1], [9, 3, 1], [9, 6, 1], [9, 7, 1], [9, 10, 1], [9, 12, 1],
  // Postmortem (meeting 10)
  [10, 1, 1], [10, 3, 1], [10, 6, 1], [10, 10, 1], [10, 7, 1],
  // All Hands (meeting 11)
  [11, 1, 1], [11, 2, 1], [11, 3, 1], [11, 4, 1], [11, 5, 1], [11, 6, 1], [11, 7, 1], [11, 8, 1], [11, 9, 1], [11, 10, 1], [11, 11, 1], [11, 12, 1],
  // UX Research (meeting 12)
  [12, 2, 1], [12, 4, 1], [12, 5, 1], [12, 9, 1],
  // API Rate Limiting (meeting 13)
  [13, 1, 1], [13, 3, 1], [13, 6, 1], [13, 10, 1],
  // Sales Pipeline (meeting 14)
  [14, 2, 1], [14, 5, 1], [14, 8, 1], [14, 11, 1],
  // Onboarding Redesign (meeting 15)
  [15, 2, 1], [15, 4, 1], [15, 5, 1], [15, 9, 1],
];

for (const a of attendeeData) {
  insertAttendee.run(...a);
}

// --- Action Items ---
const insertAction = db.prepare(`
  INSERT INTO action_items (meeting_id, owner_id, description, priority, status, due_date, completed_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const actionItems = [
  // Q2 Roadmap (meeting 1)
  [1, 2, 'Draft Q2 OKRs and share with leadership', 'high', 'completed', '2026-03-28', '2026-03-27 16:00'],
  [1, 3, 'Write technical spec for client portal v2', 'high', 'completed', '2026-04-01', '2026-03-31 11:00'],
  [1, 1, 'Set up project board for Q2 initiatives', 'medium', 'completed', '2026-03-27', '2026-03-26 14:00'],
  [1, 5, 'Create launch timeline for client portal marketing', 'medium', 'open', '2026-04-04', null],
  // Sprint 14 Retro (meeting 2)
  [2, 2, 'Add acceptance criteria review step to grooming template', 'high', 'completed', '2026-03-28', '2026-03-28 09:00'],
  [2, 7, 'Update QA checklist with new portal test cases', 'medium', 'open', '2026-04-03', null],
  // Design System (meeting 3)
  [3, 4, 'Fix modal accessibility — focus trap and aria labels', 'high', 'in_progress', '2026-04-02', null],
  [3, 9, 'Create drawer component variants for mobile', 'medium', 'open', '2026-04-04', null],
  [3, 4, 'Document approved button and input component specs', 'low', 'open', '2026-04-07', null],
  // Client Portal Architecture (meeting 4)
  [4, 3, 'Set up Next.js App Router project scaffold', 'high', 'completed', '2026-03-31', '2026-03-30 10:00'],
  [4, 10, 'Configure Supabase RLS policies for multi-tenant isolation', 'high', 'in_progress', '2026-04-03', null],
  [4, 6, 'Prototype real-time notifications with Supabase subscriptions', 'medium', 'open', '2026-04-07', null],
  // Weekly Standup (meeting 5)
  [5, 6, 'Get Redis config from DevOps for rate limiting', 'high', 'open', '2026-04-01', null],
  [5, 10, 'Finish auth migration and submit PR', 'high', 'in_progress', '2026-04-02', null],
  // Marketing × Product (meeting 6)
  [6, 5, 'Write client portal launch blog post draft', 'medium', 'open', '2026-04-07', null],
  [6, 4, 'Prepare portal screenshots for marketing materials', 'high', 'open', '2026-04-04', null],
  [6, 2, 'Confirm feature freeze date with engineering', 'high', 'completed', '2026-04-01', '2026-03-31 17:00'],
  // Security Audit (meeting 7)
  [7, 3, 'Remove debug endpoints from staging environment', 'critical', 'in_progress', '2026-04-03', null],
  [7, 10, 'Implement session token rotation — 24hr expiry', 'critical', 'open', '2026-04-05', null],
  [7, 7, 'Write regression tests for security fixes', 'high', 'open', '2026-04-07', null],
  // 1:1 (meeting 8)
  [8, 2, 'Escalate React Native contractor budget request to Alex', 'high', 'completed', '2026-04-02', '2026-04-01 17:00'],
  [8, 1, 'Draft mobile timeline risk assessment document', 'medium', 'open', '2026-04-04', null],
  // Sprint 15 Planning (meeting 9)
  [9, 1, 'Assign security fix tickets to Sofia and Carlos', 'high', 'completed', '2026-04-02', '2026-04-02 11:00'],
  [9, 6, 'Start client portal auth flow implementation', 'high', 'open', '2026-04-09', null],
  [9, 12, 'Refresh API documentation for v2 endpoints', 'low', 'open', '2026-04-11', null],
  // Postmortem (meeting 10)
  [10, 3, 'Increase connection pool size to 50 in production', 'critical', 'completed', '2026-03-30', '2026-03-29 18:00'],
  [10, 10, 'Add circuit breaker to database connection layer', 'high', 'completed', '2026-04-01', '2026-03-31 15:00'],
  [10, 1, 'Evaluate PgBouncer for long-term connection pooling', 'medium', 'open', '2026-04-11', null],
  [10, 6, 'Add connection pool monitoring to Grafana dashboard', 'medium', 'open', '2026-04-07', null],
  // UX Research (meeting 12)
  [12, 4, 'Redesign project status labels — simplify to 3 states', 'high', 'open', '2026-04-04', null],
  [12, 9, 'Update design system with new status badge components', 'medium', 'open', '2026-04-07', null],
  // API Rate Limiting (meeting 13)
  [13, 6, 'Implement sliding window rate limiter with Redis', 'high', 'in_progress', '2026-04-04', null],
  [13, 10, 'Add X-RateLimit headers to all API responses', 'medium', 'open', '2026-04-07', null],
  [13, 3, 'Write rate limiting integration tests', 'medium', 'open', '2026-04-07', null],
  // Sales Pipeline (meeting 14)
  [14, 11, 'Send SOC 2 compliance documentation to Meridian Health', 'critical', 'open', '2026-04-04', null],
  [14, 5, 'Prepare case study for Coastal Finance proposal', 'high', 'open', '2026-04-07', null],
  // Onboarding Redesign (meeting 15)
  [15, 4, 'Create mockups for simplified 3-step onboarding flow', 'high', 'open', '2026-04-03', null],
  [15, 9, 'Build progressive profiling prototype', 'medium', 'open', '2026-04-10', null],
  [15, 5, 'Draft copy for new onboarding welcome email sequence', 'medium', 'open', '2026-04-07', null],
];

for (const a of actionItems) {
  insertAction.run(...a);
}

// --- Decisions ---
const insertDecision = db.prepare(`
  INSERT INTO decisions (meeting_id, description, context, decided_by, impact)
  VALUES (?, ?, ?, ?, ?)
`);

const decisions = [
  [1, 'Approved three Q2 initiatives: client portal v2, API rate limiting, mobile push notifications', 'Budget supports two contractor hires to maintain velocity', 'Alex Nguyen', 'high'],
  [1, 'Allocated $15K budget for React Native contractor', 'Mobile timeline at risk without additional capacity', 'Alex Nguyen', 'high'],
  [2, 'Added acceptance criteria review step to sprint grooming', 'Sprint 14 had multiple tickets returned due to unclear AC', 'Marcus Chen', 'medium'],
  [3, 'Approved button and input component variants for production', 'Passed accessibility audit and cross-browser testing', 'James Okafor', 'medium'],
  [3, 'Modal and drawer components blocked until accessibility fixes complete', 'Failed WCAG 2.1 AA — missing focus trap and aria-labels', 'James Okafor', 'medium'],
  [4, 'Chose Next.js App Router with server components for client portal', 'Better performance and SEO than SPA approach, team already familiar with Next.js', 'Sofia Rodriguez', 'high'],
  [4, 'Supabase RLS for multi-tenant data isolation', 'Simpler than custom middleware, battle-tested approach, already in stack', 'Sofia Rodriguez', 'high'],
  [6, 'Feature freeze for client portal set for April 7', 'Marketing needs stable product for launch materials', 'Marcus Chen', 'high'],
  [7, 'All security findings must be resolved before April 10 release', 'Two critical vulnerabilities cannot ship to production', 'Rachel Torres', 'critical'],
  [10, 'Migrate to PgBouncer for connection pooling within Q2', 'Current pool exhaustion caused 23-minute outage on March 29', 'Ashley Harrison', 'high'],
  [10, 'Added circuit breaker as immediate mitigation', 'Prevents cascading failures during traffic spikes', 'Ashley Harrison', 'high'],
  [12, 'Simplify project status from 7 states to 3 (active, paused, complete)', 'User testing showed confusion — 60% of users couldn\'t distinguish between similar states', 'Mia Johnson', 'medium'],
  [13, 'Sliding window algorithm for rate limiting (not fixed window)', 'Prevents burst abuse at window boundaries', 'David Kim', 'medium'],
  [13, 'Rate limits: 100/min free, 1000/min pro, 10000/min enterprise', 'Aligned with competitor benchmarks and current usage patterns', 'David Kim', 'high'],
  [15, 'Reduce onboarding from 5 steps to 3 with skip options', '40% drop-off at step 3 — team invite is optional, shouldn\'t block setup', 'James Okafor', 'high'],
];

for (const d of decisions) {
  insertDecision.run(...d);
}

// --- Notes ---
const insertNote = db.prepare(`
  INSERT INTO notes (meeting_id, speaker_id, content, topic, timestamp_minutes)
  VALUES (?, ?, ?, ?, ?)
`);

const notes = [
  // Q2 Roadmap (meeting 1)
  [1, 8, 'We need to prioritize based on revenue impact. Client portal directly affects retention and expansion revenue.', 'priorities', 5],
  [1, 2, 'Product team has validated the portal concept with 8 enterprise clients. All confirmed they\'d use it.', 'validation', 10],
  [1, 3, 'Technically, we can ship an MVP in 6 weeks if we scope it to project status + document sharing. Real-time chat is a stretch goal.', 'scope', 20],
  [1, 5, 'Marketing can run a soft launch to existing clients first, then broader launch in May.', 'go-to-market', 35],
  [1, 1, 'We should allocate 60% of engineering capacity to portal, 25% to rate limiting, 15% to mobile notifications.', 'capacity', 45],
  [1, 11, 'Three enterprise prospects specifically asked about a client portal in their evaluations. This is a deal-closer.', 'sales-impact', 55],
  // Sprint 14 Retro (meeting 2)
  [2, 7, 'We returned 4 tickets this sprint because acceptance criteria were ambiguous. We need to catch this earlier.', 'process', 5],
  [2, 3, 'I think the issue is we\'re writing AC during grooming instead of before. We need a pre-grooming AC review.', 'process', 10],
  [2, 6, 'Velocity was 38 points — best sprint since December. The new pairing rotation is working.', 'wins', 20],
  [2, 10, 'Auth migration is 80% done. Last piece is the token refresh logic. Should land by Wednesday.', 'updates', 30],
  // Client Portal Architecture (meeting 4)
  [4, 3, 'Server components give us the performance win without the complexity of a separate API layer.', 'architecture', 5],
  [4, 10, 'RLS policies handle tenant isolation at the database level. Even if our app code has a bug, data can\'t leak between tenants.', 'security', 15],
  [4, 6, 'For real-time, Supabase subscriptions are simpler than running our own WebSocket server. We can upgrade later if needed.', 'real-time', 30],
  [4, 1, 'Let\'s plan for the worst case on data migration. If it takes a week, we need to start by April 7 to hit the launch date.', 'timeline', 45],
  // Postmortem (meeting 10)
  [10, 3, 'The outage started at 14:23 when a marketing email drove 3x normal traffic to the API. Connection pool hit 20/20 within 2 minutes.', 'timeline', 5],
  [10, 6, 'We had no alerting on connection pool utilization. The first alert was the health check failing at 14:35.', 'detection', 10],
  [10, 1, 'Increasing pool size is a band-aid. PgBouncer or Supavisor gives us real connection multiplexing without changing app code.', 'long-term', 25],
  [10, 7, 'We need a load test that simulates traffic spikes. Our current test suite only covers steady-state.', 'testing', 35],
  // Security Audit (meeting 7)
  [7, 7, 'The pen test found /api/debug/health and /api/debug/db-stats exposed in staging. These return internal server details.', 'findings', 5],
  [7, 3, 'Easy fix — we\'ll gate those behind an internal auth header and strip them from the production build entirely.', 'remediation', 10],
  [7, 10, 'Session tokens currently don\'t rotate. If one is compromised, it\'s valid until the user logs out. We need time-based rotation.', 'findings', 20],
  [7, 1, 'I recommend 24-hour rotation with a 1-hour grace period for active sessions. That balances security and UX.', 'remediation', 30],
];

for (const n of notes) {
  insertNote.run(...n);
}

console.log('Seeded meeting notes database:');
console.log(`  ${participants.length} participants`);
console.log(`  ${meetings.length} meetings`);
console.log(`  ${attendeeData.length} attendee records`);
console.log(`  ${actionItems.length} action items`);
console.log(`  ${decisions.length} decisions`);
console.log(`  ${notes.length} notes`);
