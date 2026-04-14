import db from './database.js';

db.exec('DELETE FROM intake_activity');
db.exec('DELETE FROM consents');
db.exec('DELETE FROM appointments');
db.exec('DELETE FROM insurance');
db.exec('DELETE FROM intake_forms');
db.exec('DELETE FROM patients');

// --- Patients ---
const insertPatient = db.prepare(`
  INSERT INTO patients (first_name, last_name, date_of_birth, email, phone, address, emergency_contact_name, emergency_contact_phone, preferred_language)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const patients = [
  ['Elena', 'Vasquez', '1987-03-14', 'elena.vasquez@example.com', '(415) 555-0121', '2204 Fillmore St, San Francisco, CA 94115', 'Miguel Vasquez', '(415) 555-0139', 'Spanish'],
  ['James', 'Carter', '1952-11-02', 'jcarter@example.com', '(415) 555-0144', '881 Clement St, San Francisco, CA 94118', 'Diane Carter', '(415) 555-0145', 'English'],
  ['Priya', 'Shah', '1994-08-22', 'priya.shah@example.com', '(415) 555-0167', '450 Mission Bay Blvd, San Francisco, CA 94158', 'Rohan Shah', '(415) 555-0168', 'English'],
  ['Marcus', 'Whitfield', '1978-05-09', 'marcus.w@example.com', '(415) 555-0182', '1150 Sacramento St, San Francisco, CA 94108', 'Tanya Whitfield', '(415) 555-0183', 'English'],
  ['Hannah', 'Goldberg', '2001-12-30', 'hannah.g@example.com', '(415) 555-0195', '735 Stanyan St, San Francisco, CA 94117', 'Sarah Goldberg', '(415) 555-0196', 'English'],
  ['Wei', 'Chen', '1965-06-18', 'wei.chen@example.com', '(415) 555-0203', '1320 Pacific Ave, San Francisco, CA 94109', 'Lin Chen', '(415) 555-0204', 'Mandarin'],
  ['Aaliyah', 'Jefferson', '1991-02-11', 'aaliyah.j@example.com', '(415) 555-0218', '2570 Divisadero St, San Francisco, CA 94115', 'Terrence Jefferson', '(415) 555-0219', 'English'],
  ['Oliver', 'Bennett', '1983-09-25', 'oliver.bennett@example.com', '(415) 555-0234', '88 King St, San Francisco, CA 94107', 'Emma Bennett', '(415) 555-0235', 'English'],
  ['Sofia', 'Rodriguez', '1998-04-07', 'sofia.r@example.com', '(415) 555-0251', '1500 Van Ness Ave, San Francisco, CA 94109', 'Carlos Rodriguez', '(415) 555-0252', 'Spanish'],
  ['Richard', 'Nakamura', '1948-01-20', 'rnakamura@example.com', '(415) 555-0267', '3400 Geary Blvd, San Francisco, CA 94118', 'Susan Nakamura', '(415) 555-0268', 'English'],
  ['Fatima', 'Osman', '1989-07-15', 'fatima.osman@example.com', '(415) 555-0284', '620 Folsom St, San Francisco, CA 94107', 'Ahmed Osman', '(415) 555-0285', 'Arabic'],
  ['Daniel', 'Kim', '1975-10-03', 'dkim@example.com', '(415) 555-0296', '1919 Market St, San Francisco, CA 94103', 'Jenny Kim', '(415) 555-0297', 'Korean'],
];

for (const p of patients) {
  insertPatient.run(...p);
}

// --- Intake Forms ---
const insertForm = db.prepare(`
  INSERT INTO intake_forms (patient_id, form_type, status, reason_for_visit, symptoms, current_medications, allergies, medical_history, family_history, started_at, submitted_at, reviewed_at, reviewed_by, flags)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const forms = [
  // Elena — new patient, completed
  [1, 'new_patient', 'completed', 'Annual physical and establishing care with a new primary care provider.',
    'No acute symptoms. Occasional seasonal allergies.',
    'Loratadine 10mg PRN',
    'Penicillin (hives)',
    'Appendectomy 2011. Otherwise unremarkable.',
    'Mother: hypertension. Father: type 2 diabetes.',
    '2026-03-02 09:15', '2026-03-02 09:42', '2026-03-03 08:30', 'Dr. Patel', '[]'],

  // James — specialist referral, flagged
  [2, 'specialist_referral', 'reviewed', 'Cardiology referral from PCP — recurring chest tightness during exertion.',
    'Chest tightness on stairs, mild shortness of breath. Onset ~3 weeks ago.',
    'Lisinopril 20mg, Atorvastatin 40mg, Aspirin 81mg',
    'NKDA',
    'Hypertension (15 years), hyperlipidemia. CABG 2019.',
    'Father: MI age 58. Brother: CAD.',
    '2026-04-08 14:20', '2026-04-08 14:55', '2026-04-09 07:45', 'Dr. Okoye',
    '["cardiac_history", "exertional_symptoms", "urgent_review"]'],

  // Priya — annual update
  [3, 'annual_update', 'submitted', 'Annual wellness visit.',
    'No symptoms. Feeling well.',
    'OCP',
    'NKDA',
    'No significant history.',
    'Mother: breast cancer (age 52).',
    '2026-04-10 11:00', '2026-04-10 11:18', null, null, '["family_hx_cancer"]'],

  // Marcus — new patient, in progress
  [4, 'new_patient', 'in_progress', 'New to the area — transferring care. Managing hypertension and type 2 diabetes.',
    'Fatigue over the past month, BG running higher than usual.',
    'Metformin 1000mg BID, Lisinopril 10mg, Rosuvastatin 20mg',
    'Sulfa drugs (rash)',
    null,
    null,
    '2026-04-11 16:00', null, null, null, '["diabetes", "hypertension"]'],

  // Hannah — new patient, submitted
  [5, 'new_patient', 'submitted', 'College student establishing care. Anxiety management and birth control.',
    'Anxiety, difficulty sleeping during exam periods.',
    'Sertraline 50mg',
    'NKDA',
    'Anxiety diagnosed 2022.',
    'Mother: depression.',
    '2026-04-09 10:30', '2026-04-09 10:58', null, null, '["mental_health"]'],

  // Wei — annual update, completed
  [6, 'annual_update', 'completed', 'Annual Medicare wellness visit.',
    'Mild knee pain, OA managed with OTC.',
    'Amlodipine 5mg, Acetaminophen PRN',
    'NKDA',
    'Osteoarthritis, hypertension.',
    'Mother: stroke (age 78).',
    '2026-03-22 08:45', '2026-03-22 09:10', '2026-03-23 09:00', 'Dr. Patel', '[]'],

  // Aaliyah — specialist referral
  [7, 'specialist_referral', 'reviewed', 'Dermatology referral — suspicious mole on left shoulder.',
    'Mole has grown and darkened over past 2 months. No pain or itching.',
    'None',
    'NKDA',
    'No significant history.',
    'Father: melanoma (age 61).',
    '2026-04-07 13:00', '2026-04-07 13:25', '2026-04-08 10:00', 'Dr. Okoye',
    '["skin_lesion_change", "family_hx_melanoma", "urgent_review"]'],

  // Oliver — annual update, in progress
  [8, 'annual_update', 'in_progress', 'Annual physical.',
    null,
    'Multivitamin',
    'NKDA',
    null,
    null,
    '2026-04-12 09:00', null, null, null, '[]'],

  // Sofia — new patient, pending
  [9, 'new_patient', 'pending', 'Establishing care after moving to SF for work.',
    null,
    null,
    null,
    null,
    null,
    '2026-04-12 15:30', null, null, null, '[]'],

  // Richard — new patient, completed
  [10, 'new_patient', 'completed', 'Establishing care with geriatrician. Multiple chronic conditions.',
    'Increased forgetfulness noted by family over past 6 months.',
    'Donepezil 5mg, Metoprolol 50mg, Warfarin 5mg, Furosemide 20mg',
    'Codeine (nausea)',
    'CHF, atrial fibrillation, early cognitive decline.',
    'Sister: Alzheimer\'s.',
    '2026-03-15 10:00', '2026-03-15 10:45', '2026-03-16 08:15', 'Dr. Patel',
    '["polypharmacy", "cognitive_concern", "anticoagulation"]'],

  // Fatima — annual update, submitted
  [11, 'annual_update', 'submitted', 'Prenatal care transfer — 18 weeks pregnant.',
    'Mild nausea, otherwise well.',
    'Prenatal vitamin, Folic acid',
    'NKDA',
    'G2P1. Previous uncomplicated pregnancy.',
    'None significant.',
    '2026-04-10 14:00', '2026-04-10 14:30', null, null, '["pregnancy", "transfer_of_care"]'],

  // Daniel — specialist referral, in progress
  [12, 'specialist_referral', 'in_progress', 'GI referral — chronic abdominal pain.',
    'Intermittent RUQ pain, worse after meals. Onset 2 months ago.',
    'Omeprazole 20mg',
    'NKDA',
    'GERD.',
    null,
    '2026-04-11 11:30', null, null, null, '["abdominal_pain"]'],
];

for (const f of forms) {
  insertForm.run(...f);
}

// --- Insurance ---
const insertInsurance = db.prepare(`
  INSERT INTO insurance (patient_id, provider, policy_number, group_number, plan_type, verification_status, verified_at, copay, deductible_met, deductible_total, effective_date, termination_date, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insurances = [
  [1, 'Blue Shield of California', 'BSC881249301', 'GRP-40218', 'PPO', 'verified', '2026-03-02 10:15', 25, 450, 2000, '2026-01-01', '2026-12-31', 'In-network. Specialist copay $50.'],
  [2, 'Medicare', 'MED-5569-1121-A', null, 'Medicare', 'verified', '2026-04-08 15:30', 0, 0, 0, '2017-12-01', null, 'Medicare Part B + supplemental Plan G.'],
  [2, 'AARP UnitedHealthcare', 'UHC-88812245', 'SUPG-2011', 'Medicare Supplement', 'verified', '2026-04-08 15:35', 0, 0, 0, '2018-01-01', null, 'Plan G supplement.'],
  [3, 'Kaiser Permanente', 'KP-9814-225', 'EMP-NIKE-44', 'HMO', 'verified', '2026-04-10 11:45', 30, 150, 1500, '2026-01-01', '2026-12-31', null],
  [4, 'Aetna', 'AET-44782215', 'GRP-TECH-881', 'PPO', 'verified', '2026-04-11 16:30', 40, 1200, 3000, '2026-03-01', '2026-12-31', 'New coverage — start date confirmed.'],
  [5, 'Blue Cross Blue Shield', 'BCBS-7741902', 'STUDENT-SFSU', 'PPO', 'verified', '2026-04-09 11:15', 20, 0, 500, '2025-09-01', '2026-08-31', 'Student health plan.'],
  [6, 'Medicare', 'MED-4428-8812-B', null, 'Medicare', 'verified', '2026-03-22 09:30', 0, 0, 0, '2030-07-01', null, 'Medicare Advantage through Humana.'],
  [6, 'Humana Medicare Advantage', 'HUM-ADV-88120', 'MA-HUM-SF', 'Medicare Advantage', 'verified', '2026-03-22 09:35', 15, 0, 0, '2026-01-01', '2026-12-31', null],
  [7, 'Anthem Blue Cross', 'ANT-55129844', 'GRP-MEDIA-201', 'PPO', 'verified', '2026-04-07 14:00', 35, 800, 2500, '2026-01-01', '2026-12-31', null],
  [8, 'Cigna', 'CIG-887722-01', 'GRP-STARTUP', 'EPO', 'pending', null, null, null, null, '2026-01-01', '2026-12-31', 'Awaiting employer group verification.'],
  [9, 'UnitedHealthcare', 'UHC-22114488', 'GRP-CONSULT-9', 'PPO', 'pending', null, null, null, null, '2026-04-01', '2026-12-31', 'Coverage just activated — verification in progress.'],
  [10, 'Medicare', 'MED-1122-3344-A', null, 'Medicare', 'verified', '2026-03-15 11:00', 0, 0, 0, '2013-02-01', null, null],
  [10, 'Blue Shield Medicare Supplement', 'BSC-SUP-44218', 'PLAN-F-CA', 'Medicare Supplement', 'verified', '2026-03-15 11:05', 0, 0, 0, '2014-01-01', null, 'Plan F.'],
  [11, 'Blue Shield of California', 'BSC-MAT-88211', 'GRP-EMPIRE-2', 'PPO', 'verified', '2026-04-10 15:00', 25, 500, 2000, '2026-01-01', '2026-12-31', 'Maternity benefits active.'],
  [12, 'Aetna', 'AET-99221144', 'GRP-BANK-SF', 'PPO', 'denied', '2026-04-11 12:30', null, null, null, '2025-01-01', '2025-12-31', 'Coverage terminated 2025-12-31. Patient needs updated insurance.'],
];

for (const i of insurances) {
  insertInsurance.run(...i);
}

// --- Appointments ---
const insertAppt = db.prepare(`
  INSERT INTO appointments (patient_id, intake_form_id, provider, appointment_type, scheduled_at, duration_minutes, status, location, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const appointments = [
  [1, 1, 'Dr. Patel', 'new_patient', '2026-03-05 09:00', 45, 'completed', 'Main Clinic — Room 3', null],
  [1, null, 'Dr. Patel', 'follow_up', '2026-09-15 10:00', 30, 'scheduled', 'Main Clinic — Room 3', 'Annual follow-up.'],
  [2, 2, 'Dr. Okoye', 'consultation', '2026-04-15 11:00', 60, 'confirmed', 'Cardiology — Room 7', 'Stress test ordered pre-visit.'],
  [3, 3, 'Dr. Patel', 'annual', '2026-04-18 14:30', 30, 'scheduled', 'Main Clinic — Room 2', null],
  [4, 4, 'Dr. Patel', 'new_patient', '2026-04-16 09:30', 45, 'scheduled', 'Main Clinic — Room 3', 'Bring glucose log.'],
  [5, 5, 'Dr. Chen', 'new_patient', '2026-04-14 15:00', 45, 'scheduled', 'Main Clinic — Room 4', null],
  [6, 6, 'Dr. Patel', 'annual', '2026-03-25 10:00', 30, 'completed', 'Main Clinic — Room 2', null],
  [7, 7, 'Dr. Okoye', 'consultation', '2026-04-14 13:30', 30, 'confirmed', 'Dermatology — Room 9', 'Consider biopsy.'],
  [8, 8, 'Dr. Chen', 'annual', '2026-04-20 08:30', 30, 'scheduled', 'Main Clinic — Room 4', null],
  [9, 9, 'Dr. Patel', 'new_patient', '2026-04-22 11:00', 45, 'scheduled', 'Main Clinic — Room 3', null],
  [10, 10, 'Dr. Patel', 'new_patient', '2026-03-18 09:00', 60, 'completed', 'Main Clinic — Room 3', 'Caregiver attended.'],
  [10, null, 'Dr. Patel', 'follow_up', '2026-04-17 10:00', 30, 'confirmed', 'Main Clinic — Room 3', 'INR check + med review.'],
  [11, 11, 'Dr. Chen', 'new_patient', '2026-04-15 10:30', 45, 'confirmed', 'OB Clinic — Room 6', 'Prenatal transfer visit.'],
  [12, 12, 'Dr. Okoye', 'consultation', '2026-04-21 14:00', 45, 'scheduled', 'GI Clinic — Room 8', null],
  [5, null, 'Dr. Chen', 'telehealth', '2026-04-28 16:00', 30, 'scheduled', 'Telehealth', 'Medication follow-up.'],
];

for (const a of appointments) {
  insertAppt.run(...a);
}

// --- Consents ---
const insertConsent = db.prepare(`
  INSERT INTO consents (patient_id, consent_type, status, signed_at, signed_by, expires_at, document_version, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const consents = [
  [1, 'hipaa_privacy', 'signed', '2026-03-02 09:20', 'Elena Vasquez', '2027-03-02', 'v3.2', null],
  [1, 'treatment', 'signed', '2026-03-02 09:22', 'Elena Vasquez', null, 'v2.1', null],
  [1, 'financial', 'signed', '2026-03-02 09:25', 'Elena Vasquez', null, 'v1.8', null],
  [2, 'hipaa_privacy', 'signed', '2026-04-08 14:30', 'James Carter', '2027-04-08', 'v3.2', null],
  [2, 'treatment', 'signed', '2026-04-08 14:32', 'James Carter', null, 'v2.1', null],
  [2, 'release_of_records', 'signed', '2026-04-08 14:35', 'James Carter', '2026-10-08', 'v1.5', 'Release to prior cardiologist Dr. Feldman.'],
  [3, 'hipaa_privacy', 'signed', '2026-04-10 11:05', 'Priya Shah', '2027-04-10', 'v3.2', null],
  [3, 'treatment', 'signed', '2026-04-10 11:07', 'Priya Shah', null, 'v2.1', null],
  [4, 'hipaa_privacy', 'pending', null, null, null, 'v3.2', 'Sent — awaiting signature.'],
  [4, 'treatment', 'pending', null, null, null, 'v2.1', null],
  [5, 'hipaa_privacy', 'signed', '2026-04-09 10:35', 'Hannah Goldberg', '2027-04-09', 'v3.2', null],
  [5, 'treatment', 'signed', '2026-04-09 10:37', 'Hannah Goldberg', null, 'v2.1', null],
  [5, 'telehealth', 'signed', '2026-04-09 10:40', 'Hannah Goldberg', '2027-04-09', 'v1.3', null],
  [6, 'hipaa_privacy', 'signed', '2026-03-22 08:50', 'Wei Chen', '2027-03-22', 'v3.2', null],
  [6, 'treatment', 'signed', '2026-03-22 08:52', 'Wei Chen', null, 'v2.1', null],
  [7, 'hipaa_privacy', 'signed', '2026-04-07 13:05', 'Aaliyah Jefferson', '2027-04-07', 'v3.2', null],
  [7, 'treatment', 'signed', '2026-04-07 13:07', 'Aaliyah Jefferson', null, 'v2.1', null],
  [8, 'hipaa_privacy', 'signed', '2026-04-12 09:05', 'Oliver Bennett', '2027-04-12', 'v3.2', null],
  [9, 'hipaa_privacy', 'pending', null, null, null, 'v3.2', null],
  [9, 'treatment', 'pending', null, null, null, 'v2.1', null],
  [9, 'financial', 'pending', null, null, null, 'v1.8', null],
  [10, 'hipaa_privacy', 'signed', '2026-03-15 10:05', 'Susan Nakamura (POA)', '2027-03-15', 'v3.2', 'Signed by POA with documentation on file.'],
  [10, 'treatment', 'signed', '2026-03-15 10:07', 'Susan Nakamura (POA)', null, 'v2.1', null],
  [10, 'release_of_records', 'signed', '2026-03-15 10:12', 'Susan Nakamura (POA)', '2026-09-15', 'v1.5', null],
  [11, 'hipaa_privacy', 'signed', '2026-04-10 14:05', 'Fatima Osman', '2027-04-10', 'v3.2', null],
  [11, 'treatment', 'signed', '2026-04-10 14:07', 'Fatima Osman', null, 'v2.1', null],
  [11, 'release_of_records', 'signed', '2026-04-10 14:10', 'Fatima Osman', '2026-10-10', 'v1.5', 'Release from previous OB.'],
  [12, 'hipaa_privacy', 'signed', '2026-04-11 11:35', 'Daniel Kim', '2027-04-11', 'v3.2', null],
  [12, 'treatment', 'pending', null, null, null, 'v2.1', null],
];

for (const c of consents) {
  insertConsent.run(...c);
}

// --- Activity Log ---
const insertActivity = db.prepare(`
  INSERT INTO intake_activity (patient_id, intake_form_id, action, details, actor, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const activities = [
  [1, 1, 'form_started', 'New patient intake form started.', 'Elena Vasquez', '2026-03-02 09:15'],
  [1, 1, 'form_submitted', 'Intake form submitted.', 'Elena Vasquez', '2026-03-02 09:42'],
  [1, 1, 'insurance_verified', 'Blue Shield PPO verified. Copay $25.', 'Front Desk — Maria', '2026-03-02 10:15'],
  [1, 1, 'form_reviewed', 'Form reviewed by Dr. Patel. No flags.', 'Dr. Patel', '2026-03-03 08:30'],
  [1, 1, 'appointment_completed', 'New patient visit completed.', 'Dr. Patel', '2026-03-05 09:45'],
  [2, 2, 'form_submitted', 'Cardiology referral intake submitted.', 'James Carter', '2026-04-08 14:55'],
  [2, 2, 'flag_raised', 'Clinical flags: cardiac_history, exertional_symptoms. Marked for urgent review.', 'System', '2026-04-08 14:56'],
  [2, 2, 'records_requested', 'Records release signed. Fax sent to Dr. Feldman.', 'Front Desk — Maria', '2026-04-08 15:00'],
  [2, 2, 'form_reviewed', 'Reviewed by Dr. Okoye. Stress test ordered pre-visit.', 'Dr. Okoye', '2026-04-09 07:45'],
  [3, 3, 'form_submitted', 'Annual update submitted.', 'Priya Shah', '2026-04-10 11:18'],
  [3, 3, 'flag_raised', 'Family history of breast cancer noted.', 'System', '2026-04-10 11:19'],
  [4, 4, 'form_started', 'New patient form started by patient.', 'Marcus Whitfield', '2026-04-11 16:00'],
  [4, 4, 'consent_pending', 'HIPAA and treatment consents sent — awaiting signature.', 'System', '2026-04-11 16:05'],
  [5, 5, 'form_submitted', 'New patient form submitted.', 'Hannah Goldberg', '2026-04-09 10:58'],
  [5, 5, 'insurance_verified', 'Student BCBS plan verified.', 'Front Desk — James', '2026-04-09 11:15'],
  [7, 7, 'form_submitted', 'Dermatology referral intake submitted.', 'Aaliyah Jefferson', '2026-04-07 13:25'],
  [7, 7, 'flag_raised', 'Skin lesion change + family history of melanoma. Urgent review.', 'System', '2026-04-07 13:26'],
  [7, 7, 'form_reviewed', 'Reviewed by Dr. Okoye. Biopsy may be indicated.', 'Dr. Okoye', '2026-04-08 10:00'],
  [9, 9, 'form_started', 'New patient form created — pending patient completion.', 'Front Desk — Maria', '2026-04-12 15:30'],
  [10, 10, 'form_submitted', 'New patient intake submitted (POA).', 'Susan Nakamura', '2026-03-15 10:45'],
  [10, 10, 'flag_raised', 'Polypharmacy + cognitive concern + anticoagulation. Complex care.', 'System', '2026-03-15 10:46'],
  [10, 10, 'form_reviewed', 'Reviewed by Dr. Patel. Med reconciliation scheduled.', 'Dr. Patel', '2026-03-16 08:15'],
  [11, 11, 'form_submitted', 'Prenatal transfer form submitted at 18 weeks.', 'Fatima Osman', '2026-04-10 14:30'],
  [11, 11, 'records_requested', 'Prenatal records release signed. Request sent.', 'Front Desk — Maria', '2026-04-10 15:10'],
  [12, 12, 'form_started', 'GI referral intake started.', 'Daniel Kim', '2026-04-11 11:30'],
  [12, 12, 'insurance_denied', 'Aetna coverage terminated 2025-12-31. Updated insurance required.', 'Front Desk — James', '2026-04-11 12:30'],
];

for (const a of activities) {
  insertActivity.run(...a);
}

console.log('Seeded healthcare intake database:');
console.log(`  ${patients.length} patients`);
console.log(`  ${forms.length} intake forms`);
console.log(`  ${insurances.length} insurance records`);
console.log(`  ${appointments.length} appointments`);
console.log(`  ${consents.length} consent records`);
console.log(`  ${activities.length} activity entries`);
