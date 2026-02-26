import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(__dirname, "..", "data", "vet-clinic.db");

let db: Database.Database | null = null;

// --- Interfaces ---

export interface Veterinarian {
  id: number;
  name: string;
  role: string;
  specialization: string | null;
}

export interface Owner {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  registered_date: string;
  notes: string | null;
}

export interface Patient {
  id: number;
  owner_id: number;
  name: string;
  species: string;
  breed: string;
  sex: string;
  date_of_birth: string;
  weight_lbs: number;
  microchip_id: string | null;
  status: string;
  allergies: string | null;
  notes: string | null;
}

export interface Appointment {
  id: number;
  patient_id: number;
  veterinarian_id: number;
  appointment_datetime: string;
  type: string;
  status: string;
  reason: string;
  weight_lbs: number | null;
  notes: string | null;
}

export interface Vaccination {
  id: number;
  patient_id: number;
  vaccine_name: string;
  date_administered: string;
  next_due_date: string;
  administered_by_id: number;
  lot_number: string;
}

export interface Treatment {
  id: number;
  patient_id: number;
  appointment_id: number | null;
  date: string;
  description: string;
  diagnosis: string | null;
  medications: string | null;
  cost: number;
  paid: boolean;
  veterinarian_id: number;
}

// --- Schema ---

function createTables(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS veterinarians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      specialization TEXT
    );

    CREATE TABLE IF NOT EXISTS owners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      registered_date TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      breed TEXT NOT NULL,
      sex TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      weight_lbs REAL NOT NULL,
      microchip_id TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      allergies TEXT,
      notes TEXT,
      FOREIGN KEY (owner_id) REFERENCES owners(id)
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      veterinarian_id INTEGER NOT NULL,
      appointment_datetime TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Scheduled',
      reason TEXT NOT NULL,
      weight_lbs REAL,
      notes TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id)
    );

    CREATE TABLE IF NOT EXISTS vaccinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      vaccine_name TEXT NOT NULL,
      date_administered TEXT NOT NULL,
      next_due_date TEXT NOT NULL,
      administered_by_id INTEGER NOT NULL,
      lot_number TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (administered_by_id) REFERENCES veterinarians(id)
    );

    CREATE TABLE IF NOT EXISTS treatments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      appointment_id INTEGER,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      diagnosis TEXT,
      medications TEXT,
      cost REAL NOT NULL,
      paid INTEGER NOT NULL DEFAULT 1,
      veterinarian_id INTEGER NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (appointment_id) REFERENCES appointments(id),
      FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id)
    );

    CREATE INDEX IF NOT EXISTS idx_patients_owner ON patients(owner_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(appointment_datetime);
    CREATE INDEX IF NOT EXISTS idx_vaccinations_patient ON vaccinations(patient_id);
    CREATE INDEX IF NOT EXISTS idx_vaccinations_due ON vaccinations(next_due_date);
    CREATE INDEX IF NOT EXISTS idx_treatments_patient ON treatments(patient_id);
  `);
}

// --- Database Access ---

export function getDb(): Database.Database {
  if (db) return db;

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  createTables(db);
  return db;
}

// --- Query Functions ---

export function searchPatients(
  query: string,
  filters?: { species?: string; status?: string }
): (Patient & { owner_name: string; owner_phone: string; owner_email: string })[] {
  const database = getDb();
  const conditions: string[] = [
    "(p.name LIKE @query OR o.name LIKE @query OR p.breed LIKE @query)",
  ];
  const params: Record<string, string> = { query: `%${query}%` };

  if (filters?.species) {
    conditions.push("p.species = @species");
    params.species = filters.species;
  }
  if (filters?.status) {
    conditions.push("p.status = @status");
    params.status = filters.status;
  }

  const sql = `
    SELECT p.*, o.name as owner_name, o.phone as owner_phone, o.email as owner_email
    FROM patients p
    JOIN owners o ON p.owner_id = o.id
    WHERE ${conditions.join(" AND ")}
    ORDER BY p.name ASC
  `;

  return database.prepare(sql).all(params) as (Patient & { owner_name: string; owner_phone: string; owner_email: string })[];
}

export function getPatientRecord(patientId?: number, patientName?: string, ownerName?: string) {
  const database = getDb();

  let patient: (Patient & { owner_name: string; owner_phone: string; owner_email: string; owner_address: string | null }) | undefined;

  if (patientId) {
    patient = database.prepare(`
      SELECT p.*, o.name as owner_name, o.phone as owner_phone, o.email as owner_email, o.address as owner_address
      FROM patients p JOIN owners o ON p.owner_id = o.id
      WHERE p.id = ?
    `).get(patientId) as typeof patient;
  } else if (patientName) {
    const conditions = ["p.name LIKE @name"];
    const params: Record<string, string> = { name: `%${patientName}%` };
    if (ownerName) {
      conditions.push("o.name LIKE @owner");
      params.owner = `%${ownerName}%`;
    }
    patient = database.prepare(`
      SELECT p.*, o.name as owner_name, o.phone as owner_phone, o.email as owner_email, o.address as owner_address
      FROM patients p JOIN owners o ON p.owner_id = o.id
      WHERE ${conditions.join(" AND ")}
      LIMIT 1
    `).get(params) as typeof patient;
  }

  if (!patient) return null;

  const vaccinations = database.prepare(`
    SELECT v.*, vet.name as administered_by
    FROM vaccinations v
    JOIN veterinarians vet ON v.administered_by_id = vet.id
    WHERE v.patient_id = ?
    ORDER BY v.next_due_date ASC
  `).all(patient.id) as (Vaccination & { administered_by: string })[];

  const recentTreatments = database.prepare(`
    SELECT t.*, vet.name as veterinarian
    FROM treatments t
    JOIN veterinarians vet ON t.veterinarian_id = vet.id
    WHERE t.patient_id = ?
    ORDER BY t.date DESC
    LIMIT 10
  `).all(patient.id) as (Treatment & { veterinarian: string })[];

  const upcomingAppointments = database.prepare(`
    SELECT a.*, vet.name as veterinarian
    FROM appointments a
    JOIN veterinarians vet ON a.veterinarian_id = vet.id
    WHERE a.patient_id = ? AND a.appointment_datetime >= datetime('now') AND a.status = 'Scheduled'
    ORDER BY a.appointment_datetime ASC
  `).all(patient.id) as (Appointment & { veterinarian: string })[];

  const weightHistory = database.prepare(`
    SELECT appointment_datetime, weight_lbs
    FROM appointments
    WHERE patient_id = ? AND weight_lbs IS NOT NULL
    ORDER BY appointment_datetime DESC
    LIMIT 10
  `).all(patient.id) as { appointment_datetime: string; weight_lbs: number }[];

  // Compute vaccination status
  const vaccinationsWithStatus = vaccinations.map((v) => {
    const dueDate = new Date(v.next_due_date);
    const now = new Date();
    const fourteenDaysOut = new Date();
    fourteenDaysOut.setDate(fourteenDaysOut.getDate() + 14);

    let status: string;
    if (dueDate < now) {
      status = "Overdue";
    } else if (dueDate <= fourteenDaysOut) {
      status = "Due Soon";
    } else {
      status = "Current";
    }
    return { ...v, status };
  });

  return {
    patient,
    vaccinations: vaccinationsWithStatus,
    recentTreatments,
    upcomingAppointments,
    weightHistory,
  };
}

export function getOverdueVaccinations(includeDueSoon: boolean = true) {
  const database = getDb();

  // Get the latest vaccination per patient per vaccine
  const dueSoonCondition = includeDueSoon
    ? "v.next_due_date <= date('now', '+14 days')"
    : "v.next_due_date < date('now')";

  const sql = `
    SELECT v.*, p.name as patient_name, p.species, p.breed, p.status as patient_status,
           o.name as owner_name, o.phone as owner_phone, o.email as owner_email,
           vet.name as administered_by
    FROM vaccinations v
    JOIN patients p ON v.patient_id = p.id
    JOIN owners o ON p.owner_id = o.id
    JOIN veterinarians vet ON v.administered_by_id = vet.id
    WHERE ${dueSoonCondition}
      AND p.status = 'Active'
      AND v.id = (
        SELECT v2.id FROM vaccinations v2
        WHERE v2.patient_id = v.patient_id AND v2.vaccine_name = v.vaccine_name
        ORDER BY v2.date_administered DESC LIMIT 1
      )
    ORDER BY v.next_due_date ASC
  `;

  const results = database.prepare(sql).all() as (Vaccination & {
    patient_name: string; species: string; breed: string; patient_status: string;
    owner_name: string; owner_phone: string; owner_email: string; administered_by: string;
  })[];

  return results.map((r) => {
    const dueDate = new Date(r.next_due_date);
    const now = new Date();
    return {
      ...r,
      status: dueDate < now ? "Overdue" : "Due Soon",
    };
  });
}

export function getTodaysSchedule(date?: string, veterinarianName?: string) {
  const database = getDb();
  const targetDate = date || new Date().toISOString().split("T")[0];

  const conditions = [
    "date(a.appointment_datetime) = @date",
    "a.status != 'Cancelled'",
  ];
  const params: Record<string, string> = { date: targetDate };

  if (veterinarianName) {
    conditions.push("vet.name LIKE @vet");
    params.vet = `%${veterinarianName}%`;
  }

  const sql = `
    SELECT a.*, vet.name as veterinarian, p.name as patient_name, p.species, p.breed,
           p.allergies, o.name as owner_name, o.phone as owner_phone
    FROM appointments a
    JOIN veterinarians vet ON a.veterinarian_id = vet.id
    JOIN patients p ON a.patient_id = p.id
    JOIN owners o ON p.owner_id = o.id
    WHERE ${conditions.join(" AND ")}
    ORDER BY a.appointment_datetime ASC
  `;

  return database.prepare(sql).all(params) as (Appointment & {
    veterinarian: string; patient_name: string; species: string; breed: string;
    allergies: string | null; owner_name: string; owner_phone: string;
  })[];
}

export function searchTreatments(query: string, patientId?: number) {
  const database = getDb();
  const conditions = [
    "(t.description LIKE @query OR t.diagnosis LIKE @query OR t.medications LIKE @query)",
  ];
  const params: Record<string, string | number> = { query: `%${query}%` };

  if (patientId) {
    conditions.push("t.patient_id = @patientId");
    params.patientId = patientId;
  }

  const sql = `
    SELECT t.*, vet.name as veterinarian, p.name as patient_name, p.species, o.name as owner_name
    FROM treatments t
    JOIN veterinarians vet ON t.veterinarian_id = vet.id
    JOIN patients p ON t.patient_id = p.id
    JOIN owners o ON p.owner_id = o.id
    WHERE ${conditions.join(" AND ")}
    ORDER BY t.date DESC
  `;

  return database.prepare(sql).all(params) as (Treatment & {
    veterinarian: string; patient_name: string; species: string; owner_name: string;
  })[];
}

export function getClinicStats() {
  const database = getDb();

  const totalActive = (database.prepare(
    "SELECT COUNT(*) as count FROM patients WHERE status = 'Active'"
  ).get() as { count: number }).count;

  const appointmentsThisWeek = (database.prepare(`
    SELECT COUNT(*) as count FROM appointments
    WHERE date(appointment_datetime) BETWEEN date('now') AND date('now', '+7 days')
      AND status != 'Cancelled'
  `).get() as { count: number }).count;

  const overdueVaccinations = (database.prepare(`
    SELECT COUNT(DISTINCT v.patient_id || '-' || v.vaccine_name) as count
    FROM vaccinations v
    JOIN patients p ON v.patient_id = p.id
    WHERE v.next_due_date < date('now')
      AND p.status = 'Active'
      AND v.id = (
        SELECT v2.id FROM vaccinations v2
        WHERE v2.patient_id = v.patient_id AND v2.vaccine_name = v.vaccine_name
        ORDER BY v2.date_administered DESC LIMIT 1
      )
  `).get() as { count: number }).count;

  const revenueThisMonth = (database.prepare(`
    SELECT COALESCE(SUM(cost), 0) as total FROM treatments
    WHERE date(date) >= date('now', 'start of month')
  `).get() as { total: number }).total;

  const unpaidThisMonth = (database.prepare(`
    SELECT COALESCE(SUM(cost), 0) as total FROM treatments
    WHERE date(date) >= date('now', 'start of month') AND paid = 0
  `).get() as { total: number }).total;

  const totalAppointments = (database.prepare(
    "SELECT COUNT(*) as count FROM appointments WHERE status IN ('Completed', 'No-Show')"
  ).get() as { count: number }).count;

  const noShows = (database.prepare(
    "SELECT COUNT(*) as count FROM appointments WHERE status = 'No-Show'"
  ).get() as { count: number }).count;

  const noShowRate = totalAppointments > 0 ? ((noShows / totalAppointments) * 100).toFixed(1) : "0.0";

  const speciesBreakdown = database.prepare(`
    SELECT species, COUNT(*) as count FROM patients WHERE status = 'Active' GROUP BY species ORDER BY count DESC
  `).all() as { species: string; count: number }[];

  return {
    total_active_patients: totalActive,
    appointments_this_week: appointmentsThisWeek,
    overdue_vaccinations: overdueVaccinations,
    revenue_this_month: revenueThisMonth,
    outstanding_this_month: unpaidThisMonth,
    no_show_rate: `${noShowRate}%`,
    species_breakdown: Object.fromEntries(speciesBreakdown.map((r) => [r.species, r.count])),
  };
}
