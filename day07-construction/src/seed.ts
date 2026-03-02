import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'construction.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// --- Schema ---
db.exec(`
  CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    project_type TEXT NOT NULL CHECK(project_type IN ('residential','commercial','renovation','infrastructure')),
    client_name TEXT NOT NULL,
    client_phone TEXT,
    address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('planning','active','on_hold','completed','cancelled')),
    start_date TEXT NOT NULL,
    estimated_end_date TEXT NOT NULL,
    actual_end_date TEXT,
    contract_value REAL NOT NULL,
    spent_to_date REAL NOT NULL DEFAULT 0,
    completion_pct INTEGER NOT NULL DEFAULT 0,
    superintendent TEXT NOT NULL,
    notes TEXT
  );

  CREATE TABLE subcontractors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    trade TEXT NOT NULL,
    contract_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','terminated','pending')),
    start_date TEXT,
    end_date TEXT,
    insurance_expiry TEXT,
    license_number TEXT,
    notes TEXT
  );

  CREATE TABLE inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    inspection_type TEXT NOT NULL,
    trade TEXT,
    inspector_name TEXT,
    scheduled_date TEXT NOT NULL,
    completed_date TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','completed','cancelled','rescheduled')),
    result TEXT CHECK(result IN ('passed','failed','conditional','pending')),
    notes TEXT,
    correction_deadline TEXT
  );

  CREATE TABLE rfis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    rfi_number TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    submitted_by TEXT NOT NULL,
    submitted_date TEXT NOT NULL,
    assigned_to TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','answered','closed','void')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('critical','high','medium','low')),
    response TEXT,
    response_date TEXT,
    impact_area TEXT
  );

  CREATE TABLE change_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    co_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reason TEXT NOT NULL CHECK(reason IN ('design_change','unforeseen_condition','owner_request','code_requirement','error_omission')),
    submitted_date TEXT NOT NULL,
    amount REAL NOT NULL,
    schedule_impact_days INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','negotiating')),
    submitted_by TEXT NOT NULL,
    approved_by TEXT,
    approved_date TEXT,
    notes TEXT
  );

  CREATE TABLE daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    log_date TEXT NOT NULL,
    weather TEXT,
    temperature_high INTEGER,
    temperature_low INTEGER,
    crew_count INTEGER NOT NULL DEFAULT 0,
    work_performed TEXT NOT NULL,
    materials_delivered TEXT,
    delays TEXT,
    safety_incidents TEXT,
    visitors TEXT,
    superintendent_notes TEXT
  );
`);

// --- Helpers ---
const today = new Date();
function dateStr(d: Date): string { return d.toISOString().split('T')[0]; }
function daysAgo(n: number): string { const d = new Date(today); d.setDate(d.getDate() - n); return dateStr(d); }
function daysFromNow(n: number): string { const d = new Date(today); d.setDate(d.getDate() + n); return dateStr(d); }

// --- Projects (4) ---
const insertProject = db.prepare(`
  INSERT INTO projects (name, project_type, client_name, client_phone, address, status, start_date, estimated_end_date, actual_end_date, contract_value, spent_to_date, completion_pct, superintendent, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertProject.run('Meridian Mixed-Use Development', 'commercial', 'Meridian Capital Group', '213-555-0100', '1200 S Grand Ave, Los Angeles, CA 90015', 'active', daysAgo(120), daysFromNow(180), null, 8500000, 3200000, 38, 'Frank Torres', 'Phase 1: retail + parking structure. Phase 2: residential tower (future). Currently on foundation and steel erection.');
insertProject.run('Harbor View Residences', 'residential', 'Harbor Development LLC', '310-555-0200', '450 Harbor Blvd, San Pedro, CA 90731', 'active', daysAgo(200), daysFromNow(60), null, 4200000, 3400000, 78, 'Mike Chen', '12-unit luxury townhome complex. Interior finish phase. 4 units nearly complete, 8 in various stages of finish.');
insertProject.run('Westfield Kitchen & Bath Remodel', 'renovation', 'Sarah & James Westfield', '818-555-0300', '2847 Mulholland Dr, Los Angeles, CA 90068', 'active', daysAgo(30), daysFromNow(45), null, 185000, 72000, 35, 'Frank Torres', 'Full gut renovation — kitchen, two bathrooms, laundry room. Homeowners living on-site during construction.');
insertProject.run('Lincoln Heights Community Center', 'infrastructure', 'City of Los Angeles — Parks Dept', '213-555-0400', '3516 N Broadway, Los Angeles, CA 90031', 'on_hold', daysAgo(90), daysFromNow(120), null, 3100000, 890000, 22, 'Mike Chen', 'Public community center with gymnasium, classrooms, and outdoor park. ON HOLD — city permit dispute on the gymnasium expansion. Awaiting revised structural drawings.');

// --- Subcontractors (14) ---
const insertSub = db.prepare(`
  INSERT INTO subcontractors (project_id, company_name, contact_name, phone, email, trade, contract_amount, status, start_date, end_date, insurance_expiry, license_number, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Project 1 — Meridian Mixed-Use
insertSub.run(1, 'Pacific Steel Erectors', 'Danny Kovac', '213-555-1001', 'danny@pacificsteel.com', 'structural_steel', 1200000, 'active', daysAgo(60), daysFromNow(90), daysFromNow(200), 'CA-STL-44891', 'Experienced on high-rise. Currently erecting floors 3-5.');
insertSub.run(1, 'SoCal Concrete', 'Maria Fuentes', '213-555-1002', 'maria@socalconcrete.com', 'concrete', 950000, 'active', daysAgo(110), daysFromNow(30), daysFromNow(180), 'CA-CON-33201', 'Foundation complete. Finishing parking structure deck pours.');
insertSub.run(1, 'Apex Electrical', 'Ron Kowalski', '213-555-1003', 'ron@apexelec.com', 'electrical', 680000, 'pending', null, null, daysFromNow(90), 'CA-ELE-55672', 'Rough-in starts next month when steel framing completes floor 4.');
insertSub.run(1, 'Metro Plumbing Solutions', 'Carlos Reyes', '213-555-1004', 'carlos@metroplumb.com', 'plumbing', 520000, 'pending', null, null, daysFromNow(45), 'CA-PLB-22190', '⚠️ Insurance expires in 45 days. Need updated COI before mobilization.');

// Project 2 — Harbor View
insertSub.run(2, 'Prestige Drywall', 'Tony Anh', '310-555-2001', 'tony@prestigedrywall.com', 'drywall', 380000, 'active', daysAgo(90), daysFromNow(20), daysFromNow(150), 'CA-DRY-88432', 'All 12 units hung. Finishing/taping in progress on units 5-12.');
insertSub.run(2, 'Coastal Painting Co', 'Lisa Park', '310-555-2002', 'lisa@coastalpaint.com', 'painting', 210000, 'active', daysAgo(45), daysFromNow(40), daysFromNow(300), 'CA-PNT-11203', 'Units 1-4 painted. Waiting on drywall completion for units 5-8.');
insertSub.run(2, 'Harbor HVAC', 'Pete Nolan', '310-555-2003', 'pete@harborhvac.com', 'hvac', 480000, 'active', daysAgo(140), daysFromNow(30), daysFromNow(210), 'CA-HVC-67410', 'Ductwork and units installed. Commissioning phase for units 1-4.');
insertSub.run(2, 'Summit Tile & Stone', 'Ana Moreno', '310-555-2004', 'ana@summittile.com', 'tile', 165000, 'active', daysAgo(30), daysFromNow(25), daysFromNow(180), 'CA-TLE-90122', 'Master bath tile in units 1-4 complete. Starting kitchen backsplashes.');
insertSub.run(2, 'Golden State Roofing', 'Hank Williams', '310-555-2005', 'hank@gsroofing.com', 'roofing', 290000, 'completed', daysAgo(150), daysAgo(60), daysFromNow(250), 'CA-ROF-44556', 'All 12 units roofed. Final inspection passed.');

// Project 3 — Westfield Remodel
insertSub.run(3, 'Metro Plumbing Solutions', 'Carlos Reyes', '818-555-3001', 'carlos@metroplumb.com', 'plumbing', 32000, 'active', daysAgo(20), daysFromNow(15), daysFromNow(45), 'CA-PLB-22190', 'Rough plumbing complete. Waiting on tile before fixture install.');
insertSub.run(3, 'Apex Electrical', 'Ron Kowalski', '818-555-3002', 'ron@apexelec.com', 'electrical', 24000, 'active', daysAgo(18), daysFromNow(20), daysFromNow(90), 'CA-ELE-55672', 'Panel upgraded. Rough-in for kitchen complete, bathrooms in progress.');
insertSub.run(3, 'Summit Tile & Stone', 'Ana Moreno', '818-555-3003', 'ana@summittile.com', 'tile', 18500, 'pending', null, null, daysFromNow(180), 'CA-TLE-90122', 'Tile delivery expected next week. Shower pans need inspection first.');

// Project 4 — Lincoln Heights (on hold)
insertSub.run(4, 'Pacific Steel Erectors', 'Danny Kovac', '213-555-4001', 'danny@pacificsteel.com', 'structural_steel', 680000, 'active', daysAgo(60), daysFromNow(90), daysFromNow(200), 'CA-STL-44891', 'Foundation steel installed. Gymnasium steel ON HOLD pending permit.');
insertSub.run(4, 'SoCal Concrete', 'Maria Fuentes', '213-555-4002', 'maria@socalconcrete.com', 'concrete', 520000, 'active', daysAgo(85), daysFromNow(60), daysFromNow(180), 'CA-CON-33201', 'Slab-on-grade complete. Retaining wall work paused.');

// --- Inspections (18) ---
const insertInspection = db.prepare(`
  INSERT INTO inspections (project_id, inspection_type, trade, inspector_name, scheduled_date, completed_date, status, result, notes, correction_deadline)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Project 1 — Meridian
insertInspection.run(1, 'Foundation', 'concrete', 'James Whitfield', daysAgo(95), daysAgo(95), 'completed', 'passed', 'All footings per spec. Rebar spacing verified.', null);
insertInspection.run(1, 'Structural Steel — Level 2', 'structural_steel', 'James Whitfield', daysAgo(40), daysAgo(40), 'completed', 'passed', 'Connections and bolting per approved shop drawings.', null);
insertInspection.run(1, 'Structural Steel — Level 3', 'structural_steel', 'James Whitfield', daysAgo(10), daysAgo(10), 'completed', 'conditional', 'Two beam connections need additional reinforcement at grid B-4. Minor — does not stop work.', daysFromNow(5));
insertInspection.run(1, 'Concrete Deck Pour — Parking Level 2', 'concrete', 'James Whitfield', daysAgo(5), daysAgo(5), 'completed', 'passed', 'Cylinders pulled. 28-day break scheduled.', null);
insertInspection.run(1, 'Structural Steel — Level 4', 'structural_steel', 'James Whitfield', daysFromNow(7), null, 'scheduled', 'pending', 'Pre-inspection walkthrough with Danny on Friday.', null);
insertInspection.run(1, 'Fireproofing — Levels 1-3', 'fireproofing', 'County Fire Marshal', daysFromNow(21), null, 'scheduled', 'pending', null, null);

// Project 2 — Harbor View
insertInspection.run(2, 'Rough Plumbing — Units 1-4', 'plumbing', 'Tom Nguyen', daysAgo(75), daysAgo(75), 'completed', 'passed', null, null);
insertInspection.run(2, 'Rough Electrical — Units 1-4', 'electrical', 'Tom Nguyen', daysAgo(70), daysAgo(70), 'completed', 'passed', null, null);
insertInspection.run(2, 'Drywall Nailing — Units 1-4', 'drywall', 'Tom Nguyen', daysAgo(50), daysAgo(50), 'completed', 'failed', 'Missing fire-rated assembly at unit 2 party wall. Corrected and re-inspected.', daysAgo(45));
insertInspection.run(2, 'Drywall Nailing Re-Inspect — Unit 2', 'drywall', 'Tom Nguyen', daysAgo(43), daysAgo(43), 'completed', 'passed', 'Fire-rated assembly corrected. Approved.', null);
insertInspection.run(2, 'Final HVAC — Units 1-4', 'hvac', 'Tom Nguyen', daysFromNow(14), null, 'scheduled', 'pending', 'Commissioning needs to be complete before inspection.', null);
insertInspection.run(2, 'Final Plumbing — Units 1-4', 'plumbing', 'Tom Nguyen', daysFromNow(18), null, 'scheduled', 'pending', null, null);
insertInspection.run(2, 'Final Electrical — Units 1-4', 'electrical', 'Tom Nguyen', daysFromNow(20), null, 'scheduled', 'pending', null, null);

// Project 3 — Westfield
insertInspection.run(3, 'Rough Plumbing', 'plumbing', 'Laura Kim', daysAgo(8), daysAgo(8), 'completed', 'passed', 'All supply and waste lines per plan.', null);
insertInspection.run(3, 'Rough Electrical', 'electrical', 'Laura Kim', daysAgo(6), daysAgo(6), 'completed', 'failed', 'Kitchen GFCI placement not per code — needs to be within 6ft of sink. 2 outlets to relocate.', daysFromNow(3));
insertInspection.run(3, 'Shower Pan — Master Bath', 'plumbing', 'Laura Kim', daysFromNow(3), null, 'scheduled', 'pending', 'Must pass before tile can start.', null);

// Project 4 — Lincoln Heights
insertInspection.run(4, 'Foundation', 'concrete', 'James Whitfield', daysAgo(70), daysAgo(70), 'completed', 'passed', null, null);
insertInspection.run(4, 'Gymnasium Structural — ON HOLD', 'structural_steel', 'James Whitfield', daysFromNow(30), null, 'scheduled', 'pending', 'Cannot proceed until permit dispute resolved and revised drawings approved.', null);

// --- RFIs (12) ---
const insertRFI = db.prepare(`
  INSERT INTO rfis (project_id, rfi_number, subject, description, submitted_by, submitted_date, assigned_to, status, priority, response, response_date, impact_area)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Project 1 — Meridian
insertRFI.run(1, 'RFI-001', 'Steel beam size at grid line C-7', 'Shop drawings show W14x30 but structural plans call for W14x38. Please clarify which is correct.', 'Danny Kovac — Pacific Steel', daysAgo(25), 'Structural Engineer — KBA Associates', 'answered', 'critical', 'W14x38 is correct per structural calculations. Shop drawings to be revised.', daysAgo(22), 'structural');
insertRFI.run(1, 'RFI-002', 'Parking structure waterproofing membrane spec', 'Plans reference "approved equal" for traffic-bearing membrane but don\'t specify a base product. Need manufacturer and spec to bid.', 'Maria Fuentes — SoCal Concrete', daysAgo(18), 'Architect — Gensler', 'open', 'high', null, null, 'waterproofing');
insertRFI.run(1, 'RFI-003', 'Electrical panel location conflict', 'Architectural plans show panel EP-2A in a location that conflicts with structural column at grid D-3. Request relocation options.', 'Ron Kowalski — Apex Electrical', daysAgo(8), 'Architect — Gensler', 'open', 'medium', null, null, 'electrical');
insertRFI.run(1, 'RFI-004', 'Concrete mix design for elevated decks', 'Spec calls for 5000 PSI at 28 days. Ready-mix supplier is proposing a fly ash blend that may require extended cure time. Is this acceptable?', 'Maria Fuentes — SoCal Concrete', daysAgo(30), 'Structural Engineer — KBA Associates', 'closed', 'medium', 'Fly ash blend approved provided 56-day break meets 5000 PSI. Submit cylinder reports.', daysAgo(26), 'concrete');

// Project 2 — Harbor View
insertRFI.run(2, 'RFI-001', 'Tile layout revision — Units 5-8 master bath', 'Client wants herringbone pattern in master baths for units 5-8 instead of the straight lay shown on drawings. Need revised shop drawings.', 'Ana Moreno — Summit Tile', daysAgo(12), 'Interior Designer — Marks Design', 'answered', 'low', 'Herringbone approved. Revised drawings attached. Expect $2,400 material adder — submit CO.', daysAgo(9), 'finish');
insertRFI.run(2, 'RFI-002', 'HVAC condensate drain routing — Unit 7', 'Planned route conflicts with structural beam. Need alternate path approved.', 'Pete Nolan — Harbor HVAC', daysAgo(15), 'MEP Engineer — LSA Engineering', 'open', 'high', null, null, 'mechanical');
insertRFI.run(2, 'RFI-003', 'Window specification — Units 9-12', 'Specified manufacturer has 14-week lead time. Alternate supplier can deliver in 6 weeks at comparable spec. Requesting approval.', 'Mike Chen — Superintendent', daysAgo(20), 'Architect — Gensler', 'answered', 'critical', 'Alternate approved: Milgard V400 Series. Submit shop drawings within 5 business days.', daysAgo(17), 'windows');

// Project 3 — Westfield
insertRFI.run(3, 'RFI-001', 'Kitchen island electrical — additional circuits', 'Owner wants to add a built-in wine fridge and ice maker to the island. Plans only show one 20A circuit. Need two additional dedicated circuits.', 'Ron Kowalski — Apex Electrical', daysAgo(14), 'Frank Torres — Superintendent', 'answered', 'medium', 'Approved. Owner to sign addendum. Submit CO for additional work ($1,800).', daysAgo(12), 'electrical');
insertRFI.run(3, 'RFI-002', 'Shower niche dimensions — Guest bath', 'Plans show 12x24 niche but selected tile is 13x13. Niche needs to be resized to 13x26 for clean layout. Confirm with owner.', 'Ana Moreno — Summit Tile', daysAgo(5), 'Frank Torres — Superintendent', 'open', 'low', null, null, 'tile');

// Project 4 — Lincoln Heights
insertRFI.run(4, 'RFI-001', 'Gymnasium expansion — permit requirements', 'City is requiring additional seismic analysis for the gymnasium wing expansion. Need structural engineer to provide supplemental calcs.', 'Mike Chen — Superintendent', daysAgo(45), 'Structural Engineer — KBA Associates', 'open', 'critical', null, null, 'structural');
insertRFI.run(4, 'RFI-002', 'ADA parking layout revision', 'Current layout doesn\'t meet updated ADA requirements per city review comments. Need revised civil drawings.', 'Mike Chen — Superintendent', daysAgo(35), 'Civil Engineer — Psomas', 'answered', 'high', 'Revised layout submitted to city. Awaiting approval. Est. 2-week review.', daysAgo(28), 'civil');

// --- Change Orders (8) ---
const insertCO = db.prepare(`
  INSERT INTO change_orders (project_id, co_number, title, description, reason, submitted_date, amount, schedule_impact_days, status, submitted_by, approved_by, approved_date, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Project 1
insertCO.run(1, 'CO-001', 'Additional foundation piers — soil condition', 'Geotechnical report revealed soft soil at grid A-1 through A-4. 6 additional micro-piers required.', 'unforeseen_condition', daysAgo(85), 145000, 7, 'approved', 'Frank Torres', 'Meridian Capital Group', daysAgo(80), 'Soil report attached. Work completed.');
insertCO.run(1, 'CO-002', 'Upgraded electrical service — EV charging', 'Owner requesting 8 EV charging stations in parking structure. Requires larger transformer and additional conduit runs.', 'owner_request', daysAgo(20), 92000, 0, 'approved', 'Frank Torres', 'Meridian Capital Group', daysAgo(15), 'Approved. Apex Electrical to provide updated schedule.');
insertCO.run(1, 'CO-003', 'Steel connection reinforcement — Level 3', 'Per conditional inspection finding. Two beam connections at grid B-4 need reinforcement plates.', 'code_requirement', daysAgo(9), 18500, 3, 'pending', 'Danny Kovac — Pacific Steel', null, null, 'Waiting on owner approval. Work can proceed in parallel.');

// Project 2
insertCO.run(2, 'CO-001', 'Herringbone tile upgrade — Units 5-8', 'Per RFI-001. Herringbone layout requires additional material and labor for master bath tile in 4 units.', 'design_change', daysAgo(8), 9600, 0, 'approved', 'Ana Moreno — Summit Tile', 'Harbor Development LLC', daysAgo(6), null);
insertCO.run(2, 'CO-002', 'Window manufacturer substitution', 'Alternate window supplier (Milgard V400) approved per RFI-003. Cost difference.', 'design_change', daysAgo(16), -12000, -14, 'approved', 'Mike Chen', 'Harbor Development LLC', daysAgo(14), 'Net savings — faster delivery saves 2 weeks on schedule.');
insertCO.run(2, 'CO-003', 'Mold remediation — Unit 3 bathroom', 'Hidden mold discovered behind existing drywall during demo. Full remediation and replacement required.', 'unforeseen_condition', daysAgo(40), 8200, 4, 'approved', 'Mike Chen', 'Harbor Development LLC', daysAgo(38), 'Environmental report on file. Work completed.');

// Project 3
insertCO.run(3, 'CO-001', 'Kitchen island — additional electrical circuits', 'Per RFI-001. Two additional 20A dedicated circuits for wine fridge and ice maker.', 'owner_request', daysAgo(11), 1800, 0, 'approved', 'Ron Kowalski — Apex Electrical', 'Sarah Westfield', daysAgo(10), 'Owner signed addendum.');
insertCO.run(3, 'CO-002', 'Upgraded kitchen faucet — owner selection', 'Owner selected a wall-mount faucet instead of deck-mount. Requires additional in-wall rough plumbing.', 'owner_request', daysAgo(3), 2400, 2, 'negotiating', 'Carlos Reyes — Metro Plumbing', null, null, 'Plumber says $2,400. Owner thinks it should be $1,500. Discussing.');

// --- Daily Logs (last 14 days for active projects) ---
const insertLog = db.prepare(`
  INSERT INTO daily_logs (project_id, log_date, weather, temperature_high, temperature_low, crew_count, work_performed, materials_delivered, delays, safety_incidents, visitors, superintendent_notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const weatherOptions = ['Sunny', 'Partly Cloudy', 'Overcast', 'Light Rain', 'Morning Fog'];

// Project 1 — Meridian (last 10 working days)
const meridianLogs = [
  [daysAgo(1), 'Sunny', 72, 55, 28, 'Steel erection Level 4 — columns and beams on grid A-D. Concrete crew finishing parking Level 2 deck prep.', 'Steel delivery: 12 beams, 8 columns (Level 4)', null, null, 'Owner rep on site — walkthrough of parking structure.', 'Good progress. Level 4 steel ahead of schedule. Need to confirm rebar delivery for Friday.'],
  [daysAgo(2), 'Partly Cloudy', 68, 52, 25, 'Steel erection Level 4 continued — grid E-H columns set. Parking Level 2 rebar inspection prep.', null, null, null, null, 'Rebar spacing on parking deck checked — ready for inspection tomorrow.'],
  [daysAgo(3), 'Sunny', 75, 58, 30, 'Parking Level 2 deck pour — 180 CY placed. Steel crew bolting Level 3 connections per inspection corrections.', '180 CY ready-mix concrete (3 trucks)', null, null, 'Inspector James Whitfield — deck pour inspection.', 'Pour went well. Finishing started by noon. Cylinders pulled for 28-day break.'],
  [daysAgo(4), 'Overcast', 65, 50, 22, 'Steel connection reinforcement at grid B-4 (Level 3 conditional finding). Level 4 column layout.', 'Reinforcement plates (2) from Pacific Steel shop', null, null, null, 'B-4 reinforcement welded and bolted. Will request re-inspection.'],
  [daysAgo(5), 'Morning Fog', 63, 48, 18, 'Fog delay until 9 AM. Steel crew resumed Level 4 beams — grid A-D complete. Survey team on site for Level 5 layout.', null, 'Fog delay — 2 hours lost', null, 'Survey crew — T&M Engineering', 'Short day due to fog. Still on track for weekly target.'],
  [daysAgo(8), 'Sunny', 70, 54, 32, 'Steel erection Level 3 — final beams set. Concrete forming for parking Level 2 deck.', 'Formwork panels and shoring for deck pour', null, null, null, 'Level 3 steel complete. Inspection called for Thursday.'],
  [daysAgo(9), 'Sunny', 74, 56, 30, 'Concrete crew: parking Level 2 shoring and formwork. Steel crew: Level 3 decking and shear studs.', null, null, null, 'Architect site visit — progress photos taken.', 'Architect pleased with progress. Discussed retail storefront details.'],
  [daysAgo(10), 'Light Rain', 60, 48, 12, 'Rain stopped concrete work. Steel crew worked under cover on Level 2 connections. Office/trailer day for submittals.', null, 'Rain delay — concrete crew stood down', null, null, 'Lost a full day on concrete. Will push deck pour to next week.'],
];

meridianLogs.forEach(l => insertLog.run(1, ...l));

// Project 2 — Harbor View (last 8 working days)
const harborLogs = [
  [daysAgo(1), 'Sunny', 70, 55, 18, 'Drywall taping Units 7-8. Tile install Unit 3 master bath. Paint crew cutting in Units 3-4.', 'Tile delivery — Unit 5-8 master bath herringbone', null, null, null, 'Units 1-2 punch list walk scheduled for next week. Buyer walkthrough Unit 1 on Thursday.'],
  [daysAgo(2), 'Partly Cloudy', 67, 52, 16, 'HVAC commissioning Units 1-2. Drywall taping Units 5-6. Tile grout Unit 2 kitchen backsplash.', null, null, null, 'HVAC commissioning tech — Harbor HVAC', 'Units 1-2 HVAC running and balanced. Minor damper adjustment needed in Unit 2.'],
  [daysAgo(3), 'Sunny', 73, 58, 20, 'Cabinet install Units 3-4. Drywall hang Units 9-10. Paint primer Units 1-2.', 'Cabinets — Units 3-4 (RTA delivery)', null, null, null, 'Cabinet delivery was missing one upper for Unit 4. Reordered — 5 day lead.'],
  [daysAgo(4), 'Overcast', 64, 50, 15, 'Tile install Unit 2 master bath. Electrical trim Units 1-2. Plumbing fixtures Units 1-2.', 'Plumbing fixtures — Units 1-4 (Kohler)', null, null, null, 'Good progress on finish work. Units 1-2 looking close to CO-ready.'],
  [daysAgo(5), 'Sunny', 71, 56, 22, 'Drywall finishing Units 7-8. Flooring install Units 1-2 (LVP). Exterior paint touch-up.', 'LVP flooring — Units 1-4', null, null, 'Harbor Development LLC — owner walkthrough', 'Owner impressed with Units 1-2. Wants to accelerate Unit 3-4 completion for early sales.'],
];

harborLogs.forEach(l => insertLog.run(2, ...l));

// Project 3 — Westfield Remodel (last 6 working days)
const westfieldLogs = [
  [daysAgo(1), 'Sunny', 72, 55, 6, 'Electrical rough-in corrections per failed inspection — relocating 2 GFCI outlets. Plumber prepping shower pan for inspection.', null, null, null, 'Homeowner — on site', 'GFCI corrections done. Calling for re-inspection. Shower pan flood test Friday.'],
  [daysAgo(2), 'Partly Cloudy', 68, 52, 5, 'Plumbing rough-in guest bath complete. Electrical rough-in kitchen finalized. Blocking for tile backer board.', 'Cement backer board (Hardiebacker 500 sf)', null, null, 'Homeowner — on site', 'Kitchen rough-in complete. Ready for inspection when electrical passes.'],
  [daysAgo(3), 'Sunny', 75, 58, 4, 'Demo of existing laundry room complete. Rough framing for new washer/dryer alcove.', null, null, null, null, 'Found some old galvanized pipe behind laundry wall. Will replace with PEX — no CO needed, within scope.'],
  [daysAgo(4), 'Sunny', 70, 54, 5, 'Electrical rough-in inspection — FAILED. Two GFCI outlets not within 6ft of sink per code. Corrections needed.', null, 'Failed inspection — corrections required', null, 'Inspector Laura Kim', 'Frustrating. Ron should have caught this. Corrections tomorrow.'],
  [daysAgo(5), 'Overcast', 63, 48, 6, 'Rough plumbing inspection — PASSED. Framing for kitchen island base. Cabinet measurements taken.', null, null, null, 'Inspector Laura Kim. Cabinet vendor — KraftMaid rep for final measurements.', 'Plumbing passed clean. Cabinets confirmed — 3 week lead time from today.'],
];

westfieldLogs.forEach(l => insertLog.run(3, ...l));

db.close();

console.log('Seeded Harrison & Torres Construction:');
console.log('  4 projects (2 active, 1 on hold, + renovation)');
console.log('  14 subcontractors');
console.log('  18 inspections (passed, failed, conditional, scheduled)');
console.log('  12 RFIs (open, answered, closed)');
console.log('  8 change orders (approved, pending, negotiating)');
console.log('  23 daily logs (last 2 weeks)');
