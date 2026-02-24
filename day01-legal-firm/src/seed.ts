import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(__dirname, "..", "data", "legal-firm.db");

function seed(): void {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Drop existing tables and recreate
  db.exec(`
    DROP TABLE IF EXISTS tasks;
    DROP TABLE IF EXISTS cases;
    DROP TABLE IF EXISTS clients;

    CREATE TABLE cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_number TEXT UNIQUE NOT NULL,
      client_name TEXT NOT NULL,
      case_type TEXT NOT NULL,
      status TEXT NOT NULL,
      assigned_attorney TEXT NOT NULL,
      opposing_counsel TEXT,
      court TEXT,
      filed_date TEXT NOT NULL,
      next_hearing_date TEXT,
      next_hearing_type TEXT,
      notes TEXT
    );

    CREATE TABLE tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      assigned_to TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      FOREIGN KEY (case_id) REFERENCES cases(id)
    );

    CREATE TABLE clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      intake_date TEXT NOT NULL
    );
  `);

  // --- Clients (15) ---
  const insertClient = db.prepare(
    "INSERT INTO clients (name, email, phone, address, intake_date) VALUES (?, ?, ?, ?, ?)"
  );

  const clients = [
    ["Rosa Mendez", "rosa.mendez@gmail.com", "213-555-0142", "1420 W 7th St, Los Angeles, CA 90017", "2024-08-15"],
    ["Carlos Ruiz", "cruiz84@yahoo.com", "310-555-0238", "834 S Figueroa St, Los Angeles, CA 90017", "2024-11-02"],
    ["Anh Nguyen", "anh.nguyen@outlook.com", "818-555-0391", "5623 Lankershim Blvd, North Hollywood, CA 91601", "2025-01-10"],
    ["Marcus Williams", "m.williams@protonmail.com", "213-555-0517", "2100 S Central Ave, Los Angeles, CA 90011", "2024-06-20"],
    ["Fatima Al-Hassan", "fatima.alhassan@gmail.com", "310-555-0623", "1905 Wilshire Blvd, Santa Monica, CA 90403", "2025-03-05"],
    ["James O'Brien", "jobrien@lawmail.com", "213-555-0744", "400 S Main St, Los Angeles, CA 90013", "2024-09-30"],
    ["Elena Vasquez", "elena.v@hotmail.com", "818-555-0855", "14329 Victory Blvd, Van Nuys, CA 91401", "2025-06-12"],
    ["Darnell Jackson", "djackson77@gmail.com", "310-555-0968", "3200 W Manchester Blvd, Inglewood, CA 90305", "2024-07-18"],
    ["Priya Sharma", "priya.sharma@techcorp.com", "213-555-1079", "811 W 7th St, Suite 1200, Los Angeles, CA 90017", "2025-09-01"],
    ["Roberto Flores", "r.flores@icloud.com", "818-555-1183", "7421 Van Nuys Blvd, Van Nuys, CA 91405", "2025-04-22"],
    ["Keisha Brown", "keisha.b@gmail.com", "310-555-1294", "1500 W Imperial Hwy, Compton, CA 90220", "2024-12-08"],
    ["Tomoko Sato", "tsato@gmail.com", "213-555-1305", "328 E 1st St, Los Angeles, CA 90012", "2025-07-15"],
    ["Miguel Torres", "mtorres@yahoo.com", "818-555-1416", "6233 Woodman Ave, Van Nuys, CA 91401", "2025-02-14"],
    ["Svetlana Petrov", "s.petrov@outlook.com", "310-555-1527", "2750 Colorado Ave, Santa Monica, CA 90404", "2025-10-03"],
    ["Andre Washington", "a.washington@gmail.com", "213-555-1638", "4500 S Broadway, Los Angeles, CA 90037", "2025-08-20"],
  ];

  const insertClients = db.transaction(() => {
    for (const c of clients) {
      insertClient.run(...c);
    }
  });
  insertClients();

  // --- Cases (20) ---
  const insertCase = db.prepare(`
    INSERT INTO cases (case_number, client_name, case_type, status, assigned_attorney,
      opposing_counsel, court, filed_date, next_hearing_date, next_hearing_type, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const cases = [
    // Immigration - Maria Gutierrez (5 cases)
    ["2025-IM-1001", "Rosa Mendez", "Immigration", "Active", "Maria Gutierrez",
      null, "US Immigration Court - Los Angeles", "2024-09-10",
      "2026-02-25", "Master Calendar Hearing",
      "Asylum case. Client fled Guatemala due to gang threats. Strong country conditions evidence gathered."],
    ["2025-IM-1002", "Carlos Ruiz", "Immigration", "Active", "Maria Gutierrez",
      null, "US Immigration Court - Los Angeles", "2024-11-15",
      "2026-03-10", "Individual Merits Hearing",
      "Cancellation of removal. Client has 12 years continuous presence, 3 US citizen children."],
    ["2025-IM-1003", "Anh Nguyen", "Immigration", "Pending", "Maria Gutierrez",
      null, "US Immigration Court - Los Angeles", "2025-02-01",
      "2026-04-15", "Master Calendar Hearing",
      "Employment-based green card. I-140 approved, waiting for priority date."],
    ["2025-IM-1004", "Fatima Al-Hassan", "Immigration", "Active", "Maria Gutierrez",
      null, "US Immigration Court - Los Angeles", "2025-04-20",
      "2026-02-24", "Bond Hearing",
      "Detained at Adelanto. Bond motion filed. Client has strong community ties and no criminal record."],
    ["2025-IM-1005", "Tomoko Sato", "Immigration", "Closed", "Maria Gutierrez",
      null, "US Immigration Court - Los Angeles", "2025-07-20",
      null, null,
      "H-1B visa petition approved. Case closed successfully."],

    // Personal Injury - David Chen (4 cases)
    ["2025-CV-2001", "Marcus Williams", "Personal Injury", "Active", "David Chen",
      "Robert Kraft, Kraft & Associates", "LA Superior Court - Stanley Mosk", "2024-07-05",
      "2026-02-27", "Motion Hearing",
      "Auto accident on I-10. Client suffered herniated discs L4-L5. Defendant ran red light. Demand letter sent for $450K."],
    ["2025-CV-2002", "Darnell Jackson", "Personal Injury", "Active", "David Chen",
      "Lisa Park, State Farm Legal", "LA Superior Court - Compton", "2024-08-12",
      "2026-03-05", "Deposition",
      "Slip and fall at Ralph's grocery. Torn rotator cuff. Surveillance footage obtained showing wet floor without signage."],
    ["2025-CV-2003", "Priya Sharma", "Personal Injury", "On Hold", "David Chen",
      "Thomas Wright, Wright Defense Group", "Central District of California", "2025-09-15",
      null, null,
      "Workplace injury at tech company. Repetitive stress injury. Workers comp claim filed simultaneously. Case on hold pending WC determination."],
    ["2025-CV-2004", "Svetlana Petrov", "Personal Injury", "Active", "David Chen",
      "Jennifer Adams, Allstate Legal", "LA Superior Court - Santa Monica", "2025-10-20",
      "2026-03-18", "Case Management Conference",
      "Rear-end collision on PCH. Whiplash and concussion. Client still in treatment. MRI results pending."],

    // Family Law - Maria Gutierrez (4 cases)
    ["2025-FL-3001", "Elena Vasquez", "Family Law", "Active", "Maria Gutierrez",
      "Michael Torres, Torres Law", "LA Superior Court - Van Nuys", "2025-06-25",
      "2026-02-26", "Custody Hearing",
      "Contested custody. Client seeking primary custody of 2 children (ages 5 and 8). DV restraining order in place."],
    ["2025-FL-3002", "James O'Brien", "Family Law", "Active", "Maria Gutierrez",
      "Sandra Kim, Kim Family Law", "LA Superior Court - Stanley Mosk", "2024-10-05",
      "2026-03-12", "Settlement Conference",
      "High-asset divorce. Community property includes 2 properties and retirement accounts. Mediation failed."],
    ["2025-FL-3003", "Roberto Flores", "Family Law", "Pending", "Maria Gutierrez",
      null, "LA Superior Court - Van Nuys", "2025-05-01",
      "2026-04-02", "Status Conference",
      "Child support modification. Client lost job, requesting reduction. Current order: $2,400/month."],
    ["2025-FL-3004", "Keisha Brown", "Family Law", "Closed", "Maria Gutierrez",
      "Daniel Park, Park & Associates", "LA Superior Court - Compton", "2024-12-15",
      null, null,
      "Divorce finalized. Settlement agreement reached. Spousal support for 3 years at $1,800/month."],

    // Criminal Defense - Sarah Okafor (4 cases)
    ["2025-CR-4001", "Andre Washington", "Criminal Defense", "Active", "Sarah Okafor",
      "DA Office - ADA Patricia Huang", "LA Superior Court - Spring Street", "2025-08-28",
      "2026-02-23", "Preliminary Hearing",
      "Charged with felony assault. Client claims self-defense. Two witnesses support client's account. Body cam footage requested."],
    ["2025-CR-4002", "Miguel Torres", "Criminal Defense", "Active", "Sarah Okafor",
      "DA Office - ADA Kevin Marshall", "LA Superior Court - Van Nuys", "2025-03-10",
      "2026-03-02", "Trial",
      "DUI with injury. BAC 0.12. Plea deal offered: 120 days + probation. Client considering options."],
    ["2025-CR-4003", "Darnell Jackson", "Criminal Defense", "Active", "Sarah Okafor",
      "DA Office - ADA Rachel Green", "LA Superior Court - Compton", "2025-11-01",
      "2026-02-28", "Arraignment",
      "Drug possession charge. Client has no prior record. Diversion program eligibility being assessed."],
    ["2025-CR-4004", "Carlos Ruiz", "Criminal Defense", "Closed", "Sarah Okafor",
      "DA Office - ADA James Wilson", "LA Superior Court - Spring Street", "2025-01-15",
      null, null,
      "Misdemeanor theft charge. Case dismissed after completion of community service program."],

    // Civil Litigation - David Chen (3 cases)
    ["2025-CV-5001", "Priya Sharma", "Civil Litigation", "Active", "David Chen",
      "Amanda Foster, BigTech Legal", "Central District of California", "2025-09-30",
      "2026-03-20", "Summary Judgment Hearing",
      "Employment discrimination suit. Client alleges wrongful termination based on national origin. EEOC right-to-sue letter obtained."],
    ["2025-CV-5002", "James O'Brien", "Civil Litigation", "Active", "David Chen",
      "Richard Steele, Steele Partners LLP", "LA Superior Court - Stanley Mosk", "2024-10-15",
      "2026-02-25", "Discovery Deadline",
      "Breach of contract. Client's former business partner diverted $380K in company funds. Forensic accounting report obtained."],
    ["2025-CV-5003", "Tomoko Sato", "Civil Litigation", "Pending", "David Chen",
      "Brian Walsh, Walsh & Co.", "LA Superior Court - Spring Street", "2025-12-01",
      "2026-04-10", "Initial Case Management Conference",
      "Landlord-tenant dispute. Client's commercial lease terminated without proper notice. Seeking damages for business losses."],
  ];

  const insertCases = db.transaction(() => {
    for (const c of cases) {
      insertCase.run(...c);
    }
  });
  insertCases();

  // --- Tasks (~40) ---
  const insertTask = db.prepare(
    "INSERT INTO tasks (case_id, description, assigned_to, due_date, status, priority) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const tasks = [
    // Case 1: Rosa Mendez - Immigration Asylum
    [1, "Prepare country conditions brief for Guatemala", "Maria Gutierrez", "2026-02-23", "In Progress", "High"],
    [1, "Gather client's personal declaration updates", "Jamie Reeves", "2026-02-20", "Complete", "High"],
    [1, "File updated witness list with court", "Jamie Reeves", "2026-02-24", "Pending", "High"],
    [1, "Schedule expert witness for hearing", "Maria Gutierrez", "2026-02-22", "In Progress", "Medium"],

    // Case 2: Carlos Ruiz - Immigration
    [2, "Compile continuous presence evidence (utility bills, tax returns)", "Jamie Reeves", "2026-02-18", "Pending", "High"],
    [2, "Draft hardship declaration for qualifying relatives", "Maria Gutierrez", "2026-03-01", "Pending", "High"],
    [2, "Obtain children's school records", "Jamie Reeves", "2026-02-28", "In Progress", "Medium"],

    // Case 3: Anh Nguyen - Immigration
    [3, "Monitor visa bulletin for priority date", "Jamie Reeves", "2026-03-01", "Pending", "Low"],
    [3, "Prepare I-485 application packet", "Maria Gutierrez", "2026-03-15", "Pending", "Medium"],

    // Case 4: Fatima Al-Hassan - Immigration Bond
    [4, "Prepare bond motion supporting documents", "Maria Gutierrez", "2026-02-23", "In Progress", "High"],
    [4, "Collect community ties letters from family and employer", "Jamie Reeves", "2026-02-19", "Complete", "High"],
    [4, "File bond motion with immigration court", "Maria Gutierrez", "2026-02-23", "Pending", "High"],

    // Case 6: Marcus Williams - Personal Injury
    [6, "Review updated medical records from UCLA Medical", "David Chen", "2026-02-15", "Pending", "High"],
    [6, "Prepare motion in limine to exclude prior injury records", "David Chen", "2026-02-25", "In Progress", "High"],
    [6, "Send interrogatories to defendant", "Jamie Reeves", "2026-02-10", "Complete", "Medium"],

    // Case 7: Darnell Jackson - Personal Injury
    [7, "Subpoena Ralph's incident report and employee records", "Jamie Reeves", "2026-02-20", "Pending", "High"],
    [7, "Schedule client's IME with Dr. Patterson", "Jamie Reeves", "2026-03-01", "Pending", "Medium"],
    [7, "Review surveillance footage and prepare exhibit list", "David Chen", "2026-02-26", "In Progress", "High"],

    // Case 8: Priya Sharma - PI (On Hold)
    [8, "Follow up on workers comp determination status", "Jamie Reeves", "2026-02-14", "Pending", "Low"],

    // Case 9: Svetlana Petrov - Personal Injury
    [9, "Request MRI results from Santa Monica Imaging", "Jamie Reeves", "2026-02-28", "Pending", "High"],
    [9, "Draft initial demand letter", "David Chen", "2026-03-15", "Pending", "Medium"],

    // Case 10: Elena Vasquez - Family Law
    [10, "Prepare custody evaluation questionnaire responses", "Maria Gutierrez", "2026-02-24", "In Progress", "High"],
    [10, "Compile evidence of client's parenting involvement", "Jamie Reeves", "2026-02-22", "Complete", "High"],
    [10, "Draft proposed parenting plan", "Maria Gutierrez", "2026-02-25", "Pending", "High"],

    // Case 11: James O'Brien - Family Law
    [11, "Obtain property appraisals for Malibu and Silver Lake homes", "Jamie Reeves", "2026-03-01", "In Progress", "High"],
    [11, "Review retirement account QDRO documents", "Maria Gutierrez", "2026-03-05", "Pending", "Medium"],

    // Case 12: Roberto Flores - Family Law
    [12, "Gather documentation of client's job loss", "Jamie Reeves", "2026-03-15", "Pending", "Medium"],
    [12, "Draft child support modification motion", "Maria Gutierrez", "2026-03-20", "Pending", "Medium"],

    // Case 14: Andre Washington - Criminal Defense
    [14, "File motion to compel body camera footage", "Sarah Okafor", "2026-02-18", "Pending", "High"],
    [14, "Interview defense witnesses (2 remaining)", "Sarah Okafor", "2026-02-22", "In Progress", "High"],
    [14, "Prepare cross-examination outline for preliminary hearing", "Sarah Okafor", "2026-02-22", "Pending", "High"],

    // Case 15: Miguel Torres - Criminal Defense
    [15, "Review plea deal terms and prepare comparison chart", "Sarah Okafor", "2026-02-25", "Pending", "High"],
    [15, "Obtain client's employment records for mitigation", "Jamie Reeves", "2026-02-20", "Pending", "Medium"],
    [15, "Schedule meeting with client to discuss plea options", "Sarah Okafor", "2026-02-24", "Pending", "High"],

    // Case 16: Darnell Jackson - Criminal Defense
    [16, "Research diversion program eligibility requirements", "Sarah Okafor", "2026-02-26", "Pending", "High"],
    [16, "Prepare arraignment appearance documents", "Jamie Reeves", "2026-02-27", "Pending", "High"],

    // Case 18: Priya Sharma - Civil Litigation
    [18, "Prepare opposition to defendant's summary judgment motion", "David Chen", "2026-03-10", "Pending", "High"],
    [18, "Compile EEOC complaint file and correspondence", "Jamie Reeves", "2026-02-12", "Complete", "Medium"],

    // Case 19: James O'Brien - Civil Litigation
    [19, "Review forensic accounting report and flag discrepancies", "David Chen", "2026-02-24", "In Progress", "High"],
    [19, "Serve document production requests by discovery deadline", "Jamie Reeves", "2026-02-25", "In Progress", "High"],
    [19, "Depose former business partner", "David Chen", "2026-03-10", "Pending", "High"],

    // Case 20: Tomoko Sato - Civil Litigation
    [20, "Draft complaint and file with court", "David Chen", "2026-03-01", "Pending", "Medium"],
    [20, "Calculate business loss damages estimate", "Jamie Reeves", "2026-03-05", "Pending", "Medium"],
  ];

  const insertTasks = db.transaction(() => {
    for (const t of tasks) {
      insertTask.run(...t);
    }
  });
  insertTasks();

  console.log("Database seeded successfully!");
  console.log(`  - ${clients.length} clients`);
  console.log(`  - ${cases.length} cases`);
  console.log(`  - ${tasks.length} tasks`);
  console.log(`  Database location: ${DB_PATH}`);

  db.close();
}

seed();
