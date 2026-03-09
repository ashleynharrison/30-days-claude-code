import db from './database.js';

// Clear existing data
db.exec(`
  DELETE FROM engagements;
  DELETE FROM pledges;
  DELETE FROM donations;
  DELETE FROM grants;
  DELETE FROM campaigns;
  DELETE FROM donors;
`);

// ── Donors ────────────────────────────────────────────────────
const insertDonor = db.prepare(`INSERT INTO donors (name, email, phone, type, giving_level, first_gift_date, total_given, largest_gift, gift_count, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const d1 = insertDonor.run('Margaret Chen', 'margaret.chen@email.com', '555-0101', 'individual', 'major', '2022-03-15', 25000, 10000, 8, 'active', 'Board member since 2023. Interested in education programs.').lastInsertRowid;
const d2 = insertDonor.run('James & Patricia Whitfield', 'whitfield.family@email.com', '555-0102', 'individual', 'major', '2021-06-01', 35000, 15000, 12, 'active', 'Annual gala sponsors. Prefer stock gifts.').lastInsertRowid;
const d3 = insertDonor.run('TechBridge Solutions', 'giving@techbridge.com', '555-0200', 'corporate', 'leadership', '2023-01-10', 50000, 25000, 4, 'active', 'Corporate match program. Contact: VP of Community Relations.').lastInsertRowid;
const d4 = insertDonor.run('Sandra Okonkwo', 'sandra.o@email.com', '555-0103', 'individual', 'general', '2024-11-20', 450, 250, 3, 'active', 'Came through the fall fundraiser email campaign.').lastInsertRowid;
const d5 = insertDonor.run('Robert Liu', 'r.liu@email.com', '555-0104', 'individual', 'mid_level', '2023-04-22', 3200, 1000, 6, 'active', 'Monthly donor. Passionate about youth mentorship.').lastInsertRowid;
const d6 = insertDonor.run('Greenleaf Foundation', 'grants@greenleaf.org', '555-0300', 'foundation', 'leadership', '2022-09-01', 75000, 40000, 3, 'active', 'Multi-year grant partner. Focus on environmental education.').lastInsertRowid;
const d7 = insertDonor.run('David Morales', 'd.morales@email.com', '555-0105', 'individual', 'general', '2024-01-05', 175, 100, 2, 'active', 'Peer-to-peer fundraising participant.').lastInsertRowid;
const d8 = insertDonor.run('Neighborhood Credit Union', 'community@ncu.org', '555-0201', 'corporate', 'mid_level', '2023-07-15', 8500, 5000, 3, 'active', 'Sponsors financial literacy workshops.').lastInsertRowid;
const d9 = insertDonor.run('Eleanor Vance', 'e.vance@email.com', '555-0106', 'individual', 'major', '2020-12-01', 42000, 20000, 15, 'lapsed', 'Last gift was December 2024. Was a monthly donor for 3 years.').lastInsertRowid;
const d10 = insertDonor.run('Apex Community Fund', 'info@apexfund.org', '555-0301', 'foundation', 'major', '2024-02-20', 30000, 30000, 1, 'active', 'First-time grantor. Capacity-building focus.').lastInsertRowid;
const d11 = insertDonor.run('Carlos & Maria Reyes', 'reyes.family@email.com', '555-0107', 'individual', 'general', '2025-03-01', 100, 100, 1, 'active', 'New donor from community event.').lastInsertRowid;
const d12 = insertDonor.run('Lisa Park', 'l.park@email.com', '555-0108', 'individual', 'mid_level', '2023-09-10', 4800, 2000, 5, 'active', 'Volunteer turned donor. Runs the Saturday tutoring program.').lastInsertRowid;
const d13 = insertDonor.run('Hartwell Industries', 'csr@hartwell.com', '555-0202', 'corporate', 'general', '2025-01-15', 2500, 2500, 1, 'active', 'Employee giving match. New corporate partner.').lastInsertRowid;
const d14 = insertDonor.run('The Morrison Trust', 'grants@morrisontrust.org', '555-0302', 'foundation', 'leadership', '2021-08-01', 120000, 50000, 5, 'active', 'Longest-standing foundation partner. Annual reporting required.').lastInsertRowid;
const d15 = insertDonor.run('Angela Foster', 'a.foster@email.com', '555-0109', 'individual', 'general', '2024-06-15', 350, 200, 3, 'lapsed', 'Last gift June 2024. Attended two events but no recent contact.').lastInsertRowid;

// ── Campaigns ────────────────────────────────────────────────────
const insertCampaign = db.prepare(`INSERT INTO campaigns (name, type, goal, raised, donor_count, start_date, end_date, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const c1 = insertCampaign.run('2026 Annual Fund', 'annual_fund', 200000, 87500, 42, '2026-01-01', '2026-12-31', 'active', 'Unrestricted operating support for all programs.').lastInsertRowid;
const c2 = insertCampaign.run('New Community Center Capital Campaign', 'capital', 500000, 215000, 18, '2025-06-01', '2027-06-01', 'active', 'Building a new 15,000 sq ft community center on Oak Street.').lastInsertRowid;
const c3 = insertCampaign.run('Spring Gala 2026', 'event', 75000, 0, 0, '2026-04-15', '2026-04-15', 'planning', 'Annual spring gala at the Grand Ballroom. 200 guests targeted.').lastInsertRowid;
const c4 = insertCampaign.run('Youth Mentorship Expansion', 'program', 45000, 28000, 15, '2025-09-01', '2026-08-31', 'active', 'Expanding from 3 schools to 7. Need 20 additional mentors.').lastInsertRowid;
const c5 = insertCampaign.run('2025 Annual Fund', 'annual_fund', 180000, 178500, 85, '2025-01-01', '2025-12-31', 'completed', 'Exceeded 99% of goal. Strong year-end giving.').lastInsertRowid;
const c6 = insertCampaign.run('GivingTuesday 2025', 'event', 25000, 31200, 127, '2025-12-02', '2025-12-02', 'completed', 'Exceeded goal by 25%. Best GivingTuesday performance ever.').lastInsertRowid;

// ── Donations ────────────────────────────────────────────────────
const insertDonation = db.prepare(`INSERT INTO donations (donor_id, campaign_id, amount, date, payment_method, designation, is_recurring, receipt_sent, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

// Margaret Chen - consistent major donor
insertDonation.run(d1, c5, 5000, '2025-03-15', 'check', 'Education Programs', 0, 1, 'Anniversary gift');
insertDonation.run(d1, c6, 2500, '2025-12-02', 'credit_card', 'Unrestricted', 0, 1, 'GivingTuesday match');
insertDonation.run(d1, c1, 5000, '2026-01-15', 'check', 'Education Programs', 0, 1, 'Annual pledge payment 1');
insertDonation.run(d1, c2, 10000, '2026-02-01', 'wire', 'Capital Campaign', 0, 1, 'Naming opportunity — Reading Room');

// Whitfield family - gala sponsors
insertDonation.run(d2, c5, 15000, '2025-04-20', 'stock', 'Gala Sponsorship', 0, 1, 'Table sponsor — Platinum level');
insertDonation.run(d2, c6, 5000, '2025-12-02', 'credit_card', 'Unrestricted', 0, 1, null);
insertDonation.run(d2, c1, 10000, '2026-02-15', 'stock', 'Unrestricted', 0, 1, 'Q1 stock gift');

// TechBridge - corporate
insertDonation.run(d3, c5, 25000, '2025-06-01', 'wire', 'Youth Technology', 0, 1, 'Annual corporate gift');
insertDonation.run(d3, c4, 15000, '2025-10-15', 'check', 'Youth Mentorship', 0, 1, 'Program-specific sponsorship');
insertDonation.run(d3, c1, 10000, '2026-01-10', 'wire', 'Youth Technology', 0, 1, '2026 commitment');

// Sandra - small donor, growing
insertDonation.run(d4, c6, 50, '2025-12-02', 'credit_card', 'Unrestricted', 0, 1, 'First gift');
insertDonation.run(d4, c1, 250, '2026-01-20', 'credit_card', 'Unrestricted', 1, 1, 'Started monthly giving $250/yr');
insertDonation.run(d4, c1, 150, '2026-03-01', 'credit_card', 'Youth Programs', 0, 1, null);

// Robert Liu - monthly donor
insertDonation.run(d5, c5, 100, '2025-04-01', 'credit_card', 'Youth Mentorship', 1, 1, 'Monthly');
insertDonation.run(d5, c5, 100, '2025-05-01', 'credit_card', 'Youth Mentorship', 1, 1, 'Monthly');
insertDonation.run(d5, c5, 100, '2025-06-01', 'credit_card', 'Youth Mentorship', 1, 1, 'Monthly');
insertDonation.run(d5, c4, 1000, '2025-09-15', 'check', 'Youth Mentorship', 0, 1, 'One-time boost for expansion');
insertDonation.run(d5, c1, 100, '2026-01-01', 'credit_card', 'Youth Mentorship', 1, 1, 'Monthly');
insertDonation.run(d5, c1, 100, '2026-02-01', 'credit_card', 'Youth Mentorship', 1, 1, 'Monthly');
insertDonation.run(d5, c1, 100, '2026-03-01', 'credit_card', 'Youth Mentorship', 1, 1, 'Monthly');

// Greenleaf Foundation - grant gifts
insertDonation.run(d6, c5, 35000, '2025-09-01', 'wire', 'Environmental Education', 0, 1, 'Year 2 of 3-year grant');
insertDonation.run(d6, c1, 40000, '2026-02-15', 'wire', 'Environmental Education', 0, 1, 'Year 3 of 3-year grant');

// David Morales - small / new
insertDonation.run(d7, c6, 75, '2025-12-02', 'credit_card', 'Unrestricted', 0, 1, 'P2P fundraiser referral');
insertDonation.run(d7, c1, 100, '2026-02-28', 'credit_card', 'Unrestricted', 0, 1, null);

// Neighborhood Credit Union
insertDonation.run(d8, c5, 3500, '2025-07-15', 'check', 'Financial Literacy', 0, 1, 'Workshop sponsorship');
insertDonation.run(d8, c1, 5000, '2026-01-15', 'check', 'Financial Literacy', 0, 1, '2026 sponsorship');

// Eleanor Vance - lapsed (gave in 2024 & 2025, not 2026)
insertDonation.run(d9, c5, 10000, '2025-03-01', 'credit_card', 'Unrestricted', 1, 1, 'Was monthly $833');
insertDonation.run(d9, c5, 10000, '2025-12-15', 'credit_card', 'Unrestricted', 0, 1, 'Year-end gift — last known gift');

// Apex Community Fund
insertDonation.run(d10, c4, 30000, '2025-02-20', 'wire', 'Capacity Building', 0, 1, 'First grant award');

// Carlos & Maria Reyes - brand new
insertDonation.run(d11, c1, 100, '2026-03-01', 'credit_card', 'Unrestricted', 0, 1, 'Community event signup');

// Lisa Park
insertDonation.run(d12, c5, 1000, '2025-04-10', 'credit_card', 'Youth Programs', 0, 1, null);
insertDonation.run(d12, c6, 500, '2025-12-02', 'credit_card', 'Unrestricted', 0, 1, null);
insertDonation.run(d12, c4, 2000, '2025-11-01', 'check', 'Youth Mentorship', 0, 1, 'Dedicated to Saturday tutoring');
insertDonation.run(d12, c1, 1000, '2026-02-10', 'credit_card', 'Youth Programs', 0, 1, null);

// Hartwell Industries - new corporate
insertDonation.run(d13, c1, 2500, '2026-01-15', 'wire', 'Unrestricted', 0, 1, 'Employee match program kick-off');

// Morrison Trust - major foundation
insertDonation.run(d14, c5, 50000, '2025-08-01', 'wire', 'General Operating', 0, 1, 'Annual grant — Year 4');
insertDonation.run(d14, c2, 50000, '2025-12-01', 'wire', 'Capital Campaign', 0, 1, 'Capital campaign lead gift');

// Angela Foster - lapsed
insertDonation.run(d15, c5, 200, '2025-03-15', 'credit_card', 'Unrestricted', 0, 1, null);
insertDonation.run(d15, c5, 150, '2025-06-15', 'credit_card', 'Unrestricted', 0, 1, 'Last known gift');

// ── Grants ────────────────────────────────────────────────────
const insertGrant = db.prepare(`INSERT INTO grants (grantor, title, amount, purpose, status, submitted_date, deadline, awarded_date, report_due, contact_name, contact_email, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

insertGrant.run('Greenleaf Foundation', 'Environmental Education Initiative — Year 3', 40000, 'Fund environmental education curriculum for K-8 students across 5 partner schools', 'awarded', '2025-11-15', '2025-12-31', '2026-01-15', '2026-07-15', 'Diana Greenleaf', 'diana@greenleaf.org', 'Final year of 3-year commitment. Must submit impact report by July.');
insertGrant.run('The Morrison Trust', 'General Operating Support 2026', 50000, 'Unrestricted operating support for organizational capacity', 'pending', '2026-02-01', '2026-04-30', null, null, 'Thomas Morrison III', 'thomas@morrisontrust.org', 'Year 5 renewal. Board review in April.');
insertGrant.run('Apex Community Fund', 'Youth Mentorship Expansion Grant', 35000, 'Scale mentorship program from 3 to 7 schools, recruit and train 20 mentors', 'submitted', '2026-01-20', '2026-03-31', null, null, 'Karen Wells', 'kwells@apexfund.org', 'Second application. First grant was for capacity building.');
insertGrant.run('City of Riverside', 'Community Development Block Grant', 75000, 'Renovate community center kitchen and add ADA-compliant restrooms', 'submitted', '2025-12-15', '2026-06-30', null, null, 'Mike Patterson', 'mpatterson@riverside.gov', 'CDBG application. Requires 25% match ($18,750).');
insertGrant.run('National Education Association', 'STEM After-School Program', 20000, 'Launch STEM workshops for underserved middle school students', 'rejected', '2025-09-01', '2025-11-30', null, null, 'Dr. Patricia Nguyen', 'pnguyen@nea.org', 'Feedback: strengthen outcomes measurement. Can reapply next cycle.');
insertGrant.run('The Morrison Trust', 'Capital Campaign — Phase 1', 100000, 'Lead gift for new community center construction', 'awarded', '2025-06-01', '2025-09-30', '2025-10-15', '2026-10-15', 'Thomas Morrison III', 'thomas@morrisontrust.org', 'Largest single grant in org history. Quarterly progress reports required.');
insertGrant.run('Wells Fargo Foundation', 'Financial Literacy Initiative', 15000, 'Deliver 12-week financial literacy workshops to 200 community members', 'pending', '2026-02-15', '2026-05-15', null, null, 'Jessica Huang', 'jhuang@wellsfargo.org', 'First-time application. Referred by Neighborhood Credit Union.');

// ── Pledges ────────────────────────────────────────────────────
const insertPledge = db.prepare(`INSERT INTO pledges (donor_id, campaign_id, amount, amount_paid, frequency, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

insertPledge.run(d1, c2, 25000, 10000, 'quarterly', '2026-01-01', '2027-06-01', 'active');
insertPledge.run(d2, c2, 50000, 15000, 'annual', '2025-06-01', '2027-06-01', 'active');
insertPledge.run(d3, c1, 30000, 10000, 'quarterly', '2026-01-01', '2026-12-31', 'active');
insertPledge.run(d5, c1, 1200, 300, 'monthly', '2026-01-01', '2026-12-31', 'active');
insertPledge.run(d9, c1, 20000, 0, 'annual', '2026-01-01', '2026-12-31', 'overdue');
insertPledge.run(d14, c2, 150000, 50000, 'annual', '2025-06-01', '2027-06-01', 'active');
insertPledge.run(d12, c4, 5000, 3000, 'quarterly', '2025-09-01', '2026-08-31', 'active');

// ── Engagements ────────────────────────────────────────────────────
const insertEngagement = db.prepare(`INSERT INTO engagements (donor_id, type, date, staff_member, subject, notes) VALUES (?, ?, ?, ?, ?, ?)`);

insertEngagement.run(d1, 'meeting', '2026-02-20', 'Ashley Harrison', 'Capital campaign update', 'Toured construction site. Very enthusiastic about Reading Room naming.');
insertEngagement.run(d1, 'email', '2026-03-01', 'Ashley Harrison', 'Board meeting follow-up', 'Sent recap and Q2 priorities.');
insertEngagement.run(d2, 'phone', '2026-02-10', 'Marcus Johnson', 'Gala sponsorship ask', 'Confirmed Platinum table again. Will bring 3 new couples.');
insertEngagement.run(d2, 'email', '2026-03-05', 'Marcus Johnson', 'Gala save-the-date', 'Sent invitation. Enthusiastic response.');
insertEngagement.run(d3, 'meeting', '2026-01-08', 'Ashley Harrison', 'Annual partnership review', 'Discussed expanding employee volunteer days. New VP interested in board seat.');
insertEngagement.run(d5, 'email', '2026-02-15', 'Sarah Torres', 'Mentorship impact update', 'Shared student success stories. Robert replied saying he wants to increase monthly.');
insertEngagement.run(d6, 'email', '2026-02-20', 'Ashley Harrison', 'Grant report reminder', 'Impact report due July 15. Need to start collecting data.');
insertEngagement.run(d8, 'phone', '2026-01-20', 'Marcus Johnson', 'Workshop scheduling', 'Confirmed 4 workshop dates for spring semester.');
insertEngagement.run(d9, 'phone', '2026-01-15', 'Ashley Harrison', 'Re-engagement call', 'Left voicemail. No response yet.');
insertEngagement.run(d9, 'email', '2026-02-01', 'Ashley Harrison', 'Personal update and impact report', 'Sent tailored impact report. No response.');
insertEngagement.run(d9, 'email', '2026-03-01', 'Ashley Harrison', 'Gala invitation', 'Sent personal invitation to Spring Gala. Awaiting response.');
insertEngagement.run(d10, 'email', '2026-02-25', 'Sarah Torres', 'New grant opportunity', 'Sent LOI for youth mentorship expansion.');
insertEngagement.run(d11, 'event', '2026-03-01', 'Sarah Torres', 'Community open house', 'Met at event. Very engaged. Added to cultivation list.');
insertEngagement.run(d12, 'meeting', '2026-02-28', 'Sarah Torres', 'Volunteer appreciation', 'Thanked for tutoring hours. Lisa mentioned wanting to fund scholarships.');
insertEngagement.run(d14, 'meeting', '2026-01-30', 'Ashley Harrison', 'Annual grant review', 'Positive meeting. Thomas hinted at increased support if capital campaign on track.');
insertEngagement.run(d15, 'email', '2026-02-10', 'Marcus Johnson', 'Re-engagement email', 'Sent personalized update. No response.');

const donorCount = (db.prepare('SELECT COUNT(*) as c FROM donors').get() as any).c;
const campaignCount = (db.prepare('SELECT COUNT(*) as c FROM campaigns').get() as any).c;
const donationCount = (db.prepare('SELECT COUNT(*) as c FROM donations').get() as any).c;
const grantCount = (db.prepare('SELECT COUNT(*) as c FROM grants').get() as any).c;
const pledgeCount = (db.prepare('SELECT COUNT(*) as c FROM pledges').get() as any).c;
const engagementCount = (db.prepare('SELECT COUNT(*) as c FROM engagements').get() as any).c;

console.log(`Seeded: ${donorCount} donors, ${campaignCount} campaigns, ${donationCount} donations, ${grantCount} grants, ${pledgeCount} pledges, ${engagementCount} engagements`);
