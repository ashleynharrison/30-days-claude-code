import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(__dirname, "..", "data", "vet-clinic.db");
const dataDir = path.dirname(DB_PATH);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Delete existing DB
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// --- Create Tables ---

db.exec(`
  CREATE TABLE veterinarians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    specialization TEXT
  );

  CREATE TABLE owners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    registered_date TEXT NOT NULL,
    notes TEXT
  );

  CREATE TABLE patients (
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

  CREATE TABLE appointments (
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

  CREATE TABLE vaccinations (
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

  CREATE TABLE treatments (
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

  CREATE INDEX idx_patients_owner ON patients(owner_id);
  CREATE INDEX idx_appointments_patient ON appointments(patient_id);
  CREATE INDEX idx_appointments_datetime ON appointments(appointment_datetime);
  CREATE INDEX idx_vaccinations_patient ON vaccinations(patient_id);
  CREATE INDEX idx_vaccinations_due ON vaccinations(next_due_date);
  CREATE INDEX idx_treatments_patient ON treatments(patient_id);
`);

// --- Helpers ---

function randomDate(start: string, end: string): string {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return new Date(s + Math.random() * (e - s)).toISOString().split("T")[0];
}

function randomTime(startHour: number, endHour: number): string {
  const hour = startHour + Math.floor(Math.random() * (endHour - startHour));
  const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function lotNumber(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return `${pick([...letters])}${pick([...letters])}${Math.floor(1000 + Math.random() * 9000)}`;
}

function microchip(): string {
  return `985${Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("")}`;
}

// --- Seed Veterinarians ---

const insertVet = db.prepare("INSERT INTO veterinarians (name, role, specialization) VALUES (?, ?, ?)");
insertVet.run("Dr. Lisa Huang", "Veterinarian", "Small Animal Surgery");
insertVet.run("Dr. Marcus Webb", "Veterinarian", "Internal Medicine");
insertVet.run("Samantha Cruz", "Veterinary Technician", null);

const VET_HUANG = 1;
const VET_WEBB = 2;
const TECH_CRUZ = 3;

// --- Seed Owners (25) ---

const insertOwner = db.prepare(
  "INSERT INTO owners (name, email, phone, address, registered_date, notes) VALUES (?, ?, ?, ?, ?, ?)"
);

const owners = [
  ["Sofia Ramirez", "sofia.ramirez@email.com", "(310) 555-0142", "4521 Sunset Blvd, Los Angeles, CA 90027", "2022-03-15", "Prefers text reminders"],
  ["James Chen", "james.chen@email.com", "(323) 555-0198", "1200 N Highland Ave, Los Angeles, CA 90038", "2021-08-22", null],
  ["Taylor Washington", "taylor.w@email.com", "(818) 555-0267", "15632 Ventura Blvd, Encino, CA 91436", "2023-01-10", "Always late — schedule 15 min early"],
  ["Priya Patel", "priya.patel@email.com", "(310) 555-0311", "842 S Robertson Blvd, Los Angeles, CA 90035", "2020-11-05", null],
  ["Marcus Johnson", "marcus.j@email.com", "(213) 555-0423", "3301 W 6th St, Los Angeles, CA 90020", "2022-07-18", null],
  ["Emily Nakamura", "emily.nak@email.com", "(626) 555-0587", "225 S Lake Ave, Pasadena, CA 91101", "2021-04-30", "Multiple pets — prefers back-to-back appointments"],
  ["David Okafor", "david.okafor@email.com", "(310) 555-0634", "1100 Wilshire Blvd, Santa Monica, CA 90401", "2023-06-12", null],
  ["Jessica Martinez", "jess.martinez@email.com", "(818) 555-0721", "4800 Laurel Canyon Blvd, Valley Village, CA 91607", "2022-09-03", null],
  ["Ryan Kim", "ryan.kim@email.com", "(213) 555-0845", "600 S Spring St, Los Angeles, CA 90014", "2024-02-14", null],
  ["Amanda Torres", "amanda.t@email.com", "(323) 555-0912", "2745 Griffith Park Blvd, Los Angeles, CA 90027", "2021-12-01", "Nervous about vet visits — extra patience needed"],
  ["Chris Nguyen", "chris.nguyen@email.com", "(310) 555-1023", "11925 W Olympic Blvd, Los Angeles, CA 90064", "2023-03-28", null],
  ["Olivia Brown", "olivia.b@email.com", "(818) 555-1134", "22400 Ventura Blvd, Woodland Hills, CA 91364", "2020-06-17", null],
  ["Daniel Garcia", "daniel.garcia@email.com", "(626) 555-1245", "900 E Colorado Blvd, Pasadena, CA 91101", "2022-11-20", "No-show 3x — confirm appointments day before"],
  ["Samantha Lee", "sam.lee@email.com", "(213) 555-1356", "523 W 7th St, Los Angeles, CA 90014", "2024-06-08", null],
  ["Michael Thompson", "michael.t@email.com", "(310) 555-1467", "1554 S Sepulveda Blvd, Los Angeles, CA 90025", "2021-01-25", null],
  ["Rachel Hernandez", "rachel.h@email.com", "(323) 555-1578", "3850 W 1st St, Los Angeles, CA 90004", "2023-08-14", null],
  ["Kevin Yamamoto", "kevin.yama@email.com", "(818) 555-1689", "12500 Riverside Dr, Valley Village, CA 91607", "2022-04-09", null],
  ["Lauren Mitchell", "lauren.m@email.com", "(310) 555-1790", "2600 Abbot Kinney Blvd, Venice, CA 90291", "2024-01-22", null],
  ["Alex Petrov", "alex.petrov@email.com", "(213) 555-1801", "1800 Argyle Ave, Los Angeles, CA 90028", "2023-10-05", null],
  ["Megan Clark", "megan.clark@email.com", "(626) 555-1912", "480 N Lake Ave, Pasadena, CA 91101", "2021-09-15", null],
  ["Brandon Scott", "brandon.s@email.com", "(310) 555-2023", "3200 Motor Ave, Los Angeles, CA 90034", "2022-12-30", null],
  ["Natalie Rivera", "natalie.r@email.com", "(818) 555-2134", "18300 Burbank Blvd, Tarzana, CA 91356", "2024-04-17", null],
  ["Jason Park", "jason.park@email.com", "(323) 555-2245", "1950 Hillhurst Ave, Los Angeles, CA 90027", "2023-05-21", null],
  ["Stephanie Adams", "steph.adams@email.com", "(310) 555-2356", "4050 Lincoln Blvd, Marina del Rey, CA 90292", "2020-02-10", null],
  ["Tyler Reed", "tyler.reed@email.com", "(213) 555-2467", "720 S Olive St, Los Angeles, CA 90014", "2024-09-01", "New client — referred by Priya Patel"],
];

for (const o of owners) {
  insertOwner.run(...o);
}

// --- Seed Patients (35) ---

const insertPatient = db.prepare(
  "INSERT INTO patients (owner_id, name, species, breed, sex, date_of_birth, weight_lbs, microchip_id, status, allergies, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

interface PatientSeed {
  owner_id: number;
  name: string;
  species: string;
  breed: string;
  sex: string;
  dob: string;
  weight: number;
  chip: string | null;
  status: string;
  allergies: string | null;
  notes: string | null;
}

const patients: PatientSeed[] = [
  // Sofia Ramirez (owner 1) — cat with penicillin allergy
  { owner_id: 1, name: "Luna", species: "Cat", breed: "Siamese Mix", sex: "Spayed Female", dob: "2020-05-12", weight: 9.2, chip: microchip(), status: "Active", allergies: "Penicillin", notes: "ALLERGY: Penicillin — use Clavamox alternatives only" },
  // James Chen (owner 2)
  { owner_id: 2, name: "Biscuit", species: "Dog", breed: "Golden Retriever", sex: "Neutered Male", dob: "2019-03-20", weight: 72.5, chip: microchip(), status: "Active", allergies: null, notes: null },
  // Taylor Washington (owner 3) — no-show pattern owner
  { owner_id: 3, name: "Coco", species: "Dog", breed: "French Bulldog", sex: "Spayed Female", dob: "2021-11-08", weight: 24.3, chip: microchip(), status: "Active", allergies: null, notes: "Owner frequently no-shows — always confirm day before" },
  // Priya Patel (owner 4) — senior dog with chronic conditions
  { owner_id: 4, name: "Duke", species: "Dog", breed: "Labrador Retriever", sex: "Neutered Male", dob: "2012-01-15", weight: 68.0, chip: microchip(), status: "Active", allergies: null, notes: "Senior — arthritis (both hips), hypothyroid, lipoma right flank. Monthly bloodwork and Rimadyl refills." },
  // Marcus Johnson (owner 5) — puppy with first-year vaccines
  { owner_id: 5, name: "Mochi", species: "Dog", breed: "Goldendoodle", sex: "Male", dob: "2025-09-10", weight: 18.5, chip: null, status: "Active", allergies: null, notes: "Puppy — first-year vaccination schedule in progress" },
  // Emily Nakamura (owner 6) — 4 pets
  { owner_id: 6, name: "Pepper", species: "Cat", breed: "Maine Coon", sex: "Neutered Male", dob: "2018-07-22", weight: 16.8, chip: microchip(), status: "Active", allergies: null, notes: null },
  { owner_id: 6, name: "Ginger", species: "Cat", breed: "Domestic Shorthair", sex: "Spayed Female", dob: "2020-02-14", weight: 10.1, chip: microchip(), status: "Active", allergies: null, notes: "Rescue — shy at vet" },
  { owner_id: 6, name: "Tofu", species: "Rabbit", breed: "Holland Lop", sex: "Neutered Male", dob: "2022-04-30", weight: 4.2, chip: null, status: "Active", allergies: null, notes: null },
  { owner_id: 6, name: "Kiwi", species: "Bird", breed: "Cockatiel", sex: "Male", dob: "2021-06-15", weight: 0.2, chip: null, status: "Active", allergies: null, notes: "Clip wings every 3 months" },
  // David Okafor (owner 7)
  { owner_id: 7, name: "Zeus", species: "Dog", breed: "German Shepherd", sex: "Neutered Male", dob: "2020-09-03", weight: 85.0, chip: microchip(), status: "Active", allergies: "Chicken protein", notes: "Grain-free diet — chicken allergy" },
  // Jessica Martinez (owner 8) — emergency surgery pet
  { owner_id: 8, name: "Bella", species: "Dog", breed: "Pit Bull Mix", sex: "Spayed Female", dob: "2019-12-25", weight: 55.3, chip: microchip(), status: "Active", allergies: null, notes: "Recent emergency surgery — GDV (bloat) on 2026-02-10. Recovering well." },
  // Ryan Kim (owner 9)
  { owner_id: 9, name: "Nori", species: "Cat", breed: "Scottish Fold", sex: "Spayed Female", dob: "2022-08-19", weight: 8.7, chip: microchip(), status: "Active", allergies: null, notes: null },
  // Amanda Torres (owner 10)
  { owner_id: 10, name: "Bear", species: "Dog", breed: "Bernese Mountain Dog", sex: "Neutered Male", dob: "2021-03-11", weight: 105.2, chip: microchip(), status: "Active", allergies: null, notes: "Anxious — needs gentle handling" },
  // Chris Nguyen (owner 11)
  { owner_id: 11, name: "Miso", species: "Cat", breed: "Ragdoll", sex: "Neutered Male", dob: "2023-01-05", weight: 12.4, chip: microchip(), status: "Active", allergies: null, notes: null },
  // Olivia Brown (owner 12)
  { owner_id: 12, name: "Daisy", species: "Dog", breed: "Cavalier King Charles Spaniel", sex: "Spayed Female", dob: "2020-06-30", weight: 15.8, chip: microchip(), status: "Active", allergies: null, notes: "Heart murmur — Grade 2. Annual cardiac echo." },
  // Daniel Garcia (owner 13) — no-show owner
  { owner_id: 13, name: "Rocky", species: "Dog", breed: "Chihuahua Mix", sex: "Neutered Male", dob: "2019-10-14", weight: 8.5, chip: microchip(), status: "Active", allergies: null, notes: "Owner has missed 3 appointments" },
  // Samantha Lee (owner 14)
  { owner_id: 14, name: "Willow", species: "Cat", breed: "Bengal", sex: "Spayed Female", dob: "2021-09-22", weight: 11.0, chip: microchip(), status: "Active", allergies: null, notes: null },
  // Michael Thompson (owner 15)
  { owner_id: 15, name: "Cooper", species: "Dog", breed: "Australian Shepherd", sex: "Neutered Male", dob: "2022-02-28", weight: 52.0, chip: microchip(), status: "Active", allergies: null, notes: null },
  // Rachel Hernandez (owner 16)
  { owner_id: 16, name: "Loki", species: "Dog", breed: "Husky Mix", sex: "Neutered Male", dob: "2021-05-18", weight: 58.7, chip: microchip(), status: "Active", allergies: null, notes: "Escape artist — double-check carrier latches" },
  // Kevin Yamamoto (owner 17) — bearded dragon
  { owner_id: 17, name: "Spike", species: "Reptile", breed: "Bearded Dragon", sex: "Male", dob: "2023-03-10", weight: 1.1, chip: null, status: "Active", allergies: null, notes: "Exotic — schedule with Dr. Webb only" },
  // Lauren Mitchell (owner 18)
  { owner_id: 18, name: "Rosie", species: "Dog", breed: "Labradoodle", sex: "Spayed Female", dob: "2023-07-04", weight: 45.0, chip: microchip(), status: "Active", allergies: null, notes: null },
  // Alex Petrov (owner 19)
  { owner_id: 19, name: "Shadow", species: "Cat", breed: "Russian Blue", sex: "Neutered Male", dob: "2019-11-30", weight: 13.5, chip: microchip(), status: "Active", allergies: null, notes: null },
  // Megan Clark (owner 20)
  { owner_id: 20, name: "Oakley", species: "Dog", breed: "Golden Retriever Mix", sex: "Neutered Male", dob: "2020-08-12", weight: 67.3, chip: microchip(), status: "Active", allergies: null, notes: "Rescue — fearful of loud noises" },
  // Brandon Scott (owner 21)
  { owner_id: 21, name: "Beans", species: "Cat", breed: "Tuxedo Domestic Shorthair", sex: "Neutered Male", dob: "2022-10-31", weight: 11.8, chip: microchip(), status: "Active", allergies: null, notes: null },
  // Natalie Rivera (owner 22)
  { owner_id: 22, name: "Hazel", species: "Dog", breed: "Dachshund", sex: "Spayed Female", dob: "2021-12-20", weight: 12.0, chip: microchip(), status: "Active", allergies: null, notes: "IVDD risk — no jumping" },
  // Jason Park (owner 23)
  { owner_id: 23, name: "Simba", species: "Cat", breed: "Orange Tabby", sex: "Neutered Male", dob: "2020-04-01", weight: 14.2, chip: microchip(), status: "Active", allergies: null, notes: "Overweight — on diet plan" },
  // Stephanie Adams (owner 24) — deceased pet
  { owner_id: 24, name: "Max", species: "Dog", breed: "Beagle", sex: "Neutered Male", dob: "2010-06-15", weight: 28.0, chip: microchip(), status: "Deceased", allergies: null, notes: "Passed 2025-11-20. Lymphoma. RIP." },
  { owner_id: 24, name: "Penny", species: "Dog", breed: "Beagle Mix", sex: "Spayed Female", dob: "2023-09-01", weight: 22.5, chip: microchip(), status: "Active", allergies: null, notes: "Adopted after Max passed" },
  // Tyler Reed (owner 25)
  { owner_id: 25, name: "Olive", species: "Dog", breed: "French Bulldog", sex: "Spayed Female", dob: "2024-03-15", weight: 20.1, chip: microchip(), status: "Active", allergies: null, notes: "New patient — transferred from VCA West LA" },
  // Extra pets for Emily Nakamura — she already has 4 above
  // Additional patients to reach 35
  { owner_id: 3, name: "Bruno", species: "Dog", breed: "Boxer Mix", sex: "Neutered Male", dob: "2020-07-22", weight: 62.0, chip: microchip(), status: "Active", allergies: null, notes: null },
  { owner_id: 5, name: "Nala", species: "Cat", breed: "Abyssinian", sex: "Spayed Female", dob: "2023-04-18", weight: 8.0, chip: microchip(), status: "Active", allergies: null, notes: null },
  { owner_id: 9, name: "Taro", species: "Dog", breed: "Shiba Inu", sex: "Neutered Male", dob: "2022-11-05", weight: 23.0, chip: microchip(), status: "Active", allergies: null, notes: "Dramatic at nail trims" },
  { owner_id: 12, name: "Peanut", species: "Dog", breed: "Pomeranian", sex: "Male", dob: "2024-06-20", weight: 5.5, chip: null, status: "Active", allergies: null, notes: "Puppy" },
  { owner_id: 16, name: "Sage", species: "Rabbit", breed: "Mini Rex", sex: "Spayed Female", dob: "2023-08-10", weight: 3.8, chip: null, status: "Active", allergies: null, notes: null },
  { owner_id: 21, name: "Mocha", species: "Dog", breed: "Cockapoo", sex: "Spayed Female", dob: "2022-05-14", weight: 18.0, chip: microchip(), status: "Active", allergies: null, notes: null },
];

for (const p of patients) {
  insertPatient.run(p.owner_id, p.name, p.species, p.breed, p.sex, p.dob, p.weight, p.chip, p.status, p.allergies, p.notes);
}

// --- Seed Appointments (80+) ---

const insertAppt = db.prepare(
  "INSERT INTO appointments (patient_id, veterinarian_id, appointment_datetime, type, status, reason, weight_lbs, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);

interface ApptSeed {
  patient_id: number;
  vet_id: number;
  datetime: string;
  type: string;
  status: string;
  reason: string;
  weight: number | null;
  notes: string | null;
}

const apptTypes = ["Wellness Exam", "Vaccination", "Sick Visit", "Surgery", "Dental Cleaning", "Follow-Up", "Emergency"];

// Helper to generate appointment datetime
function apptDatetime(date: string, time: string): string {
  return `${date}T${time}`;
}

const appointments: ApptSeed[] = [
  // --- Senior dog Duke (patient 4) — frequent visits ---
  { patient_id: 4, vet_id: VET_WEBB, datetime: apptDatetime("2025-08-15", "09:00:00"), type: "Wellness Exam", status: "Completed", reason: "Senior wellness check — 6 month", weight: 70.2, notes: "Arthritis stable. Continuing Rimadyl. Lipoma unchanged at 3cm." },
  { patient_id: 4, vet_id: VET_WEBB, datetime: apptDatetime("2025-09-12", "10:30:00"), type: "Follow-Up", status: "Completed", reason: "Bloodwork recheck — thyroid levels", weight: 69.8, notes: "T4 levels normalized on Soloxine. Continue current dose." },
  { patient_id: 4, vet_id: VET_WEBB, datetime: apptDatetime("2025-10-20", "09:00:00"), type: "Sick Visit", status: "Completed", reason: "Limping on left hind leg", weight: 69.5, notes: "Increased arthritis inflammation. Added Gabapentin 100mg BID." },
  { patient_id: 4, vet_id: VET_WEBB, datetime: apptDatetime("2025-11-18", "11:00:00"), type: "Follow-Up", status: "Completed", reason: "Arthritis follow-up + bloodwork", weight: 68.3, notes: "Responding well to Gabapentin. Liver values slightly elevated — monitor." },
  { patient_id: 4, vet_id: VET_WEBB, datetime: apptDatetime("2025-12-15", "09:30:00"), type: "Follow-Up", status: "Completed", reason: "Monthly bloodwork", weight: 68.0, notes: "Liver values stable. Weight loss intentional per diet plan." },
  { patient_id: 4, vet_id: VET_WEBB, datetime: apptDatetime("2026-01-19", "10:00:00"), type: "Follow-Up", status: "Completed", reason: "Monthly bloodwork + Rimadyl refill", weight: 67.5, notes: "All values within normal limits. Good energy for his age." },
  { patient_id: 4, vet_id: VET_WEBB, datetime: apptDatetime("2026-02-16", "09:00:00"), type: "Wellness Exam", status: "Completed", reason: "Annual senior wellness exam", weight: 68.0, notes: "Overall stable. Lipoma now 3.5cm — aspirate if grows further. Dental grade 2." },
  { patient_id: 4, vet_id: VET_WEBB, datetime: apptDatetime("2026-03-16", "10:00:00"), type: "Follow-Up", status: "Scheduled", reason: "Monthly bloodwork", weight: null, notes: null },

  // --- Bella (patient 11) — emergency surgery ---
  { patient_id: 11, vet_id: VET_HUANG, datetime: apptDatetime("2026-02-10", "18:30:00"), type: "Emergency", status: "Completed", reason: "GDV (bloat) — acute abdomen, distended", weight: 55.3, notes: "Emergency gastropexy performed. Spleen intact. Recovered well post-op." },
  { patient_id: 11, vet_id: VET_HUANG, datetime: apptDatetime("2026-02-13", "09:00:00"), type: "Follow-Up", status: "Completed", reason: "Post-surgery check — day 3", weight: 53.8, notes: "Incision clean. Eating small meals. Continue antibiotics." },
  { patient_id: 11, vet_id: VET_HUANG, datetime: apptDatetime("2026-02-20", "10:00:00"), type: "Follow-Up", status: "Completed", reason: "Post-surgery check — day 10", weight: 54.5, notes: "Healing well. Suture removal. Resume normal activity in 1 week." },
  { patient_id: 11, vet_id: VET_HUANG, datetime: apptDatetime("2026-03-10", "09:30:00"), type: "Follow-Up", status: "Scheduled", reason: "1-month post-surgery recheck", weight: null, notes: null },

  // --- Daniel Garcia's Rocky (patient 16) — no-show pattern ---
  { patient_id: 16, vet_id: VET_HUANG, datetime: apptDatetime("2025-10-05", "14:00:00"), type: "Wellness Exam", status: "No-Show", reason: "Annual wellness exam", weight: null, notes: null },
  { patient_id: 16, vet_id: VET_HUANG, datetime: apptDatetime("2025-11-12", "11:00:00"), type: "Vaccination", status: "No-Show", reason: "Rabies booster — overdue", weight: null, notes: null },
  { patient_id: 16, vet_id: VET_WEBB, datetime: apptDatetime("2025-12-20", "10:00:00"), type: "Vaccination", status: "No-Show", reason: "Rabies booster — rescheduled", weight: null, notes: null },
  { patient_id: 16, vet_id: VET_HUANG, datetime: apptDatetime("2026-01-28", "14:30:00"), type: "Vaccination", status: "Completed", reason: "Rabies booster — finally came in", weight: 8.5, notes: "Owner apologized for missed appointments. Rabies administered." },

  // --- Puppy Mochi (patient 5) — first-year vaccine schedule ---
  { patient_id: 5, vet_id: VET_HUANG, datetime: apptDatetime("2025-11-15", "09:00:00"), type: "Wellness Exam", status: "Completed", reason: "First puppy visit — 8 weeks", weight: 8.2, notes: "Healthy puppy. Started DHPP series." },
  { patient_id: 5, vet_id: VET_HUANG, datetime: apptDatetime("2025-12-13", "09:00:00"), type: "Vaccination", status: "Completed", reason: "DHPP #2 + Bordetella", weight: 12.0, notes: "Growing well. No adverse reactions." },
  { patient_id: 5, vet_id: VET_HUANG, datetime: apptDatetime("2026-01-10", "09:00:00"), type: "Vaccination", status: "Completed", reason: "DHPP #3 + Leptospirosis #1", weight: 15.5, notes: "On track with schedule." },
  { patient_id: 5, vet_id: VET_HUANG, datetime: apptDatetime("2026-02-07", "09:00:00"), type: "Vaccination", status: "Completed", reason: "DHPP #4 (final) + Lepto #2 + Rabies", weight: 18.5, notes: "Completed initial DHPP series. Rabies administered. Schedule neuter consult." },
  { patient_id: 5, vet_id: VET_HUANG, datetime: apptDatetime("2026-03-14", "10:00:00"), type: "Wellness Exam", status: "Scheduled", reason: "6-month puppy check + neuter consult", weight: null, notes: null },

  // --- Luna (patient 1) — cat with allergy ---
  { patient_id: 1, vet_id: VET_HUANG, datetime: apptDatetime("2025-09-05", "11:00:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness exam", weight: 9.0, notes: "Healthy. FVRCP booster given. REMINDER: Penicillin allergy." },
  { patient_id: 1, vet_id: VET_HUANG, datetime: apptDatetime("2026-01-22", "14:00:00"), type: "Sick Visit", status: "Completed", reason: "Vomiting x 2 days, lethargy", weight: 8.8, notes: "Mild gastritis. Prescribed Cerenia + bland diet. NO penicillin-class antibiotics." },
  { patient_id: 1, vet_id: VET_HUANG, datetime: apptDatetime("2026-02-05", "10:30:00"), type: "Follow-Up", status: "Completed", reason: "Gastritis follow-up", weight: 9.2, notes: "Resolved. Eating normally. Weight back up." },

  // --- Biscuit (patient 2) ---
  { patient_id: 2, vet_id: VET_WEBB, datetime: apptDatetime("2025-09-18", "10:00:00"), type: "Dental Cleaning", status: "Completed", reason: "Annual dental cleaning", weight: 73.0, notes: "Grade 1 dental disease. Full cleaning done. No extractions needed." },
  { patient_id: 2, vet_id: VET_WEBB, datetime: apptDatetime("2026-03-18", "10:00:00"), type: "Wellness Exam", status: "Scheduled", reason: "Annual wellness exam", weight: null, notes: null },

  // --- Coco (patient 3) ---
  { patient_id: 3, vet_id: VET_HUANG, datetime: apptDatetime("2025-10-30", "13:00:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness exam", weight: 24.3, notes: "Brachycephalic — monitor breathing. Weight stable." },
  { patient_id: 3, vet_id: VET_HUANG, datetime: apptDatetime("2026-02-18", "14:00:00"), type: "Sick Visit", status: "Completed", reason: "Skin irritation — belly rash", weight: 25.0, notes: "Contact dermatitis. Prescribed Apoquel 16mg daily x 14 days." },

  // --- Zeus (patient 10) ---
  { patient_id: 10, vet_id: VET_WEBB, datetime: apptDatetime("2025-11-05", "08:30:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness exam + vaccines", weight: 84.5, notes: "Healthy. DHPP and Bordetella boosters given." },
  { patient_id: 10, vet_id: VET_WEBB, datetime: apptDatetime("2026-02-24", "15:00:00"), type: "Sick Visit", status: "Completed", reason: "Ear scratching, head shaking x 1 week", weight: 85.0, notes: "Bilateral otitis externa. Prescribed Otomax drops BID x 14 days." },

  // --- Pepper (patient 6) ---
  { patient_id: 6, vet_id: VET_HUANG, datetime: apptDatetime("2025-10-15", "09:30:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness exam", weight: 16.5, notes: "Healthy senior cat. Bloodwork normal." },

  // --- Ginger (patient 7) ---
  { patient_id: 7, vet_id: VET_HUANG, datetime: apptDatetime("2025-11-20", "10:00:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness exam", weight: 10.0, notes: "Stressed during exam but healthy." },

  // --- Tofu (patient 8) ---
  { patient_id: 8, vet_id: VET_WEBB, datetime: apptDatetime("2025-12-05", "11:00:00"), type: "Wellness Exam", status: "Completed", reason: "Rabbit wellness exam", weight: 4.2, notes: "Teeth good. Nails trimmed. GI sounds normal." },

  // --- Kiwi (patient 9) ---
  { patient_id: 9, vet_id: VET_WEBB, datetime: apptDatetime("2026-01-15", "11:00:00"), type: "Wellness Exam", status: "Completed", reason: "Wing clip + wellness check", weight: 0.2, notes: "Wings clipped. Feathers in good condition. Active and alert." },

  // --- Nori (patient 12) ---
  { patient_id: 12, vet_id: VET_HUANG, datetime: apptDatetime("2025-12-10", "13:00:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness exam + vaccines", weight: 8.5, notes: "FVRCP booster given. Healthy." },

  // --- Bear (patient 13) ---
  { patient_id: 13, vet_id: VET_WEBB, datetime: apptDatetime("2025-10-08", "08:30:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness exam", weight: 104.0, notes: "Very anxious. Used treats and slow approach. Healthy overall." },
  { patient_id: 13, vet_id: VET_WEBB, datetime: apptDatetime("2026-02-12", "09:00:00"), type: "Sick Visit", status: "Completed", reason: "Limping on front right leg", weight: 105.2, notes: "Mild sprain. Rest x 1 week. Carprofen 75mg BID PRN." },

  // --- Miso (patient 14) ---
  { patient_id: 14, vet_id: VET_HUANG, datetime: apptDatetime("2026-01-08", "14:00:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness exam", weight: 12.4, notes: "Healthy. All vaccines current." },

  // --- Daisy (patient 15) — heart murmur ---
  { patient_id: 15, vet_id: VET_WEBB, datetime: apptDatetime("2025-09-22", "10:00:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness + cardiac echo", weight: 15.5, notes: "Heart murmur stable at Grade 2. Echo shows mild MVD. No meds needed yet." },
  { patient_id: 15, vet_id: VET_WEBB, datetime: apptDatetime("2026-03-22", "10:00:00"), type: "Wellness Exam", status: "Scheduled", reason: "Annual wellness + cardiac echo", weight: null, notes: null },

  // --- Willow (patient 17) ---
  { patient_id: 17, vet_id: VET_HUANG, datetime: apptDatetime("2025-11-25", "11:30:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness exam", weight: 10.8, notes: "Active Bengal. All good." },

  // --- Cooper (patient 18) ---
  { patient_id: 18, vet_id: VET_WEBB, datetime: apptDatetime("2025-10-12", "09:00:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness + vaccines", weight: 51.5, notes: "Healthy. DHPP booster." },
  { patient_id: 18, vet_id: VET_HUANG, datetime: apptDatetime("2026-01-30", "14:00:00"), type: "Sick Visit", status: "Completed", reason: "Diarrhea x 3 days", weight: 52.0, notes: "Likely dietary indiscretion. Fecal negative. Bland diet + probiotics." },

  // --- Loki (patient 19) ---
  { patient_id: 19, vet_id: VET_HUANG, datetime: apptDatetime("2025-12-18", "10:00:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness + vaccines", weight: 58.0, notes: "DHPP and Rabies boosters. Double-checked carrier." },

  // --- Spike (patient 20) ---
  { patient_id: 20, vet_id: VET_WEBB, datetime: apptDatetime("2025-11-10", "11:00:00"), type: "Wellness Exam", status: "Completed", reason: "Bearded dragon annual exam", weight: 1.1, notes: "Healthy. Shedding normally. UVB bulb replacement reminder given." },

  // --- Rosie (patient 21) ---
  { patient_id: 21, vet_id: VET_HUANG, datetime: apptDatetime("2025-12-22", "09:00:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness + vaccines", weight: 44.5, notes: "Healthy. All vaccines current." },

  // --- Shadow (patient 22) ---
  { patient_id: 22, vet_id: VET_HUANG, datetime: apptDatetime("2026-01-05", "13:00:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness exam", weight: 13.5, notes: "Healthy senior cat. Bloodwork normal." },

  // --- Oakley (patient 23) ---
  { patient_id: 23, vet_id: VET_WEBB, datetime: apptDatetime("2025-10-25", "10:00:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness + vaccines", weight: 66.5, notes: "Healthy. Noise anxiety discussed — consider Sileo for July 4th." },

  // --- Beans (patient 24) ---
  { patient_id: 24, vet_id: VET_HUANG, datetime: apptDatetime("2026-02-03", "11:00:00"), type: "Dental Cleaning", status: "Completed", reason: "Dental cleaning — tartar buildup", weight: 11.8, notes: "Full dental done. One extraction (lower premolar). Recovery uneventful." },

  // --- Hazel (patient 25) ---
  { patient_id: 25, vet_id: VET_WEBB, datetime: apptDatetime("2025-11-28", "14:00:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness + IVDD screening", weight: 12.0, notes: "No signs of IVDD. Continue weight management. Ramp usage for furniture." },

  // --- Simba (patient 26) — overweight ---
  { patient_id: 26, vet_id: VET_HUANG, datetime: apptDatetime("2025-10-18", "13:30:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness — weight check", weight: 14.8, notes: "BCS 8/9 — obese. Diet plan: Hill's Metabolic, 1/3 cup BID. Recheck in 2 months." },
  { patient_id: 26, vet_id: VET_HUANG, datetime: apptDatetime("2025-12-18", "13:30:00"), type: "Follow-Up", status: "Completed", reason: "Weight recheck", weight: 14.2, notes: "Lost 0.6 lbs. Good progress. Continue diet plan." },
  { patient_id: 26, vet_id: VET_HUANG, datetime: apptDatetime("2026-02-22", "13:30:00"), type: "Follow-Up", status: "Completed", reason: "Weight recheck", weight: 13.5, notes: "Target 12 lbs. Getting closer. Owner compliant with feeding plan." },

  // --- Penny (patient 28) ---
  { patient_id: 28, vet_id: VET_HUANG, datetime: apptDatetime("2025-12-02", "09:00:00"), type: "Wellness Exam", status: "Completed", reason: "New patient wellness exam", weight: 21.8, notes: "Healthy beagle mix. All vaccines current from previous vet. Updated records." },

  // --- Olive (patient 29) ---
  { patient_id: 29, vet_id: VET_HUANG, datetime: apptDatetime("2026-02-15", "10:00:00"), type: "Wellness Exam", status: "Completed", reason: "New patient — transferred records", weight: 20.1, notes: "Records received from VCA West LA. Healthy. Vaccines current." },

  // --- Bruno (patient 30) ---
  { patient_id: 30, vet_id: VET_WEBB, datetime: apptDatetime("2025-11-02", "08:30:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness + vaccines", weight: 61.5, notes: "Healthy. DHPP booster." },

  // --- Nala (patient 31) ---
  { patient_id: 31, vet_id: VET_HUANG, datetime: apptDatetime("2026-01-20", "11:00:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness exam", weight: 8.0, notes: "Healthy Abyssinian. FVRCP booster given." },

  // --- Taro (patient 32) ---
  { patient_id: 32, vet_id: VET_WEBB, datetime: apptDatetime("2025-12-08", "14:00:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness + vaccines + nail trim", weight: 22.5, notes: "Dramatic during nail trim as expected. Otherwise healthy." },

  // --- Peanut (patient 33) ---
  { patient_id: 33, vet_id: VET_HUANG, datetime: apptDatetime("2026-01-25", "09:00:00"), type: "Vaccination", status: "Completed", reason: "Puppy DHPP #2", weight: 5.2, notes: "Growing well. No reactions." },
  { patient_id: 33, vet_id: VET_HUANG, datetime: apptDatetime("2026-02-22", "09:00:00"), type: "Vaccination", status: "Completed", reason: "Puppy DHPP #3 + Bordetella", weight: 5.5, notes: "On track." },
  { patient_id: 33, vet_id: VET_HUANG, datetime: apptDatetime("2026-03-22", "09:00:00"), type: "Vaccination", status: "Scheduled", reason: "Puppy DHPP #4 (final) + Rabies", weight: null, notes: null },

  // --- Sage (patient 34) ---
  { patient_id: 34, vet_id: VET_WEBB, datetime: apptDatetime("2026-02-01", "11:00:00"), type: "Wellness Exam", status: "Completed", reason: "Rabbit wellness exam + nail trim", weight: 3.8, notes: "Healthy. Nails trimmed. Teeth in good shape." },

  // --- Mocha (patient 35) ---
  { patient_id: 35, vet_id: VET_WEBB, datetime: apptDatetime("2025-12-15", "10:30:00"), type: "Wellness Exam", status: "Completed", reason: "Annual wellness + vaccines", weight: 17.5, notes: "Healthy. All vaccines updated." },

  // --- Future appointments (scheduled) ---
  { patient_id: 1, vet_id: VET_HUANG, datetime: apptDatetime("2026-03-05", "11:00:00"), type: "Wellness Exam", status: "Scheduled", reason: "Annual wellness exam", weight: null, notes: null },
  { patient_id: 6, vet_id: VET_HUANG, datetime: apptDatetime("2026-03-15", "09:30:00"), type: "Wellness Exam", status: "Scheduled", reason: "Annual wellness — Pepper", weight: null, notes: null },
  { patient_id: 7, vet_id: VET_HUANG, datetime: apptDatetime("2026-03-15", "10:00:00"), type: "Wellness Exam", status: "Scheduled", reason: "Annual wellness — Ginger (back-to-back)", weight: null, notes: null },
  { patient_id: 10, vet_id: VET_WEBB, datetime: apptDatetime("2026-03-10", "15:00:00"), type: "Follow-Up", status: "Scheduled", reason: "Ear infection recheck", weight: null, notes: null },
  { patient_id: 13, vet_id: VET_WEBB, datetime: apptDatetime("2026-03-05", "09:00:00"), type: "Follow-Up", status: "Scheduled", reason: "Sprain recheck", weight: null, notes: null },
  { patient_id: 19, vet_id: VET_HUANG, datetime: apptDatetime("2026-03-20", "10:00:00"), type: "Dental Cleaning", status: "Scheduled", reason: "Dental cleaning", weight: null, notes: null },
  { patient_id: 20, vet_id: VET_WEBB, datetime: apptDatetime("2026-03-08", "11:00:00"), type: "Wellness Exam", status: "Scheduled", reason: "Bearded dragon 6-month check", weight: null, notes: null },
  { patient_id: 23, vet_id: VET_WEBB, datetime: apptDatetime("2026-03-25", "10:00:00"), type: "Wellness Exam", status: "Scheduled", reason: "Annual wellness + vaccines", weight: null, notes: null },
  { patient_id: 26, vet_id: VET_HUANG, datetime: apptDatetime("2026-04-22", "13:30:00"), type: "Follow-Up", status: "Scheduled", reason: "Weight recheck — Simba", weight: null, notes: null },
  { patient_id: 29, vet_id: VET_HUANG, datetime: apptDatetime("2026-03-15", "14:00:00"), type: "Vaccination", status: "Scheduled", reason: "Bordetella booster", weight: null, notes: null },

  // --- Today's appointments (Feb 25, 2026) ---
  { patient_id: 2, vet_id: VET_WEBB, datetime: apptDatetime("2026-02-25", "09:00:00"), type: "Wellness Exam", status: "Scheduled", reason: "Biscuit — 6-month check", weight: null, notes: null },
  { patient_id: 17, vet_id: VET_HUANG, datetime: apptDatetime("2026-02-25", "09:30:00"), type: "Sick Visit", status: "Scheduled", reason: "Willow — not eating x 2 days", weight: null, notes: null },
  { patient_id: 21, vet_id: VET_WEBB, datetime: apptDatetime("2026-02-25", "10:30:00"), type: "Vaccination", status: "Scheduled", reason: "Rosie — DHPP booster", weight: null, notes: null },
  { patient_id: 35, vet_id: VET_HUANG, datetime: apptDatetime("2026-02-25", "11:00:00"), type: "Follow-Up", status: "Scheduled", reason: "Mocha — post-vaccine check", weight: null, notes: null },
  { patient_id: 10, vet_id: VET_WEBB, datetime: apptDatetime("2026-02-25", "14:00:00"), type: "Follow-Up", status: "Scheduled", reason: "Zeus — ear recheck", weight: null, notes: null },
  { patient_id: 25, vet_id: VET_HUANG, datetime: apptDatetime("2026-02-25", "14:30:00"), type: "Wellness Exam", status: "Scheduled", reason: "Hazel — 6-month IVDD screening", weight: null, notes: null },
  { patient_id: 19, vet_id: VET_HUANG, datetime: apptDatetime("2026-02-25", "16:00:00"), type: "Vaccination", status: "Scheduled", reason: "Loki — Bordetella booster", weight: null, notes: null },

  // --- A few cancelled ones ---
  { patient_id: 3, vet_id: VET_HUANG, datetime: apptDatetime("2026-02-08", "13:00:00"), type: "Vaccination", status: "Cancelled", reason: "Coco — DHPP booster", weight: null, notes: "Owner called to reschedule" },
  { patient_id: 22, vet_id: VET_HUANG, datetime: apptDatetime("2026-01-28", "13:00:00"), type: "Dental Cleaning", status: "Cancelled", reason: "Shadow — dental cleaning", weight: null, notes: "Cat was eating that morning — rescheduled" },
];

for (const a of appointments) {
  insertAppt.run(a.patient_id, a.vet_id, a.datetime, a.type, a.status, a.reason, a.weight, a.notes);
}

// --- Seed Vaccinations (60+) ---

const insertVax = db.prepare(
  "INSERT INTO vaccinations (patient_id, vaccine_name, date_administered, next_due_date, administered_by_id, lot_number) VALUES (?, ?, ?, ?, ?, ?)"
);

interface VaxSeed {
  patient_id: number;
  vaccine: string;
  date: string;
  next_due: string;
  by: number;
}

const vaccinations: VaxSeed[] = [
  // Luna (cat, patient 1)
  { patient_id: 1, vaccine: "FVRCP", date: "2025-09-05", next_due: "2026-09-05", by: VET_HUANG },
  { patient_id: 1, vaccine: "Rabies", date: "2024-09-10", next_due: "2027-09-10", by: VET_HUANG },

  // Biscuit (dog, patient 2)
  { patient_id: 2, vaccine: "DHPP", date: "2025-03-15", next_due: "2026-03-15", by: VET_WEBB }, // Due soon!
  { patient_id: 2, vaccine: "Rabies", date: "2024-03-20", next_due: "2027-03-20", by: VET_WEBB },
  { patient_id: 2, vaccine: "Bordetella", date: "2025-03-15", next_due: "2026-03-15", by: TECH_CRUZ }, // Due soon!

  // Coco (dog, patient 3)
  { patient_id: 3, vaccine: "DHPP", date: "2025-10-30", next_due: "2026-10-30", by: VET_HUANG },
  { patient_id: 3, vaccine: "Rabies", date: "2024-10-30", next_due: "2027-10-30", by: VET_HUANG },
  { patient_id: 3, vaccine: "Bordetella", date: "2025-04-15", next_due: "2026-04-15", by: TECH_CRUZ },

  // Duke (senior dog, patient 4) — some overdue
  { patient_id: 4, vaccine: "DHPP", date: "2025-02-16", next_due: "2026-02-16", by: VET_WEBB }, // Overdue!
  { patient_id: 4, vaccine: "Rabies", date: "2023-08-15", next_due: "2026-08-15", by: VET_WEBB },
  { patient_id: 4, vaccine: "Bordetella", date: "2025-02-16", next_due: "2026-02-16", by: TECH_CRUZ }, // Overdue!

  // Mochi (puppy, patient 5) — first-year series
  { patient_id: 5, vaccine: "DHPP", date: "2025-11-15", next_due: "2025-12-13", by: VET_HUANG },
  { patient_id: 5, vaccine: "DHPP", date: "2025-12-13", next_due: "2026-01-10", by: VET_HUANG },
  { patient_id: 5, vaccine: "DHPP", date: "2026-01-10", next_due: "2026-02-07", by: VET_HUANG },
  { patient_id: 5, vaccine: "DHPP", date: "2026-02-07", next_due: "2027-02-07", by: VET_HUANG },
  { patient_id: 5, vaccine: "Bordetella", date: "2025-12-13", next_due: "2026-12-13", by: TECH_CRUZ },
  { patient_id: 5, vaccine: "Leptospirosis", date: "2026-01-10", next_due: "2027-01-10", by: VET_HUANG },
  { patient_id: 5, vaccine: "Leptospirosis", date: "2026-02-07", next_due: "2027-02-07", by: VET_HUANG },
  { patient_id: 5, vaccine: "Rabies", date: "2026-02-07", next_due: "2027-02-07", by: VET_HUANG },

  // Pepper (cat, patient 6)
  { patient_id: 6, vaccine: "FVRCP", date: "2025-10-15", next_due: "2026-10-15", by: VET_HUANG },
  { patient_id: 6, vaccine: "Rabies", date: "2024-10-15", next_due: "2027-10-15", by: VET_HUANG },

  // Ginger (cat, patient 7)
  { patient_id: 7, vaccine: "FVRCP", date: "2025-11-20", next_due: "2026-11-20", by: VET_HUANG },
  { patient_id: 7, vaccine: "Rabies", date: "2024-11-20", next_due: "2027-11-20", by: VET_HUANG },

  // Zeus (dog, patient 10)
  { patient_id: 10, vaccine: "DHPP", date: "2025-11-05", next_due: "2026-11-05", by: VET_WEBB },
  { patient_id: 10, vaccine: "Rabies", date: "2024-11-05", next_due: "2027-11-05", by: VET_WEBB },
  { patient_id: 10, vaccine: "Bordetella", date: "2025-11-05", next_due: "2026-11-05", by: TECH_CRUZ },

  // Bella (dog, patient 11)
  { patient_id: 11, vaccine: "DHPP", date: "2025-06-10", next_due: "2026-06-10", by: VET_HUANG },
  { patient_id: 11, vaccine: "Rabies", date: "2024-06-10", next_due: "2027-06-10", by: VET_HUANG },
  { patient_id: 11, vaccine: "Bordetella", date: "2025-06-10", next_due: "2026-06-10", by: TECH_CRUZ },

  // Nori (cat, patient 12)
  { patient_id: 12, vaccine: "FVRCP", date: "2025-12-10", next_due: "2026-12-10", by: VET_HUANG },
  { patient_id: 12, vaccine: "Rabies", date: "2024-12-10", next_due: "2027-12-10", by: VET_HUANG },

  // Bear (dog, patient 13)
  { patient_id: 13, vaccine: "DHPP", date: "2025-10-08", next_due: "2026-10-08", by: VET_WEBB },
  { patient_id: 13, vaccine: "Rabies", date: "2024-10-08", next_due: "2027-10-08", by: VET_WEBB },
  { patient_id: 13, vaccine: "Bordetella", date: "2025-04-08", next_due: "2026-04-08", by: TECH_CRUZ },

  // Miso (cat, patient 14)
  { patient_id: 14, vaccine: "FVRCP", date: "2026-01-08", next_due: "2027-01-08", by: VET_HUANG },
  { patient_id: 14, vaccine: "Rabies", date: "2025-01-08", next_due: "2028-01-08", by: VET_HUANG },

  // Daisy (dog, patient 15)
  { patient_id: 15, vaccine: "DHPP", date: "2025-09-22", next_due: "2026-09-22", by: VET_WEBB },
  { patient_id: 15, vaccine: "Rabies", date: "2024-09-22", next_due: "2027-09-22", by: VET_WEBB },

  // Rocky (dog, patient 16) — overdue because of no-shows
  { patient_id: 16, vaccine: "DHPP", date: "2024-10-05", next_due: "2025-10-05", by: VET_HUANG }, // Overdue!
  { patient_id: 16, vaccine: "Rabies", date: "2026-01-28", next_due: "2029-01-28", by: VET_HUANG }, // Updated when he finally came
  { patient_id: 16, vaccine: "Bordetella", date: "2024-10-05", next_due: "2025-10-05", by: TECH_CRUZ }, // Overdue!

  // Willow (cat, patient 17)
  { patient_id: 17, vaccine: "FVRCP", date: "2025-11-25", next_due: "2026-11-25", by: VET_HUANG },
  { patient_id: 17, vaccine: "Rabies", date: "2024-11-25", next_due: "2027-11-25", by: VET_HUANG },

  // Cooper (dog, patient 18)
  { patient_id: 18, vaccine: "DHPP", date: "2025-10-12", next_due: "2026-10-12", by: VET_WEBB },
  { patient_id: 18, vaccine: "Rabies", date: "2024-10-12", next_due: "2027-10-12", by: VET_WEBB },
  { patient_id: 18, vaccine: "Bordetella", date: "2025-10-12", next_due: "2026-10-12", by: TECH_CRUZ },

  // Loki (dog, patient 19)
  { patient_id: 19, vaccine: "DHPP", date: "2025-12-18", next_due: "2026-12-18", by: VET_HUANG },
  { patient_id: 19, vaccine: "Rabies", date: "2025-12-18", next_due: "2028-12-18", by: VET_HUANG },

  // Rosie (dog, patient 21)
  { patient_id: 21, vaccine: "DHPP", date: "2025-12-22", next_due: "2026-12-22", by: VET_HUANG },
  { patient_id: 21, vaccine: "Rabies", date: "2024-12-22", next_due: "2027-12-22", by: VET_HUANG },
  { patient_id: 21, vaccine: "Bordetella", date: "2025-06-22", next_due: "2026-06-22", by: TECH_CRUZ },

  // Shadow (cat, patient 22)
  { patient_id: 22, vaccine: "FVRCP", date: "2026-01-05", next_due: "2027-01-05", by: VET_HUANG },
  { patient_id: 22, vaccine: "Rabies", date: "2025-01-05", next_due: "2028-01-05", by: VET_HUANG },

  // Oakley (dog, patient 23) — overdue
  { patient_id: 23, vaccine: "DHPP", date: "2025-10-25", next_due: "2026-10-25", by: VET_WEBB },
  { patient_id: 23, vaccine: "Rabies", date: "2024-10-25", next_due: "2027-10-25", by: VET_WEBB },
  { patient_id: 23, vaccine: "Bordetella", date: "2025-04-25", next_due: "2026-04-25", by: TECH_CRUZ },

  // Beans (cat, patient 24)
  { patient_id: 24, vaccine: "FVRCP", date: "2025-10-31", next_due: "2026-10-31", by: VET_HUANG },
  { patient_id: 24, vaccine: "Rabies", date: "2024-10-31", next_due: "2027-10-31", by: VET_HUANG },

  // Hazel (dog, patient 25)
  { patient_id: 25, vaccine: "DHPP", date: "2025-11-28", next_due: "2026-11-28", by: VET_WEBB },
  { patient_id: 25, vaccine: "Rabies", date: "2024-11-28", next_due: "2027-11-28", by: VET_WEBB },

  // Simba (cat, patient 26)
  { patient_id: 26, vaccine: "FVRCP", date: "2025-10-18", next_due: "2026-10-18", by: VET_HUANG },
  { patient_id: 26, vaccine: "Rabies", date: "2024-10-18", next_due: "2027-10-18", by: VET_HUANG },

  // Penny (dog, patient 28)
  { patient_id: 28, vaccine: "DHPP", date: "2025-12-02", next_due: "2026-12-02", by: VET_HUANG },
  { patient_id: 28, vaccine: "Rabies", date: "2025-12-02", next_due: "2028-12-02", by: VET_HUANG },

  // Olive (dog, patient 29) — due soon
  { patient_id: 29, vaccine: "DHPP", date: "2025-03-15", next_due: "2026-03-15", by: VET_HUANG }, // Due soon!
  { patient_id: 29, vaccine: "Rabies", date: "2025-03-15", next_due: "2028-03-15", by: VET_HUANG },
  { patient_id: 29, vaccine: "Bordetella", date: "2025-09-15", next_due: "2026-03-15", by: TECH_CRUZ }, // Due soon!

  // Bruno (dog, patient 30)
  { patient_id: 30, vaccine: "DHPP", date: "2025-11-02", next_due: "2026-11-02", by: VET_WEBB },
  { patient_id: 30, vaccine: "Rabies", date: "2024-11-02", next_due: "2027-11-02", by: VET_WEBB },

  // Nala (cat, patient 31)
  { patient_id: 31, vaccine: "FVRCP", date: "2026-01-20", next_due: "2027-01-20", by: VET_HUANG },
  { patient_id: 31, vaccine: "Rabies", date: "2026-01-20", next_due: "2029-01-20", by: VET_HUANG },

  // Taro (dog, patient 32)
  { patient_id: 32, vaccine: "DHPP", date: "2025-12-08", next_due: "2026-12-08", by: VET_WEBB },
  { patient_id: 32, vaccine: "Rabies", date: "2024-12-08", next_due: "2027-12-08", by: VET_WEBB },
  { patient_id: 32, vaccine: "Bordetella", date: "2025-12-08", next_due: "2026-12-08", by: TECH_CRUZ },

  // Peanut (puppy, patient 33)
  { patient_id: 33, vaccine: "DHPP", date: "2026-01-04", next_due: "2026-01-25", by: VET_HUANG },
  { patient_id: 33, vaccine: "DHPP", date: "2026-01-25", next_due: "2026-02-22", by: VET_HUANG },
  { patient_id: 33, vaccine: "DHPP", date: "2026-02-22", next_due: "2026-03-05", by: VET_HUANG }, // Due soon
  { patient_id: 33, vaccine: "Bordetella", date: "2026-02-22", next_due: "2027-02-22", by: TECH_CRUZ },

  // Mocha (dog, patient 35)
  { patient_id: 35, vaccine: "DHPP", date: "2025-12-15", next_due: "2026-12-15", by: VET_WEBB },
  { patient_id: 35, vaccine: "Rabies", date: "2024-12-15", next_due: "2027-12-15", by: VET_WEBB },
  { patient_id: 35, vaccine: "Bordetella", date: "2025-12-15", next_due: "2026-12-15", by: TECH_CRUZ },

  // Simba (cat, patient 26) — FeLV due soon
  { patient_id: 26, vaccine: "FeLV", date: "2025-03-06", next_due: "2026-03-06", by: VET_HUANG },
];

for (const v of vaccinations) {
  insertVax.run(v.patient_id, v.vaccine, v.date, v.next_due, v.by, lotNumber());
}

// --- Seed Treatments (50+) ---

const insertTreatment = db.prepare(
  "INSERT INTO treatments (patient_id, appointment_id, date, description, diagnosis, medications, cost, paid, veterinarian_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

interface TreatmentSeed {
  patient_id: number;
  appt_id: number | null;
  date: string;
  desc: string;
  diagnosis: string | null;
  meds: string | null;
  cost: number;
  paid: number;
  vet_id: number;
}

const treatments: TreatmentSeed[] = [
  // Duke (patient 4) — chronic care, frequent treatments
  { patient_id: 4, appt_id: 1, date: "2025-08-15", desc: "Senior wellness exam — bloodwork, physical", diagnosis: null, meds: JSON.stringify([{ name: "Rimadyl", dose: "75mg", frequency: "BID" }, { name: "Soloxine", dose: "0.5mg", frequency: "BID" }]), cost: 185.00, paid: 1, vet_id: VET_WEBB },
  { patient_id: 4, appt_id: 2, date: "2025-09-12", desc: "Bloodwork recheck — thyroid panel", diagnosis: "Hypothyroidism — managed", meds: null, cost: 120.00, paid: 1, vet_id: VET_WEBB },
  { patient_id: 4, appt_id: 3, date: "2025-10-20", desc: "Sick visit — left hind limping, arthritis flare", diagnosis: "Arthritis — bilateral hip, acute flare left hind", meds: JSON.stringify([{ name: "Gabapentin", dose: "100mg", frequency: "BID" }]), cost: 145.00, paid: 1, vet_id: VET_WEBB },
  { patient_id: 4, appt_id: 4, date: "2025-11-18", desc: "Arthritis follow-up + complete blood count", diagnosis: "Arthritis — stable", meds: null, cost: 135.00, paid: 1, vet_id: VET_WEBB },
  { patient_id: 4, appt_id: 5, date: "2025-12-15", desc: "Monthly bloodwork — liver and thyroid panel", diagnosis: null, meds: JSON.stringify([{ name: "Rimadyl", dose: "75mg", frequency: "BID" }, { name: "Soloxine", dose: "0.5mg", frequency: "BID" }, { name: "Gabapentin", dose: "100mg", frequency: "BID" }]), cost: 120.00, paid: 1, vet_id: VET_WEBB },
  { patient_id: 4, appt_id: 6, date: "2026-01-19", desc: "Monthly bloodwork + Rimadyl refill", diagnosis: null, meds: null, cost: 120.00, paid: 1, vet_id: VET_WEBB },
  { patient_id: 4, appt_id: 7, date: "2026-02-16", desc: "Annual senior wellness exam — full workup", diagnosis: "Arthritis, hypothyroid, lipoma — all stable", meds: null, cost: 245.00, paid: 1, vet_id: VET_WEBB },

  // Bella (patient 11) — emergency surgery
  { patient_id: 11, appt_id: 9, date: "2026-02-10", desc: "Emergency gastropexy — GDV (bloat)", diagnosis: "Gastric dilatation-volvulus (GDV)", meds: JSON.stringify([{ name: "Cefazolin", dose: "500mg", frequency: "IV q8h" }, { name: "Metoclopramide", dose: "0.4mg/kg", frequency: "CRI" }]), cost: 4200.00, paid: 0, vet_id: VET_HUANG },
  { patient_id: 11, appt_id: 10, date: "2026-02-13", desc: "Post-op recheck — day 3", diagnosis: "Post-surgical recovery — GDV", meds: JSON.stringify([{ name: "Amoxicillin/Clavulanate", dose: "375mg", frequency: "BID x 10 days" }, { name: "Tramadol", dose: "50mg", frequency: "BID x 5 days" }]), cost: 85.00, paid: 0, vet_id: VET_HUANG },
  { patient_id: 11, appt_id: 11, date: "2026-02-20", desc: "Post-op recheck — day 10, suture removal", diagnosis: "Post-surgical recovery — healing well", meds: null, cost: 65.00, paid: 0, vet_id: VET_HUANG },

  // Luna (patient 1) — penicillin allergy
  { patient_id: 1, appt_id: 22, date: "2025-09-05", desc: "Annual wellness exam — FVRCP booster", diagnosis: null, meds: null, cost: 95.00, paid: 1, vet_id: VET_HUANG },
  { patient_id: 1, appt_id: 23, date: "2026-01-22", desc: "Sick visit — vomiting and lethargy", diagnosis: "Acute gastritis", meds: JSON.stringify([{ name: "Cerenia", dose: "16mg", frequency: "SID x 3 days" }]), cost: 165.00, paid: 1, vet_id: VET_HUANG },
  { patient_id: 1, appt_id: 24, date: "2026-02-05", desc: "Gastritis follow-up", diagnosis: "Gastritis — resolved", meds: null, cost: 55.00, paid: 1, vet_id: VET_HUANG },

  // Biscuit (patient 2)
  { patient_id: 2, appt_id: 25, date: "2025-09-18", desc: "Dental cleaning — full scaling and polish", diagnosis: "Grade 1 periodontal disease", meds: null, cost: 385.00, paid: 1, vet_id: VET_WEBB },

  // Coco (patient 3)
  { patient_id: 3, appt_id: 27, date: "2025-10-30", desc: "Annual wellness exam", diagnosis: null, meds: null, cost: 65.00, paid: 1, vet_id: VET_HUANG },
  { patient_id: 3, appt_id: 28, date: "2026-02-18", desc: "Skin irritation — belly rash", diagnosis: "Contact dermatitis", meds: JSON.stringify([{ name: "Apoquel", dose: "16mg", frequency: "SID x 14 days" }]), cost: 135.00, paid: 1, vet_id: VET_HUANG },

  // Mochi puppy (patient 5)
  { patient_id: 5, appt_id: 17, date: "2025-11-15", desc: "First puppy visit — exam + DHPP #1", diagnosis: null, meds: null, cost: 95.00, paid: 1, vet_id: VET_HUANG },
  { patient_id: 5, appt_id: 18, date: "2025-12-13", desc: "Puppy visit — DHPP #2 + Bordetella", diagnosis: null, meds: null, cost: 85.00, paid: 1, vet_id: VET_HUANG },
  { patient_id: 5, appt_id: 19, date: "2026-01-10", desc: "Puppy visit — DHPP #3 + Leptospirosis #1", diagnosis: null, meds: null, cost: 95.00, paid: 1, vet_id: VET_HUANG },
  { patient_id: 5, appt_id: 20, date: "2026-02-07", desc: "Puppy visit — DHPP #4 + Lepto #2 + Rabies", diagnosis: null, meds: null, cost: 115.00, paid: 1, vet_id: VET_HUANG },

  // Rocky (patient 16) — finally came in
  { patient_id: 16, appt_id: 16, date: "2026-01-28", desc: "Vaccination — Rabies booster (overdue)", diagnosis: null, meds: null, cost: 45.00, paid: 1, vet_id: VET_HUANG },

  // Zeus (patient 10)
  { patient_id: 10, appt_id: 29, date: "2025-11-05", desc: "Annual wellness exam — DHPP + Bordetella boosters", diagnosis: null, meds: null, cost: 115.00, paid: 1, vet_id: VET_WEBB },
  { patient_id: 10, appt_id: 30, date: "2026-02-24", desc: "Ear infection — bilateral", diagnosis: "Otitis externa — bilateral", meds: JSON.stringify([{ name: "Otomax", dose: "8 drops/ear", frequency: "BID x 14 days" }]), cost: 125.00, paid: 1, vet_id: VET_WEBB },

  // Pepper (patient 6)
  { patient_id: 6, appt_id: 31, date: "2025-10-15", desc: "Annual wellness exam — senior bloodwork", diagnosis: null, meds: null, cost: 145.00, paid: 1, vet_id: VET_HUANG },

  // Ginger (patient 7)
  { patient_id: 7, appt_id: 32, date: "2025-11-20", desc: "Annual wellness exam", diagnosis: null, meds: null, cost: 65.00, paid: 1, vet_id: VET_HUANG },

  // Tofu (patient 8)
  { patient_id: 8, appt_id: 33, date: "2025-12-05", desc: "Rabbit wellness exam + nail trim", diagnosis: null, meds: null, cost: 75.00, paid: 1, vet_id: VET_WEBB },

  // Kiwi (patient 9)
  { patient_id: 9, appt_id: 34, date: "2026-01-15", desc: "Wing clip + avian wellness check", diagnosis: null, meds: null, cost: 85.00, paid: 1, vet_id: VET_WEBB },

  // Nori (patient 12)
  { patient_id: 12, appt_id: 35, date: "2025-12-10", desc: "Annual wellness exam — FVRCP booster", diagnosis: null, meds: null, cost: 95.00, paid: 1, vet_id: VET_HUANG },

  // Bear (patient 13)
  { patient_id: 13, appt_id: 36, date: "2025-10-08", desc: "Annual wellness exam", diagnosis: null, meds: null, cost: 65.00, paid: 1, vet_id: VET_WEBB },
  { patient_id: 13, appt_id: 37, date: "2026-02-12", desc: "Front right leg lameness", diagnosis: "Mild forelimb sprain", meds: JSON.stringify([{ name: "Carprofen", dose: "75mg", frequency: "BID PRN" }]), cost: 125.00, paid: 1, vet_id: VET_WEBB },

  // Miso (patient 14)
  { patient_id: 14, appt_id: 38, date: "2026-01-08", desc: "Annual wellness exam", diagnosis: null, meds: null, cost: 65.00, paid: 1, vet_id: VET_HUANG },

  // Daisy (patient 15) — heart murmur
  { patient_id: 15, appt_id: 39, date: "2025-09-22", desc: "Annual wellness + cardiac echocardiogram", diagnosis: "Mitral valve disease — Grade 2 murmur, mild MVD", meds: null, cost: 385.00, paid: 1, vet_id: VET_WEBB },

  // Willow (patient 17)
  { patient_id: 17, appt_id: 41, date: "2025-11-25", desc: "Annual wellness exam", diagnosis: null, meds: null, cost: 65.00, paid: 1, vet_id: VET_HUANG },

  // Cooper (patient 18)
  { patient_id: 18, appt_id: 42, date: "2025-10-12", desc: "Annual wellness exam — DHPP booster", diagnosis: null, meds: null, cost: 95.00, paid: 1, vet_id: VET_WEBB },
  { patient_id: 18, appt_id: 43, date: "2026-01-30", desc: "Diarrhea — 3 days duration", diagnosis: "Dietary indiscretion — acute gastroenteritis", meds: JSON.stringify([{ name: "FortiFlora", dose: "1 packet", frequency: "SID x 7 days" }]), cost: 110.00, paid: 1, vet_id: VET_HUANG },

  // Loki (patient 19)
  { patient_id: 19, appt_id: 44, date: "2025-12-18", desc: "Annual wellness — DHPP + Rabies boosters", diagnosis: null, meds: null, cost: 115.00, paid: 1, vet_id: VET_HUANG },

  // Spike (patient 20)
  { patient_id: 20, appt_id: 45, date: "2025-11-10", desc: "Bearded dragon annual exam", diagnosis: null, meds: null, cost: 95.00, paid: 1, vet_id: VET_WEBB },

  // Rosie (patient 21)
  { patient_id: 21, appt_id: 46, date: "2025-12-22", desc: "Annual wellness — vaccines updated", diagnosis: null, meds: null, cost: 95.00, paid: 1, vet_id: VET_HUANG },

  // Shadow (patient 22)
  { patient_id: 22, appt_id: 47, date: "2026-01-05", desc: "Annual wellness exam — senior bloodwork", diagnosis: null, meds: null, cost: 145.00, paid: 1, vet_id: VET_HUANG },

  // Oakley (patient 23)
  { patient_id: 23, appt_id: 48, date: "2025-10-25", desc: "Annual wellness — DHPP booster", diagnosis: null, meds: null, cost: 95.00, paid: 1, vet_id: VET_WEBB },

  // Beans (patient 24) — dental
  { patient_id: 24, appt_id: 49, date: "2026-02-03", desc: "Dental cleaning + 1 extraction (lower premolar)", diagnosis: "Grade 2 periodontal disease", meds: JSON.stringify([{ name: "Buprenorphine", dose: "0.02mg/kg", frequency: "q8h x 3 days" }]), cost: 420.00, paid: 1, vet_id: VET_HUANG },

  // Hazel (patient 25)
  { patient_id: 25, appt_id: 50, date: "2025-11-28", desc: "Annual wellness + IVDD screening", diagnosis: null, meds: null, cost: 85.00, paid: 1, vet_id: VET_WEBB },

  // Simba (patient 26) — weight management
  { patient_id: 26, appt_id: 51, date: "2025-10-18", desc: "Annual wellness — weight management plan initiated", diagnosis: "Obesity — BCS 8/9", meds: null, cost: 75.00, paid: 1, vet_id: VET_HUANG },
  { patient_id: 26, appt_id: 52, date: "2025-12-18", desc: "Weight recheck — lost 0.6 lbs", diagnosis: "Obesity — improving", meds: null, cost: 45.00, paid: 1, vet_id: VET_HUANG },
  { patient_id: 26, appt_id: 53, date: "2026-02-22", desc: "Weight recheck — lost 0.7 lbs, total 1.3 lbs lost", diagnosis: "Obesity — on track to target", meds: null, cost: 45.00, paid: 1, vet_id: VET_HUANG },

  // Penny (patient 28)
  { patient_id: 28, appt_id: 54, date: "2025-12-02", desc: "New patient wellness exam — records transfer", diagnosis: null, meds: null, cost: 65.00, paid: 1, vet_id: VET_HUANG },

  // Olive (patient 29)
  { patient_id: 29, appt_id: 55, date: "2026-02-15", desc: "New patient wellness exam — transferred from VCA", diagnosis: null, meds: null, cost: 65.00, paid: 1, vet_id: VET_HUANG },

  // Bruno (patient 30)
  { patient_id: 30, appt_id: 56, date: "2025-11-02", desc: "Annual wellness — DHPP booster", diagnosis: null, meds: null, cost: 95.00, paid: 1, vet_id: VET_WEBB },

  // Nala (patient 31)
  { patient_id: 31, appt_id: 57, date: "2026-01-20", desc: "Annual wellness — FVRCP booster", diagnosis: null, meds: null, cost: 95.00, paid: 1, vet_id: VET_HUANG },

  // Taro (patient 32)
  { patient_id: 32, appt_id: 58, date: "2025-12-08", desc: "Annual wellness + nail trim (dramatic)", diagnosis: null, meds: null, cost: 85.00, paid: 1, vet_id: VET_WEBB },

  // Peanut puppy (patient 33)
  { patient_id: 33, appt_id: 59, date: "2026-01-25", desc: "Puppy visit — DHPP #2", diagnosis: null, meds: null, cost: 75.00, paid: 1, vet_id: VET_HUANG },
  { patient_id: 33, appt_id: 60, date: "2026-02-22", desc: "Puppy visit — DHPP #3 + Bordetella", diagnosis: null, meds: null, cost: 85.00, paid: 1, vet_id: VET_HUANG },

  // Sage (patient 34)
  { patient_id: 34, appt_id: 62, date: "2026-02-01", desc: "Rabbit wellness exam + nail trim", diagnosis: null, meds: null, cost: 75.00, paid: 1, vet_id: VET_WEBB },

  // Mocha (patient 35)
  { patient_id: 35, appt_id: 63, date: "2025-12-15", desc: "Annual wellness — vaccines updated", diagnosis: null, meds: null, cost: 95.00, paid: 1, vet_id: VET_WEBB },
];

for (const t of treatments) {
  insertTreatment.run(t.patient_id, t.appt_id, t.date, t.desc, t.diagnosis, t.meds, t.cost, t.paid, t.vet_id);
}

console.log("Seed complete!");
console.log(`  Veterinarians: 3`);
console.log(`  Owners: ${owners.length}`);
console.log(`  Patients: ${patients.length}`);
console.log(`  Appointments: ${appointments.length}`);
console.log(`  Vaccinations: ${vaccinations.length}`);
console.log(`  Treatments: ${treatments.length}`);
console.log(`\nDatabase saved to: ${DB_PATH}`);

db.close();
