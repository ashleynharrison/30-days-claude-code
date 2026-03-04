import { initDb } from './database.js';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Remove old DB if exists
const dbPath = path.join(dataDir, 'documents.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = initDb();

// ═══════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════

interface Doc {
  title: string;
  doc_type: string;
  status: string;
  file_name: string;
  upload_date: string;
  effective_date: string | null;
  expiration_date: string | null;
  total_pages: number;
  summary: string;
}

const documents: Doc[] = [
  {
    title: 'Master Services Agreement — Vertex Solutions & Pinnacle Corp',
    doc_type: 'msa',
    status: 'active',
    file_name: 'vertex-pinnacle-msa-2025.pdf',
    upload_date: '2025-11-15',
    effective_date: '2025-12-01',
    expiration_date: '2027-11-30',
    total_pages: 18,
    summary: 'Two-year MSA for software development and consulting services. Vertex Solutions provides development resources to Pinnacle Corp at blended rates with quarterly SOW cycles.'
  },
  {
    title: 'Non-Disclosure Agreement — Meridian Health & DataSync Labs',
    doc_type: 'nda',
    status: 'active',
    file_name: 'meridian-datasync-nda.pdf',
    upload_date: '2026-01-08',
    effective_date: '2026-01-10',
    expiration_date: '2029-01-10',
    total_pages: 6,
    summary: 'Mutual NDA covering patient data integration project. Three-year term with automatic renewal. Includes HIPAA compliance requirements and data destruction obligations.'
  },
  {
    title: 'Commercial Lease — 450 Spring Street, Suite 800',
    doc_type: 'lease',
    status: 'active',
    file_name: 'spring-street-lease-2024.pdf',
    upload_date: '2024-06-20',
    effective_date: '2024-08-01',
    expiration_date: '2029-07-31',
    total_pages: 34,
    summary: 'Five-year commercial office lease in downtown Los Angeles. Tenant: Cascade Digital Agency. Landlord: Spring Street Properties LLC. 4,200 sq ft with 3% annual escalation.'
  },
  {
    title: 'Software License Agreement — CloudVault Enterprise',
    doc_type: 'license',
    status: 'active',
    file_name: 'cloudvault-enterprise-license.pdf',
    upload_date: '2025-09-01',
    effective_date: '2025-10-01',
    expiration_date: '2026-09-30',
    total_pages: 12,
    summary: 'Annual enterprise license for CloudVault storage and backup platform. 500-seat license with 99.9% uptime SLA. Includes premium support and API access.'
  },
  {
    title: 'Employment Agreement — Sarah Chen, VP of Engineering',
    doc_type: 'employment',
    status: 'active',
    file_name: 'chen-employment-agreement.pdf',
    upload_date: '2025-08-15',
    effective_date: '2025-09-01',
    expiration_date: null,
    total_pages: 8,
    summary: 'At-will employment agreement for VP of Engineering. Base salary $285,000 with 25% bonus target. Includes equity grant of 50,000 options vesting over 4 years with 1-year cliff.'
  },
  {
    title: 'Independent Contractor Agreement — Rivera Design Studio',
    doc_type: 'contractor',
    status: 'active',
    file_name: 'rivera-design-contractor.pdf',
    upload_date: '2026-02-01',
    effective_date: '2026-02-15',
    expiration_date: '2026-08-15',
    total_pages: 10,
    summary: 'Six-month contractor agreement for brand redesign project. Fixed fee of $48,000 paid in three milestones. Includes IP assignment and non-compete for competing agencies.'
  },
  {
    title: 'Partnership Agreement — Atlas Ventures & Beacon Capital',
    doc_type: 'partnership',
    status: 'active',
    file_name: 'atlas-beacon-partnership.pdf',
    upload_date: '2025-05-10',
    effective_date: '2025-06-01',
    expiration_date: null,
    total_pages: 22,
    summary: 'Joint venture partnership for commercial real estate fund. 60/40 profit split (Atlas/Beacon). $50M initial capital commitment with 7-year fund life. Atlas manages operations, Beacon provides capital.'
  },
  {
    title: 'Vendor Agreement — Pacific Catering Services',
    doc_type: 'vendor',
    status: 'expired',
    file_name: 'pacific-catering-vendor.pdf',
    upload_date: '2024-03-01',
    effective_date: '2024-04-01',
    expiration_date: '2025-03-31',
    total_pages: 7,
    summary: 'One-year catering services agreement for corporate events. Monthly retainer of $3,500 plus per-event fees. Contract expired without renewal — vendor failed to meet dietary compliance requirements twice.'
  },
  {
    title: 'Settlement Agreement — Donovan v. Apex Technologies',
    doc_type: 'settlement',
    status: 'executed',
    file_name: 'donovan-apex-settlement.pdf',
    upload_date: '2026-01-20',
    effective_date: '2026-02-01',
    expiration_date: null,
    total_pages: 14,
    summary: 'Settlement of wrongful termination claim. Apex pays $175,000 in two installments. Mutual release of claims, non-disparagement clause, and confidentiality of terms.'
  },
  {
    title: 'Data Processing Agreement — Meridian Health & CloudVault',
    doc_type: 'dpa',
    status: 'under_review',
    file_name: 'meridian-cloudvault-dpa-draft.pdf',
    upload_date: '2026-02-25',
    effective_date: null,
    expiration_date: null,
    total_pages: 16,
    summary: 'Draft DPA for HIPAA-compliant data processing. CloudVault as processor for Meridian patient records. Includes data residency requirements, breach notification timelines, and sub-processor restrictions.'
  }
];

const insertDoc = db.prepare(`
  INSERT INTO documents (title, doc_type, status, file_name, upload_date, effective_date, expiration_date, total_pages, summary)
  VALUES (@title, @doc_type, @status, @file_name, @upload_date, @effective_date, @expiration_date, @total_pages, @summary)
`);

for (const doc of documents) {
  insertDoc.run(doc);
}

// ═══════════════════════════════════════
// PARTIES
// ═══════════════════════════════════════

interface Party {
  document_id: number;
  name: string;
  role: string;
  entity_type: string;
  contact_email: string | null;
}

const parties: Party[] = [
  // MSA (doc 1)
  { document_id: 1, name: 'Vertex Solutions Inc.', role: 'service_provider', entity_type: 'corporation', contact_email: 'legal@vertexsolutions.com' },
  { document_id: 1, name: 'Pinnacle Corp', role: 'client', entity_type: 'corporation', contact_email: 'contracts@pinnaclecorp.com' },
  // NDA (doc 2)
  { document_id: 2, name: 'Meridian Health Systems', role: 'disclosing_party', entity_type: 'corporation', contact_email: 'compliance@meridianhealth.com' },
  { document_id: 2, name: 'DataSync Labs LLC', role: 'receiving_party', entity_type: 'llc', contact_email: 'legal@datasynclabs.com' },
  // Lease (doc 3)
  { document_id: 3, name: 'Spring Street Properties LLC', role: 'landlord', entity_type: 'llc', contact_email: 'leasing@springstreetprops.com' },
  { document_id: 3, name: 'Cascade Digital Agency Inc.', role: 'tenant', entity_type: 'corporation', contact_email: 'ops@cascadedigital.com' },
  // License (doc 4)
  { document_id: 4, name: 'CloudVault Technologies Inc.', role: 'licensor', entity_type: 'corporation', contact_email: 'enterprise@cloudvault.io' },
  { document_id: 4, name: 'Cascade Digital Agency Inc.', role: 'licensee', entity_type: 'corporation', contact_email: 'ops@cascadedigital.com' },
  // Employment (doc 5)
  { document_id: 5, name: 'Cascade Digital Agency Inc.', role: 'employer', entity_type: 'corporation', contact_email: 'hr@cascadedigital.com' },
  { document_id: 5, name: 'Sarah Chen', role: 'employee', entity_type: 'individual', contact_email: 'sarah.chen@cascadedigital.com' },
  // Contractor (doc 6)
  { document_id: 6, name: 'Cascade Digital Agency Inc.', role: 'client', entity_type: 'corporation', contact_email: 'ops@cascadedigital.com' },
  { document_id: 6, name: 'Rivera Design Studio LLC', role: 'contractor', entity_type: 'llc', contact_email: 'maria@riveradesign.co' },
  // Partnership (doc 7)
  { document_id: 7, name: 'Atlas Ventures GP LLC', role: 'managing_partner', entity_type: 'llc', contact_email: 'fund@atlasventures.com' },
  { document_id: 7, name: 'Beacon Capital Partners', role: 'limited_partner', entity_type: 'lp', contact_email: 'investments@beaconcap.com' },
  // Vendor (doc 8)
  { document_id: 8, name: 'Pacific Catering Services', role: 'vendor', entity_type: 'sole_proprietorship', contact_email: 'info@pacificcatering.com' },
  { document_id: 8, name: 'Cascade Digital Agency Inc.', role: 'client', entity_type: 'corporation', contact_email: 'ops@cascadedigital.com' },
  // Settlement (doc 9)
  { document_id: 9, name: 'James Donovan', role: 'plaintiff', entity_type: 'individual', contact_email: null },
  { document_id: 9, name: 'Apex Technologies Inc.', role: 'defendant', entity_type: 'corporation', contact_email: 'legal@apextech.com' },
  // DPA (doc 10)
  { document_id: 10, name: 'Meridian Health Systems', role: 'data_controller', entity_type: 'corporation', contact_email: 'compliance@meridianhealth.com' },
  { document_id: 10, name: 'CloudVault Technologies Inc.', role: 'data_processor', entity_type: 'corporation', contact_email: 'dpo@cloudvault.io' },
];

const insertParty = db.prepare(`
  INSERT INTO parties (document_id, name, role, entity_type, contact_email)
  VALUES (@document_id, @name, @role, @entity_type, @contact_email)
`);

for (const p of parties) {
  insertParty.run(p);
}

// ═══════════════════════════════════════
// KEY DATES
// ═══════════════════════════════════════

interface KeyDate {
  document_id: number;
  label: string;
  date: string;
  is_deadline: number;
  notes: string | null;
}

const keyDates: KeyDate[] = [
  // MSA
  { document_id: 1, label: 'Effective Date', date: '2025-12-01', is_deadline: 0, notes: null },
  { document_id: 1, label: 'First SOW Due', date: '2026-01-15', is_deadline: 1, notes: 'Initial statement of work must be signed within 45 days' },
  { document_id: 1, label: 'Annual Rate Review', date: '2026-12-01', is_deadline: 1, notes: 'Rate adjustments capped at 5% annually' },
  { document_id: 1, label: 'Expiration', date: '2027-11-30', is_deadline: 1, notes: '90-day renewal notice required' },
  // NDA
  { document_id: 2, label: 'Effective Date', date: '2026-01-10', is_deadline: 0, notes: null },
  { document_id: 2, label: 'Annual Compliance Audit', date: '2027-01-10', is_deadline: 1, notes: 'Both parties must certify compliance annually' },
  { document_id: 2, label: 'Expiration', date: '2029-01-10', is_deadline: 1, notes: 'Data destruction within 30 days of expiration' },
  // Lease
  { document_id: 3, label: 'Lease Commencement', date: '2024-08-01', is_deadline: 0, notes: null },
  { document_id: 3, label: 'First Rent Escalation', date: '2025-08-01', is_deadline: 0, notes: '3% annual increase' },
  { document_id: 3, label: 'Option to Renew Deadline', date: '2029-01-31', is_deadline: 1, notes: 'Must provide 6 months written notice to exercise 3-year renewal option' },
  { document_id: 3, label: 'Lease Expiration', date: '2029-07-31', is_deadline: 1, notes: null },
  // License
  { document_id: 4, label: 'License Start', date: '2025-10-01', is_deadline: 0, notes: null },
  { document_id: 4, label: 'Auto-Renewal Notice Deadline', date: '2026-06-30', is_deadline: 1, notes: '90-day cancellation notice required or auto-renews at 8% increase' },
  { document_id: 4, label: 'License Expiration', date: '2026-09-30', is_deadline: 1, notes: null },
  // Employment
  { document_id: 5, label: 'Start Date', date: '2025-09-01', is_deadline: 0, notes: null },
  { document_id: 5, label: 'Cliff Vesting Date', date: '2026-09-01', is_deadline: 1, notes: '25% of options vest after 1-year cliff' },
  { document_id: 5, label: 'First Performance Review', date: '2026-03-01', is_deadline: 1, notes: '6-month review determines bonus eligibility' },
  // Contractor
  { document_id: 6, label: 'Project Start', date: '2026-02-15', is_deadline: 0, notes: null },
  { document_id: 6, label: 'Milestone 1 — Discovery Deliverable', date: '2026-03-31', is_deadline: 1, notes: '$16,000 payment upon acceptance' },
  { document_id: 6, label: 'Milestone 2 — Design System', date: '2026-05-31', is_deadline: 1, notes: '$16,000 payment upon acceptance' },
  { document_id: 6, label: 'Milestone 3 — Final Delivery', date: '2026-08-15', is_deadline: 1, notes: '$16,000 payment upon acceptance' },
  // Partnership
  { document_id: 7, label: 'Partnership Effective Date', date: '2025-06-01', is_deadline: 0, notes: null },
  { document_id: 7, label: 'Initial Capital Call', date: '2025-07-01', is_deadline: 1, notes: '$25M from each partner' },
  { document_id: 7, label: 'First Distribution Target', date: '2026-06-01', is_deadline: 0, notes: 'Annual distributions begin Year 2' },
  { document_id: 7, label: 'Fund Termination', date: '2032-06-01', is_deadline: 1, notes: '7-year fund life with 2-year extension option' },
  // Vendor
  { document_id: 8, label: 'Contract Start', date: '2024-04-01', is_deadline: 0, notes: null },
  { document_id: 8, label: 'Contract Expiration', date: '2025-03-31', is_deadline: 1, notes: 'Expired — not renewed due to compliance issues' },
  // Settlement
  { document_id: 9, label: 'Settlement Effective Date', date: '2026-02-01', is_deadline: 0, notes: null },
  { document_id: 9, label: 'First Payment Due', date: '2026-03-01', is_deadline: 1, notes: '$100,000 first installment' },
  { document_id: 9, label: 'Second Payment Due', date: '2026-06-01', is_deadline: 1, notes: '$75,000 final installment' },
  // DPA
  { document_id: 10, label: 'Target Signature Date', date: '2026-03-15', is_deadline: 1, notes: 'Legal review must complete by this date' },
];

const insertDate = db.prepare(`
  INSERT INTO key_dates (document_id, label, date, is_deadline, notes)
  VALUES (@document_id, @label, @date, @is_deadline, @notes)
`);

for (const d of keyDates) {
  insertDate.run(d);
}

// ═══════════════════════════════════════
// OBLIGATIONS
// ═══════════════════════════════════════

interface Obligation {
  document_id: number;
  party_name: string;
  description: string;
  obligation_type: string;
  section_ref: string;
  status: string;
  due_date: string | null;
}

const obligations: Obligation[] = [
  // MSA
  { document_id: 1, party_name: 'Vertex Solutions Inc.', description: 'Deliver qualified developers within 15 business days of SOW execution', obligation_type: 'performance', section_ref: '§4.2', status: 'active', due_date: null },
  { document_id: 1, party_name: 'Vertex Solutions Inc.', description: 'Maintain $2M professional liability insurance throughout term', obligation_type: 'insurance', section_ref: '§9.1', status: 'active', due_date: null },
  { document_id: 1, party_name: 'Pinnacle Corp', description: 'Pay invoices within 30 days of receipt (Net 30)', obligation_type: 'payment', section_ref: '§5.3', status: 'active', due_date: null },
  { document_id: 1, party_name: 'Pinnacle Corp', description: 'Provide system access and documentation within 10 days of SOW start', obligation_type: 'cooperation', section_ref: '§4.5', status: 'active', due_date: null },
  // NDA
  { document_id: 2, party_name: 'DataSync Labs LLC', description: 'Encrypt all confidential data at rest (AES-256) and in transit (TLS 1.3)', obligation_type: 'security', section_ref: '§3.2', status: 'active', due_date: null },
  { document_id: 2, party_name: 'Both Parties', description: 'Certify HIPAA compliance annually and provide audit reports upon request', obligation_type: 'compliance', section_ref: '§5.1', status: 'active', due_date: '2027-01-10' },
  { document_id: 2, party_name: 'Both Parties', description: 'Destroy or return all confidential materials within 30 days of termination', obligation_type: 'data_handling', section_ref: '§7.3', status: 'active', due_date: null },
  // Lease
  { document_id: 3, party_name: 'Cascade Digital Agency Inc.', description: 'Pay monthly rent of $18,900 by the 1st of each month', obligation_type: 'payment', section_ref: '§3.1', status: 'active', due_date: null },
  { document_id: 3, party_name: 'Cascade Digital Agency Inc.', description: 'Maintain general liability insurance of $1M and name landlord as additional insured', obligation_type: 'insurance', section_ref: '§8.2', status: 'active', due_date: null },
  { document_id: 3, party_name: 'Spring Street Properties LLC', description: 'Maintain building HVAC, elevator, and common area facilities', obligation_type: 'maintenance', section_ref: '§6.1', status: 'active', due_date: null },
  // License
  { document_id: 4, party_name: 'CloudVault Technologies Inc.', description: 'Maintain 99.9% platform uptime measured monthly', obligation_type: 'sla', section_ref: '§4.1', status: 'active', due_date: null },
  { document_id: 4, party_name: 'CloudVault Technologies Inc.', description: 'Respond to Severity 1 incidents within 1 hour', obligation_type: 'support', section_ref: '§4.3', status: 'active', due_date: null },
  { document_id: 4, party_name: 'Cascade Digital Agency Inc.', description: 'Not exceed 500-seat license or sublicense to third parties', obligation_type: 'usage_restriction', section_ref: '§2.4', status: 'active', due_date: null },
  // Employment
  { document_id: 5, party_name: 'Sarah Chen', description: 'Non-compete: Cannot work for competing agency within 50 miles for 18 months post-departure', obligation_type: 'non_compete', section_ref: '§10.2', status: 'active', due_date: null },
  { document_id: 5, party_name: 'Sarah Chen', description: 'Non-solicitation: Cannot recruit employees or solicit clients for 24 months', obligation_type: 'non_solicitation', section_ref: '§10.3', status: 'active', due_date: null },
  { document_id: 5, party_name: 'Cascade Digital Agency Inc.', description: 'Provide equity grant documentation within 30 days of start date', obligation_type: 'compensation', section_ref: '§6.2', status: 'completed', due_date: '2025-10-01' },
  // Contractor
  { document_id: 6, party_name: 'Rivera Design Studio LLC', description: 'Assign all intellectual property created during engagement to client', obligation_type: 'ip_assignment', section_ref: '§7.1', status: 'active', due_date: null },
  { document_id: 6, party_name: 'Cascade Digital Agency Inc.', description: 'Pay milestone within 15 days of deliverable acceptance', obligation_type: 'payment', section_ref: '§4.2', status: 'active', due_date: null },
  { document_id: 6, party_name: 'Rivera Design Studio LLC', description: 'Not provide competing brand design services during contract term', obligation_type: 'non_compete', section_ref: '§8.1', status: 'active', due_date: null },
  // Partnership
  { document_id: 7, party_name: 'Atlas Ventures GP LLC', description: 'Provide quarterly financial reports and annual audited statements', obligation_type: 'reporting', section_ref: '§6.4', status: 'active', due_date: null },
  { document_id: 7, party_name: 'Beacon Capital Partners', description: 'Fund capital calls within 30 days of notice', obligation_type: 'capital', section_ref: '§3.2', status: 'active', due_date: null },
  // Settlement
  { document_id: 9, party_name: 'Apex Technologies Inc.', description: 'Pay $100,000 first installment by March 1, 2026', obligation_type: 'payment', section_ref: '§2.1', status: 'active', due_date: '2026-03-01' },
  { document_id: 9, party_name: 'Apex Technologies Inc.', description: 'Pay $75,000 final installment by June 1, 2026', obligation_type: 'payment', section_ref: '§2.2', status: 'active', due_date: '2026-06-01' },
  { document_id: 9, party_name: 'Both Parties', description: 'Not disparage the other party publicly or to business contacts', obligation_type: 'non_disparagement', section_ref: '§5.1', status: 'active', due_date: null },
  // DPA
  { document_id: 10, party_name: 'CloudVault Technologies Inc.', description: 'Process personal data only on documented instructions from controller', obligation_type: 'data_handling', section_ref: '§3.1', status: 'pending', due_date: null },
  { document_id: 10, party_name: 'CloudVault Technologies Inc.', description: 'Notify controller of data breach within 24 hours of discovery', obligation_type: 'breach_notification', section_ref: '§6.1', status: 'pending', due_date: null },
];

const insertObligation = db.prepare(`
  INSERT INTO obligations (document_id, party_name, description, obligation_type, section_ref, status, due_date)
  VALUES (@document_id, @party_name, @description, @obligation_type, @section_ref, @status, @due_date)
`);

for (const o of obligations) {
  insertObligation.run(o);
}

// ═══════════════════════════════════════
// CLAUSES
// ═══════════════════════════════════════

interface Clause {
  document_id: number;
  clause_type: string;
  section_ref: string;
  title: string;
  summary: string;
  full_text: string | null;
  risk_level: string;
}

const clauses: Clause[] = [
  // MSA
  { document_id: 1, clause_type: 'termination', section_ref: '§11.1', title: 'Termination for Convenience', summary: 'Either party may terminate with 60 days written notice. Client pays for work completed plus approved expenses.', full_text: null, risk_level: 'low' },
  { document_id: 1, clause_type: 'indemnification', section_ref: '§8.1', title: 'Mutual Indemnification', summary: 'Each party indemnifies the other for third-party claims arising from breach, negligence, or IP infringement.', full_text: null, risk_level: 'medium' },
  { document_id: 1, clause_type: 'limitation_of_liability', section_ref: '§8.3', title: 'Liability Cap', summary: 'Total liability capped at fees paid in the 12 months preceding the claim. Excludes IP infringement and gross negligence.', full_text: null, risk_level: 'medium' },
  { document_id: 1, clause_type: 'ip_ownership', section_ref: '§7.1', title: 'Work Product Ownership', summary: 'Client owns all deliverables. Provider retains rights to pre-existing tools and methodologies used in delivery.', full_text: null, risk_level: 'low' },
  // NDA
  { document_id: 2, clause_type: 'confidentiality', section_ref: '§2.1', title: 'Definition of Confidential Information', summary: 'Includes patient data, algorithms, business plans, and technical specifications. Excludes publicly available info.', full_text: null, risk_level: 'low' },
  { document_id: 2, clause_type: 'data_protection', section_ref: '§3.4', title: 'HIPAA Compliance', summary: 'All shared data must be handled per HIPAA requirements. BAA must be executed before any PHI transfer.', full_text: null, risk_level: 'high' },
  { document_id: 2, clause_type: 'remedies', section_ref: '§6.1', title: 'Injunctive Relief', summary: 'Breach may cause irreparable harm; disclosing party entitled to injunctive relief without posting bond.', full_text: null, risk_level: 'medium' },
  // Lease
  { document_id: 3, clause_type: 'rent_escalation', section_ref: '§3.3', title: 'Annual Rent Increase', summary: '3% annual escalation on base rent. First increase August 1, 2025.', full_text: null, risk_level: 'low' },
  { document_id: 3, clause_type: 'assignment', section_ref: '§12.1', title: 'Assignment and Subletting', summary: 'Tenant may not assign or sublet without landlord written consent, not to be unreasonably withheld.', full_text: null, risk_level: 'medium' },
  { document_id: 3, clause_type: 'termination', section_ref: '§14.2', title: 'Early Termination', summary: 'No early termination clause. Tenant liable for remaining rent if vacated early. Landlord has duty to mitigate.', full_text: null, risk_level: 'high' },
  { document_id: 3, clause_type: 'personal_guarantee', section_ref: '§15.1', title: 'Personal Guarantee', summary: 'CEO must personally guarantee first 2 years of rent ($453,600 total exposure).', full_text: null, risk_level: 'high' },
  // License
  { document_id: 4, clause_type: 'auto_renewal', section_ref: '§10.1', title: 'Auto-Renewal', summary: 'License auto-renews annually at an 8% price increase unless cancelled with 90 days notice.', full_text: null, risk_level: 'high' },
  { document_id: 4, clause_type: 'sla', section_ref: '§4.1', title: 'Uptime SLA', summary: '99.9% monthly uptime. Service credits of 5% per 0.1% below target. Capped at 30% of monthly fee.', full_text: null, risk_level: 'medium' },
  { document_id: 4, clause_type: 'data_portability', section_ref: '§11.3', title: 'Data Export on Termination', summary: 'Provider will make data available for export for 30 days after termination. After that, data is deleted.', full_text: null, risk_level: 'medium' },
  // Employment
  { document_id: 5, clause_type: 'non_compete', section_ref: '§10.2', title: 'Non-Compete', summary: '18-month non-compete within 50-mile radius for competing digital agencies. Broad definition of "competing."', full_text: null, risk_level: 'high' },
  { document_id: 5, clause_type: 'change_of_control', section_ref: '§6.5', title: 'Acceleration on Change of Control', summary: '50% of unvested options accelerate if company is acquired within 2 years of hire.', full_text: null, risk_level: 'medium' },
  { document_id: 5, clause_type: 'termination', section_ref: '§9.1', title: 'Severance', summary: '6 months base salary severance if terminated without cause. Requires signing release.', full_text: null, risk_level: 'low' },
  // Contractor
  { document_id: 6, clause_type: 'ip_assignment', section_ref: '§7.1', title: 'IP Assignment', summary: 'All work product and IP created during engagement is assigned to client upon payment. Includes source files.', full_text: null, risk_level: 'low' },
  { document_id: 6, clause_type: 'termination', section_ref: '§9.1', title: 'Termination for Convenience', summary: 'Client may terminate with 14 days notice. Must pay for completed milestones plus 25% of current milestone.', full_text: null, risk_level: 'medium' },
  // Partnership
  { document_id: 7, clause_type: 'profit_distribution', section_ref: '§5.1', title: 'Profit Split', summary: '60/40 split (Atlas/Beacon) after 8% preferred return to Beacon. Carried interest of 20% to Atlas above hurdle.', full_text: null, risk_level: 'medium' },
  { document_id: 7, clause_type: 'dispute_resolution', section_ref: '§12.1', title: 'Arbitration', summary: 'All disputes resolved by binding arbitration in Los Angeles under JAMS rules. No jury trial.', full_text: null, risk_level: 'medium' },
  // Settlement
  { document_id: 9, clause_type: 'confidentiality', section_ref: '§4.1', title: 'Confidentiality of Terms', summary: 'Settlement amount and terms are confidential. Breach subjects violating party to liquidated damages of $50,000.', full_text: null, risk_level: 'high' },
  { document_id: 9, clause_type: 'release', section_ref: '§3.1', title: 'Mutual Release', summary: 'Full and final release of all claims arising from employment and termination. Excludes claims for breach of settlement itself.', full_text: null, risk_level: 'low' },
  // DPA
  { document_id: 10, clause_type: 'data_residency', section_ref: '§4.2', title: 'Data Residency', summary: 'All patient data must be stored in US-based data centers. No cross-border transfers without explicit consent.', full_text: null, risk_level: 'medium' },
  { document_id: 10, clause_type: 'sub_processor', section_ref: '§5.1', title: 'Sub-Processor Restrictions', summary: 'Processor must obtain prior written consent before engaging sub-processors. Must maintain updated sub-processor list.', full_text: null, risk_level: 'medium' },
];

const insertClause = db.prepare(`
  INSERT INTO clauses (document_id, clause_type, section_ref, title, summary, full_text, risk_level)
  VALUES (@document_id, @clause_type, @section_ref, @title, @summary, @full_text, @risk_level)
`);

for (const c of clauses) {
  insertClause.run(c);
}

// ═══════════════════════════════════════
// RED FLAGS
// ═══════════════════════════════════════

interface RedFlag {
  document_id: number;
  severity: string;
  category: string;
  description: string;
  section_ref: string;
  recommendation: string;
}

const redFlags: RedFlag[] = [
  // MSA
  { document_id: 1, severity: 'medium', category: 'payment_terms', description: 'No late payment penalty or interest clause. Client could delay payments without consequence.', section_ref: '§5.3', recommendation: 'Add 1.5% monthly interest on late payments and right to suspend services after 60 days overdue.' },
  // Lease
  { document_id: 3, severity: 'high', category: 'personal_liability', description: 'CEO personal guarantee for first 2 years of rent creates $453,600 personal exposure.', section_ref: '§15.1', recommendation: 'Negotiate reduction to 1 year or cap personal guarantee at 6 months rent.' },
  { document_id: 3, severity: 'high', category: 'early_termination', description: 'No early termination clause on a 5-year lease. Tenant liable for all remaining rent if vacated.', section_ref: '§14.2', recommendation: 'Add early termination option after Year 3 with 6-month penalty.' },
  { document_id: 3, severity: 'medium', category: 'cam_charges', description: 'CAM charges uncapped and calculated as proportionate share. No audit right for tenant.', section_ref: '§4.2', recommendation: 'Add 5% annual CAM increase cap and tenant audit right.' },
  // License
  { document_id: 4, severity: 'high', category: 'auto_renewal', description: 'Auto-renewal at 8% increase with 90-day cancellation window. Easy to miss and get locked in.', section_ref: '§10.1', recommendation: 'Set calendar reminder for June 1, 2026. Negotiate renewal cap to CPI or 3%.' },
  { document_id: 4, severity: 'medium', category: 'data_portability', description: 'Only 30 days to export data after termination. Complex migrations may need more time.', section_ref: '§11.3', recommendation: 'Negotiate 90-day data export window and machine-readable format requirement.' },
  // Employment
  { document_id: 5, severity: 'high', category: 'non_compete', description: '18-month non-compete with broad definition of "competing" could limit future employment options significantly.', section_ref: '§10.2', recommendation: 'Narrow definition to direct competitors only. Reduce radius or duration. Note: California generally does not enforce non-competes.' },
  { document_id: 5, severity: 'medium', category: 'ip_assignment', description: 'Broad IP assignment includes inventions conceived "in connection with" employment — may capture personal projects.', section_ref: '§7.1', recommendation: 'Add carve-out for personal projects developed outside work hours with no company resources.' },
  // Contractor
  { document_id: 6, severity: 'medium', category: 'scope_creep', description: 'No change order process defined. Scope changes could delay milestones without adjusting timeline or budget.', section_ref: '§3', recommendation: 'Add formal change order process with written approval and budget/timeline adjustment.' },
  // Partnership
  { document_id: 7, severity: 'medium', category: 'exit_rights', description: 'No clear buyout mechanism if one partner wants to exit before fund termination.', section_ref: '§11', recommendation: 'Add buyout clause with agreed valuation methodology (NAV-based or appraised).' },
  { document_id: 7, severity: 'medium', category: 'key_person', description: 'No key person clause. If Atlas founding partners leave, Beacon has no recourse.', section_ref: '§8', recommendation: 'Add key person provision that suspends investment period if named principals depart.' },
  // Settlement
  { document_id: 9, severity: 'high', category: 'liquidated_damages', description: '$50,000 liquidated damages for confidentiality breach may be challenged as penalty — disproportionate to likely harm.', section_ref: '§4.1', recommendation: 'Review enforceability. Consider reducing to $25,000 or tying to actual damages.' },
  // DPA
  { document_id: 10, severity: 'high', category: 'breach_notification', description: '24-hour breach notification window is extremely tight. Most frameworks allow 72 hours.', section_ref: '§6.1', recommendation: 'Align with HIPAA standard (60 days) or negotiate to 72 hours as reasonable compromise.' },
  { document_id: 10, severity: 'medium', category: 'liability', description: 'No limitation of liability clause in current draft. Processor has unlimited exposure.', section_ref: 'Missing', recommendation: 'Add liability cap tied to 12 months of fees paid under the agreement.' },
];

const insertFlag = db.prepare(`
  INSERT INTO red_flags (document_id, severity, category, description, section_ref, recommendation)
  VALUES (@document_id, @severity, @category, @description, @section_ref, @recommendation)
`);

for (const f of redFlags) {
  insertFlag.run(f);
}

console.log('✓ Seeded 10 documents');
console.log('✓ Seeded 20 parties');
console.log('✓ Seeded', keyDates.length, 'key dates');
console.log('✓ Seeded', obligations.length, 'obligations');
console.log('✓ Seeded', clauses.length, 'clauses');
console.log('✓ Seeded', redFlags.length, 'red flags');
console.log('\nDone. Database at', path.resolve(dataDir, 'documents.db'));
