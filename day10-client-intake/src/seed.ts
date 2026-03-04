import db from './database.js';

// Clear existing data
db.exec(`
  DELETE FROM documents;
  DELETE FROM workflow_steps;
  DELETE FROM engagements;
  DELETE FROM conflict_checks;
  DELETE FROM intake_forms;
  DELETE FROM clients;
`);

// ============================================================
// CLIENTS — 12 clients at various stages of intake
// ============================================================
const insertClient = db.prepare(`
  INSERT INTO clients (name, email, phone, company, referral_source, status, practice_area, assigned_attorney, created_at, onboarded_at, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const clients = [
  // Fully onboarded
  ['Marcus Chen', 'marcus@vertexcapital.com', '310-555-0101', 'Vertex Capital Partners', 'Referral — David Kim', 'onboarded', 'Corporate / M&A', 'Sarah Whitfield', '2026-01-15 09:00:00', '2026-01-28 14:00:00', 'Series B acquisition target. High priority.'],
  ['Diana Reyes', 'diana@solarhorizon.com', '213-555-0202', 'Solar Horizon Energy', 'Website', 'onboarded', 'Business Formation', 'James Park', '2026-01-20 11:30:00', '2026-02-03 10:00:00', 'Forming LLC for renewable energy startup. May need IP work later.'],
  ['Robert Okafor', 'robert@oaklandmfg.com', '510-555-0303', 'Oakland Manufacturing Co', 'Conference — ABA Annual', 'onboarded', 'Employment Law', 'Sarah Whitfield', '2026-02-01 08:00:00', '2026-02-12 16:00:00', 'Needs employment handbook review and policy update.'],

  // In progress — various stages
  ['Priya Sharma', 'priya@luminahealth.io', '415-555-0404', 'Lumina Health Technologies', 'Referral — Diana Reyes', 'intake_in_progress', 'Healthcare Regulatory', 'Maria Santos', '2026-02-18 10:00:00', null, 'HIPAA compliance review for new telehealth platform. Conflict check pending.'],
  ['Thomas Brennan', 'tom@brennandev.com', '323-555-0505', 'Brennan Development Group', 'LinkedIn', 'intake_in_progress', 'Real Estate', 'James Park', '2026-02-22 14:00:00', null, 'Commercial property acquisition in DTLA. Needs environmental review.'],
  ['Aisha Patel', 'aisha@culturecollective.co', '818-555-0606', 'Culture Collective Agency', 'Referral — Marcus Chen', 'engagement_sent', 'Intellectual Property', 'Sarah Whitfield', '2026-02-25 09:30:00', null, 'Trademark portfolio for creative agency. 12 marks to register.'],
  ['Kevin Wu', 'kevin@pacificlogistics.net', '562-555-0707', 'Pacific Logistics Inc', 'Google Search', 'conflict_review', 'Business Litigation', 'Maria Santos', '2026-02-28 11:00:00', null, 'Potential conflict — opposing party in Chen matter may be related entity.'],

  // New prospects
  ['Jasmine Torres', 'jasmine@greenleaforg.org', '626-555-0808', 'GreenLeaf Foundation', 'Referral — Robert Okafor', 'prospect', 'Nonprofit / Tax Exempt', 'James Park', '2026-03-01 10:00:00', null, '501(c)(3) application and governance documents.'],
  ['David Nakamura', 'david@precisionrobotics.ai', '408-555-0909', 'Precision Robotics Inc', 'Website', 'prospect', 'Intellectual Property', null, '2026-03-02 15:00:00', null, 'Patent filing for autonomous navigation system. Needs prior art search.'],
  ['Elena Volkov', 'elena@volkovimports.com', '212-555-1010', 'Volkov International Imports', 'Cold Outreach', 'prospect', 'International Trade', null, '2026-03-03 08:30:00', null, 'Import compliance review. Tariff classification questions.'],

  // Declined / withdrawn
  ['Frank Morrison', 'frank@morrisongroup.com', '714-555-1111', 'Morrison Group LLC', 'Referral — external', 'declined', 'Business Litigation', null, '2026-02-10 09:00:00', null, 'Conflict of interest — opposing party is existing client (Oakland Mfg).'],
  ['Sandra Kim', 'sandra@brightpathtech.com', '650-555-1212', 'BrightPath Technologies', 'Website', 'withdrawn', 'Employment Law', 'Sarah Whitfield', '2026-02-15 13:00:00', null, 'Client decided to handle matter in-house after initial consultation.'],
];

for (const c of clients) {
  insertClient.run(...c);
}

// ============================================================
// INTAKE FORMS
// ============================================================
const insertForm = db.prepare(`
  INSERT INTO intake_forms (client_id, form_type, status, submitted_at, reviewed_at, reviewed_by, data, flags, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const forms = [
  // Marcus Chen — fully reviewed
  [1, 'corporate_intake', 'approved', '2026-01-15 09:30:00', '2026-01-16 10:00:00', 'Sarah Whitfield',
    JSON.stringify({ entity_type: 'Delaware C-Corp', annual_revenue: '$45M', employees: 120, pending_litigation: false, prior_counsel: 'Baker & Associates', reason_for_change: 'Need M&A expertise' }),
    null, 'Clean intake. No issues.'],

  // Diana Reyes — reviewed
  [2, 'business_formation', 'approved', '2026-01-20 12:00:00', '2026-01-21 09:00:00', 'James Park',
    JSON.stringify({ entity_type: 'LLC', members: 3, initial_capital: '$500K', industry: 'Renewable Energy', state_of_formation: 'California', operating_agreement: false }),
    null, 'Straightforward LLC formation.'],

  // Robert Okafor — reviewed
  [3, 'employment_intake', 'approved', '2026-02-01 08:30:00', '2026-02-02 11:00:00', 'Sarah Whitfield',
    JSON.stringify({ company_size: 85, states_operating: ['CA', 'NV', 'AZ'], union_workforce: false, pending_claims: 1, last_handbook_update: '2023', remote_workers: 30 }),
    JSON.stringify(['Pending EEOC claim', 'Handbook 3+ years old']), 'Flagged: outdated handbook and active EEOC claim.'],

  // Priya Sharma — submitted, needs review
  [4, 'healthcare_intake', 'submitted', '2026-02-18 10:30:00', null, null,
    JSON.stringify({ entity_type: 'Delaware C-Corp', hipaa_compliant: 'partial', baa_count: 8, patient_data_volume: '50K+ records', prior_audits: 0, telehealth_states: ['CA', 'TX', 'NY', 'FL'] }),
    JSON.stringify(['No prior HIPAA audit', 'Multi-state telehealth requires state-by-state analysis']), null],

  // Thomas Brennan — submitted
  [5, 'real_estate_intake', 'submitted', '2026-02-22 14:30:00', null, null,
    JSON.stringify({ property_type: 'Commercial Office', address: '800 S Figueroa St, Los Angeles', purchase_price: '$12.5M', financing: 'Commercial Loan + Investor Capital', environmental_concerns: true, zoning_issues: 'possible', closing_target: '2026-05-01' }),
    JSON.stringify(['Environmental Phase I needed', 'Possible zoning variance required']), null],

  // Aisha Patel — reviewed and approved
  [6, 'ip_intake', 'approved', '2026-02-25 10:00:00', '2026-02-26 09:00:00', 'Sarah Whitfield',
    JSON.stringify({ trademark_count: 12, existing_registrations: 3, international_filing: true, madrid_protocol: true, opposing_marks: 'unknown', industries: ['Advertising', 'Media', 'Digital Marketing'] }),
    null, 'Large portfolio. Will need phased filing strategy.'],

  // Kevin Wu — under review (conflict hold)
  [7, 'litigation_intake', 'under_review', '2026-02-28 11:30:00', null, null,
    JSON.stringify({ case_type: 'Breach of Contract', opposing_party: 'Meridian Supply Chain LLC', amount_in_controversy: '$2.3M', prior_litigation: true, urgency: 'high', statute_of_limitations: '2026-06-15' }),
    JSON.stringify(['Potential conflict with existing client', 'SOL approaching — 3.5 months']), 'On hold pending conflict resolution.'],

  // Jasmine Torres — not yet submitted
  [8, 'nonprofit_intake', 'pending', '2026-03-01 10:15:00', null, null,
    JSON.stringify({ org_type: '501(c)(3)', mission: 'Environmental education for underserved communities', board_size: 5, annual_budget: '$250K', existing_entity: false }),
    null, 'Awaiting board member information.'],
];

for (const f of forms) {
  insertForm.run(...f);
}

// ============================================================
// CONFLICT CHECKS
// ============================================================
const insertConflict = db.prepare(`
  INSERT INTO conflict_checks (client_id, checked_by, checked_at, status, conflicts_found, conflicting_parties, conflicting_matters, resolution, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const conflicts = [
  // Marcus Chen — clear
  [1, 'Lisa Tran (Paralegal)', '2026-01-16 14:00:00', 'cleared', 0, null, null, null, 'Full system search completed. No conflicts.'],

  // Diana Reyes — clear
  [2, 'Lisa Tran (Paralegal)', '2026-01-21 11:00:00', 'cleared', 0, null, null, null, 'No conflicts found.'],

  // Robert Okafor — clear with note
  [3, 'Lisa Tran (Paralegal)', '2026-02-02 14:00:00', 'cleared', 0, null, null, null, 'Note: Morrison Group (declined client) had opposing interest but was never engaged. No conflict.'],

  // Priya Sharma — pending
  [4, 'Lisa Tran (Paralegal)', '2026-02-19 09:00:00', 'pending', 0, null, null, null, 'Initial search shows no direct conflicts. Waiting on full corporate entity search.'],

  // Thomas Brennan — cleared
  [5, 'Lisa Tran (Paralegal)', '2026-02-23 10:00:00', 'cleared', 0, null, null, null, 'Property seller (Figueroa Holdings) not in our system. Clear.'],

  // Aisha Patel — cleared
  [6, 'Lisa Tran (Paralegal)', '2026-02-26 14:00:00', 'cleared', 0, null, null, null, 'No conflicts with any trademark registrants in portfolio.'],

  // Kevin Wu — CONFLICT FOUND
  [7, 'Lisa Tran (Paralegal)', '2026-03-01 09:00:00', 'conflict_found', 1,
    JSON.stringify(['Meridian Supply Chain LLC']),
    JSON.stringify(['Meridian is a vendor to Oakland Manufacturing Co (Client #3)']),
    null, 'Meridian Supply Chain is the opposing party AND a vendor to our existing client Oakland Mfg. Need ethics review.'],

  // Frank Morrison — conflict confirmed (declined)
  [11, 'Lisa Tran (Paralegal)', '2026-02-10 14:00:00', 'conflict_confirmed', 1,
    JSON.stringify(['Oakland Manufacturing Co']),
    JSON.stringify(['Morrison Group is plaintiff in pending action against Oakland Mfg']),
    'Client declined — cannot represent opposing party of existing client.',
    'Clear conflict. Matter declined per RPC 1.7.'],
];

for (const c of conflicts) {
  insertConflict.run(...c);
}

// ============================================================
// ENGAGEMENTS
// ============================================================
const insertEngagement = db.prepare(`
  INSERT INTO engagements (client_id, engagement_type, scope, fee_structure, retainer_amount, hourly_rate, flat_fee, status, sent_at, signed_at, expires_at, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const engagements = [
  // Marcus Chen — signed
  [1, 'Corporate Advisory', 'M&A due diligence and transaction support for Series B acquisition target.', 'retainer_plus_hourly', 25000, 450, null, 'signed', '2026-01-22 10:00:00', '2026-01-25 16:00:00', '2027-01-25', 'Annual engagement. Retainer covers 50 hours/quarter.'],

  // Diana Reyes — signed
  [2, 'Business Formation', 'LLC formation, operating agreement drafting, and initial regulatory filings.', 'flat_fee', null, null, 7500, 'signed', '2026-01-25 09:00:00', '2026-01-27 11:00:00', null, 'One-time engagement. Option to extend for ongoing counsel.'],

  // Robert Okafor — signed
  [3, 'Employment Advisory', 'Employee handbook review, policy updates, and EEOC claim response.', 'retainer_plus_hourly', 10000, 375, null, 'signed', '2026-02-05 10:00:00', '2026-02-08 09:00:00', '2026-08-08', '6-month engagement. Retainer covers handbook review; hourly for EEOC.'],

  // Aisha Patel — sent, awaiting signature
  [6, 'Intellectual Property', 'Trademark search, application filing, and prosecution for 12 marks. Madrid Protocol international filings.', 'flat_fee_phased', null, null, 36000, 'sent', '2026-02-27 10:00:00', null, '2026-03-13', 'Phased: $12K per batch of 4 marks. Expires in 14 days.'],

  // Priya Sharma — draft
  [4, 'Healthcare Regulatory', 'HIPAA compliance audit, BAA review, and multi-state telehealth regulatory analysis.', 'retainer_plus_hourly', 15000, 425, null, 'draft', null, null, null, 'Pending conflict check completion before sending.'],

  // Thomas Brennan — draft
  [5, 'Real Estate Transaction', 'Commercial property acquisition: due diligence, contract negotiation, environmental review, and closing.', 'hourly', null, 400, null, 'draft', null, null, null, 'Standard hourly. Estimate: $30K-$50K depending on environmental complexity.'],
];

for (const e of engagements) {
  insertEngagement.run(...e);
}

// ============================================================
// WORKFLOW STEPS
// ============================================================
const insertStep = db.prepare(`
  INSERT INTO workflow_steps (client_id, step_name, step_order, status, assigned_to, due_date, completed_at, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const workflows = [
  // Marcus Chen — fully completed
  [1, 'Initial Consultation', 1, 'completed', 'Sarah Whitfield', '2026-01-17', '2026-01-16 15:00:00', null],
  [1, 'Intake Form Review', 2, 'completed', 'Sarah Whitfield', '2026-01-18', '2026-01-16 10:30:00', null],
  [1, 'Conflict Check', 3, 'completed', 'Lisa Tran', '2026-01-19', '2026-01-16 14:30:00', null],
  [1, 'Engagement Letter', 4, 'completed', 'Sarah Whitfield', '2026-01-22', '2026-01-22 10:00:00', null],
  [1, 'Client Signs Engagement', 5, 'completed', 'Marcus Chen', '2026-01-25', '2026-01-25 16:00:00', null],
  [1, 'Collect Documents', 6, 'completed', 'Lisa Tran', '2026-01-27', '2026-01-26 11:00:00', null],
  [1, 'Open Matter in System', 7, 'completed', 'Lisa Tran', '2026-01-28', '2026-01-28 09:00:00', null],
  [1, 'Kickoff Meeting', 8, 'completed', 'Sarah Whitfield', '2026-01-30', '2026-01-28 14:00:00', null],

  // Priya Sharma — in progress (stuck at conflict check)
  [4, 'Initial Consultation', 1, 'completed', 'Maria Santos', '2026-02-19', '2026-02-18 11:00:00', null],
  [4, 'Intake Form Review', 2, 'in_progress', 'Maria Santos', '2026-02-20', null, 'Form submitted but not yet reviewed.'],
  [4, 'Conflict Check', 3, 'pending', 'Lisa Tran', '2026-02-21', null, 'Waiting on corporate entity search.'],
  [4, 'Engagement Letter', 4, 'pending', 'Maria Santos', '2026-02-24', null, null],
  [4, 'Client Signs Engagement', 5, 'pending', 'Priya Sharma', '2026-02-28', null, null],
  [4, 'Collect Documents', 6, 'pending', 'Lisa Tran', '2026-03-03', null, null],
  [4, 'Open Matter in System', 7, 'pending', 'Lisa Tran', '2026-03-04', null, null],
  [4, 'Kickoff Meeting', 8, 'pending', 'Maria Santos', '2026-03-06', null, null],

  // Thomas Brennan — early stages
  [5, 'Initial Consultation', 1, 'completed', 'James Park', '2026-02-23', '2026-02-22 15:00:00', null],
  [5, 'Intake Form Review', 2, 'completed', 'James Park', '2026-02-24', '2026-02-23 09:00:00', 'Environmental flag noted.'],
  [5, 'Conflict Check', 3, 'completed', 'Lisa Tran', '2026-02-24', '2026-02-23 10:00:00', null],
  [5, 'Engagement Letter', 4, 'in_progress', 'James Park', '2026-02-27', null, 'Drafting scope — need environmental review estimate.'],
  [5, 'Client Signs Engagement', 5, 'pending', 'Thomas Brennan', '2026-03-03', null, null],
  [5, 'Collect Documents', 6, 'pending', 'Lisa Tran', '2026-03-05', null, null],
  [5, 'Open Matter in System', 7, 'pending', 'Lisa Tran', '2026-03-06', null, null],
  [5, 'Kickoff Meeting', 8, 'pending', 'James Park', '2026-03-10', null, null],

  // Aisha Patel — engagement sent
  [6, 'Initial Consultation', 1, 'completed', 'Sarah Whitfield', '2026-02-26', '2026-02-25 10:00:00', null],
  [6, 'Intake Form Review', 2, 'completed', 'Sarah Whitfield', '2026-02-26', '2026-02-26 09:00:00', null],
  [6, 'Conflict Check', 3, 'completed', 'Lisa Tran', '2026-02-27', '2026-02-26 14:00:00', null],
  [6, 'Engagement Letter', 4, 'completed', 'Sarah Whitfield', '2026-02-27', '2026-02-27 10:00:00', null],
  [6, 'Client Signs Engagement', 5, 'in_progress', 'Aisha Patel', '2026-03-13', null, 'Sent Feb 27. Expires Mar 13. Follow up if not signed by Mar 7.'],
  [6, 'Collect Documents', 6, 'pending', 'Lisa Tran', '2026-03-15', null, null],
  [6, 'Open Matter in System', 7, 'pending', 'Lisa Tran', '2026-03-16', null, null],
  [6, 'Kickoff Meeting', 8, 'pending', 'Sarah Whitfield', '2026-03-18', null, null],

  // Kevin Wu — blocked at conflict
  [7, 'Initial Consultation', 1, 'completed', 'Maria Santos', '2026-03-01', '2026-02-28 12:00:00', null],
  [7, 'Intake Form Review', 2, 'completed', 'Maria Santos', '2026-03-01', '2026-03-01 09:00:00', 'SOL flag: June 15, 2026'],
  [7, 'Conflict Check', 3, 'blocked', 'Lisa Tran', '2026-03-02', null, 'CONFLICT FOUND — Meridian is vendor to Oakland Mfg. Ethics review required.'],
  [7, 'Engagement Letter', 4, 'pending', 'Maria Santos', null, null, 'Blocked until conflict resolved.'],
  [7, 'Client Signs Engagement', 5, 'pending', 'Kevin Wu', null, null, null],
  [7, 'Collect Documents', 6, 'pending', 'Lisa Tran', null, null, null],
  [7, 'Open Matter in System', 7, 'pending', 'Lisa Tran', null, null, null],
  [7, 'Kickoff Meeting', 8, 'pending', 'Maria Santos', null, null, null],
];

for (const w of workflows) {
  insertStep.run(...w);
}

// ============================================================
// DOCUMENTS COLLECTED
// ============================================================
const insertDoc = db.prepare(`
  INSERT INTO documents (client_id, doc_type, filename, status, uploaded_at, reviewed_at, reviewed_by, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const docs = [
  // Marcus Chen — all collected
  [1, 'corporate_formation', 'vertex_cert_of_incorporation.pdf', 'reviewed', '2026-01-26 09:00:00', '2026-01-27 10:00:00', 'Sarah Whitfield', null],
  [1, 'corporate_bylaws', 'vertex_bylaws_amended_2024.pdf', 'reviewed', '2026-01-26 09:00:00', '2026-01-27 10:30:00', 'Sarah Whitfield', null],
  [1, 'financial_statement', 'vertex_2025_audited_financials.pdf', 'reviewed', '2026-01-26 09:30:00', '2026-01-27 11:00:00', 'Sarah Whitfield', null],
  [1, 'cap_table', 'vertex_cap_table_current.xlsx', 'reviewed', '2026-01-26 09:30:00', '2026-01-27 11:30:00', 'Sarah Whitfield', null],
  [1, 'prior_agreement', 'vertex_series_a_docs.pdf', 'reviewed', '2026-01-26 10:00:00', '2026-01-27 14:00:00', 'Sarah Whitfield', null],

  // Diana Reyes — all collected
  [2, 'identification', 'reyes_drivers_license.pdf', 'reviewed', '2026-01-28 09:00:00', '2026-01-28 10:00:00', 'James Park', null],
  [2, 'business_plan', 'solar_horizon_business_plan.pdf', 'reviewed', '2026-01-28 09:00:00', '2026-01-28 11:00:00', 'James Park', null],

  // Robert Okafor
  [3, 'employee_handbook', 'oakland_mfg_handbook_2023.pdf', 'reviewed', '2026-02-09 09:00:00', '2026-02-10 10:00:00', 'Sarah Whitfield', 'Outdated — needs significant revision.'],
  [3, 'eeoc_complaint', 'eeoc_charge_2026_01.pdf', 'reviewed', '2026-02-09 09:00:00', '2026-02-10 11:00:00', 'Sarah Whitfield', 'Discrimination claim. Response deadline March 15.'],
  [3, 'policy_docs', 'oakland_remote_work_policy.pdf', 'pending_review', '2026-02-09 09:30:00', null, null, 'Remote work policy for 30 employees in 3 states.'],

  // Thomas Brennan
  [5, 'purchase_agreement', 'figueroa_purchase_agreement_draft.pdf', 'pending_review', '2026-02-23 16:00:00', null, null, 'Seller\'s draft. Needs review.'],
  [5, 'property_appraisal', 'figueroa_appraisal_2026.pdf', 'pending_review', '2026-02-24 09:00:00', null, null, null],
  [5, 'environmental_report', 'figueroa_phase1_esa.pdf', 'flagged', '2026-02-24 09:30:00', null, null, 'Phase I shows potential contamination from prior dry cleaning tenant. Phase II recommended.'],

  // Aisha Patel
  [6, 'trademark_list', 'culture_collective_mark_list.xlsx', 'reviewed', '2026-02-26 15:00:00', '2026-02-27 09:00:00', 'Sarah Whitfield', '12 marks across 3 classes.'],
  [6, 'existing_registrations', 'culture_collective_reg_certificates.pdf', 'reviewed', '2026-02-26 15:00:00', '2026-02-27 09:30:00', 'Sarah Whitfield', '3 existing US registrations. All current.'],
];

for (const d of docs) {
  insertDoc.run(...d);
}

console.log('Seeded: 12 clients, 8 intake forms, 8 conflict checks, 6 engagements, 40 workflow steps, 15 documents');
