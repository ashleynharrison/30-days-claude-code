import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'fitness.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// --- Schema ---
db.exec(`
  CREATE TABLE instructors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    specialties TEXT NOT NULL,
    bio TEXT,
    hourly_rate REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive'))
  );

  CREATE TABLE members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    membership_type TEXT NOT NULL CHECK(membership_type IN ('unlimited_monthly','unlimited_annual','class_pack_10','class_pack_20','drop_in')),
    membership_price REAL NOT NULL,
    classes_remaining INTEGER,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','frozen','cancelled','expired')),
    join_date TEXT NOT NULL,
    renewal_date TEXT,
    last_visit TEXT,
    emergency_contact TEXT,
    notes TEXT
  );

  CREATE TABLE classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    class_type TEXT NOT NULL CHECK(class_type IN ('yoga','hiit','spin','strength','pilates','boxing','barre','meditation')),
    instructor_id INTEGER NOT NULL REFERENCES instructors(id),
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
    start_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    capacity INTEGER NOT NULL,
    room TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE class_instances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL REFERENCES classes(id),
    instance_date TEXT NOT NULL,
    instructor_id INTEGER REFERENCES instructors(id),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','completed','cancelled')),
    notes TEXT
  );

  CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL REFERENCES members(id),
    class_instance_id INTEGER NOT NULL REFERENCES class_instances(id),
    status TEXT NOT NULL DEFAULT 'booked' CHECK(status IN ('booked','attended','no_show','cancelled','waitlisted')),
    booked_at TEXT NOT NULL DEFAULT (datetime('now')),
    checked_in_at TEXT
  );

  CREATE TABLE check_ins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL REFERENCES members(id),
    check_in_time TEXT NOT NULL DEFAULT (datetime('now')),
    check_out_time TEXT,
    type TEXT NOT NULL DEFAULT 'gym' CHECK(type IN ('gym','class','personal_training'))
  );
`);

// --- Helpers ---
const today = new Date();
function dateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}
function daysAgo(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return dateStr(d);
}
function daysFromNow(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return dateStr(d);
}

// --- Instructors (6) ---
const insertInstructor = db.prepare(`
  INSERT INTO instructors (name, email, phone, specialties, bio, hourly_rate, status)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const instructors = [
  ['Maya Chen', 'maya@ironpulse.com', '310-555-0101', 'yoga,pilates,meditation', 'RYT-500 certified. 8 years teaching vinyasa and restorative yoga. Former dancer.', 65, 'active'],
  ['Darius Wright', 'darius@ironpulse.com', '310-555-0102', 'hiit,strength,boxing', 'NASM-CPT, CrossFit L2. Specializes in functional fitness and metabolic conditioning.', 75, 'active'],
  ['Sofia Reyes', 'sofia@ironpulse.com', '310-555-0103', 'spin,hiit,barre', 'Schwinn-certified cycling instructor. 5 years of high-energy group fitness.', 60, 'active'],
  ['James Park', 'james@ironpulse.com', '310-555-0104', 'strength,hiit', 'CSCS certified. Former collegiate athlete. Focus on progressive overload programming.', 70, 'active'],
  ['Lily Okafor', 'lily@ironpulse.com', '310-555-0105', 'barre,pilates,yoga', 'Balanced Body certified Pilates instructor. Background in physical therapy.', 60, 'active'],
  ['Marcus Bell', 'marcus@ironpulse.com', '310-555-0106', 'boxing,hiit,strength', 'USA Boxing certified coach. 10 years competitive boxing experience.', 70, 'inactive'],
];

instructors.forEach(i => insertInstructor.run(...i));

// --- Members (25) ---
const insertMember = db.prepare(`
  INSERT INTO members (name, email, phone, membership_type, membership_price, classes_remaining, status, join_date, renewal_date, last_visit, emergency_contact, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const members: any[][] = [
  // Active unlimited monthly — regular attendees
  ['Sarah Kim', 'sarah.kim@email.com', '310-555-1001', 'unlimited_monthly', 149, null, 'active', daysAgo(280), daysFromNow(5), daysAgo(1), 'Mike Kim 310-555-9001', 'Morning yoga regular. Prefers Maya\'s classes.'],
  ['Tom Reeves', 'tom.reeves@email.com', '310-555-1002', 'unlimited_monthly', 149, null, 'active', daysAgo(190), daysFromNow(12), daysAgo(0), 'Linda Reeves 310-555-9002', 'HIIT and spin. Always books the 6 AM slot.'],
  ['Priya Patel', 'priya.patel@email.com', '310-555-1003', 'unlimited_monthly', 149, null, 'active', daysAgo(95), daysFromNow(8), daysAgo(2), 'Raj Patel 310-555-9003', null],
  ['Elena Vasquez', 'elena.v@email.com', '310-555-1004', 'unlimited_monthly', 149, null, 'active', daysAgo(420), daysFromNow(18), daysAgo(3), null, 'Founding member. Loves barre and pilates.'],
  ['Jordan Blake', 'jordan.b@email.com', '310-555-1005', 'unlimited_monthly', 149, null, 'active', daysAgo(60), daysFromNow(2), daysAgo(1), 'Casey Blake 310-555-9005', 'New member, very consistent so far.'],

  // Active unlimited annual
  ['Rachel Torres', 'rachel.t@email.com', '310-555-1006', 'unlimited_annual', 1399, null, 'active', daysAgo(200), daysFromNow(165), daysAgo(4), null, 'Annual member. Mix of yoga and strength.'],
  ['David Okonkwo', 'david.o@email.com', '310-555-1007', 'unlimited_annual', 1399, null, 'active', daysAgo(340), daysFromNow(25), daysAgo(0), 'Amara Okonkwo 310-555-9007', 'Coming up for renewal. Very active — 4-5x/week.'],

  // Class packs — varying usage
  ['Mia Santos', 'mia.santos@email.com', '310-555-1008', 'class_pack_20', 280, 14, 'active', daysAgo(45), null, daysAgo(5), null, 'Yoga only. Bought 20-pack.'],
  ['Nathan Cole', 'nathan.cole@email.com', '310-555-1009', 'class_pack_10', 150, 2, 'active', daysAgo(55), null, daysAgo(8), 'Amy Cole 310-555-9009', 'Almost out of classes. Mostly spin.'],
  ['Ava Robinson', 'ava.r@email.com', '310-555-1010', 'class_pack_20', 280, 1, 'active', daysAgo(90), null, daysAgo(12), null, 'Last class remaining. Hasn\'t been in 12 days.'],
  ['Chris Huang', 'chris.h@email.com', '310-555-1011', 'class_pack_10', 150, 7, 'active', daysAgo(20), null, daysAgo(3), null, 'New pack buyer. Trying different class types.'],

  // At-risk members — haven't visited in a while
  ['Olivia Foster', 'olivia.f@email.com', '310-555-1012', 'unlimited_monthly', 149, null, 'active', daysAgo(180), daysFromNow(10), daysAgo(25), null, 'Used to come 3x/week. Dropped off suddenly.'],
  ['Ben Marsh', 'ben.marsh@email.com', '310-555-1013', 'unlimited_monthly', 149, null, 'active', daysAgo(150), daysFromNow(6), daysAgo(32), 'Sara Marsh 310-555-9013', 'Hasn\'t been in over a month. Renewal coming up.'],
  ['Zoe Campbell', 'zoe.c@email.com', '310-555-1014', 'unlimited_monthly', 149, null, 'active', daysAgo(120), daysFromNow(15), daysAgo(22), null, 'Was doing boxing 2x/week. Stopped after instructor change.'],
  ['Liam Torres', 'liam.t@email.com', '310-555-1015', 'unlimited_annual', 1399, null, 'active', daysAgo(300), daysFromNow(65), daysAgo(45), null, 'Annual member barely using. Only came 3 times last quarter.'],

  // Frozen
  ['Hannah Lee', 'hannah.lee@email.com', '310-555-1016', 'unlimited_monthly', 149, null, 'frozen', daysAgo(260), null, daysAgo(60), null, 'Medical freeze — knee surgery. Expected back in 2 months.'],
  ['Ryan Davis', 'ryan.d@email.com', '310-555-1017', 'unlimited_monthly', 149, null, 'frozen', daysAgo(200), null, daysAgo(45), null, 'Travel freeze. Out of country until March.'],

  // Cancelled
  ['Jessica Wu', 'jessica.wu@email.com', '310-555-1018', 'unlimited_monthly', 149, null, 'cancelled', daysAgo(300), null, daysAgo(90), null, 'Cancelled — moved to a different neighborhood.'],
  ['Alex Rivera', 'alex.r@email.com', '310-555-1019', 'class_pack_10', 150, 0, 'expired', daysAgo(120), null, daysAgo(75), null, 'Pack expired. No renewal.'],

  // Drop-in
  ['Nora Finch', 'nora.f@email.com', '310-555-1020', 'drop_in', 25, null, 'active', daysAgo(10), null, daysAgo(3), null, 'Trying out the studio. Interested in membership.'],

  // More active members for class booking data
  ['Derek Chang', 'derek.c@email.com', '310-555-1021', 'unlimited_monthly', 149, null, 'active', daysAgo(130), daysFromNow(9), daysAgo(1), null, 'Strength and HIIT regular.'],
  ['Isla Murray', 'isla.m@email.com', '310-555-1022', 'unlimited_monthly', 149, null, 'active', daysAgo(85), daysFromNow(20), daysAgo(2), null, 'Morning spin regular. 5 AM crew.'],
  ['Kai Nakamura', 'kai.n@email.com', '310-555-1023', 'unlimited_annual', 1399, null, 'active', daysAgo(250), daysFromNow(115), daysAgo(0), null, 'Boxing and HIIT. Competes in amateur boxing.'],
  ['Lucy Grant', 'lucy.g@email.com', '310-555-1024', 'class_pack_20', 280, 11, 'active', daysAgo(40), null, daysAgo(1), null, 'Pilates and barre. Steady 2x/week.'],
  ['Omar Hassan', 'omar.h@email.com', '310-555-1025', 'unlimited_monthly', 149, null, 'active', daysAgo(70), daysFromNow(3), daysAgo(0), null, 'Every class type. The enthusiast.'],
];

members.forEach(m => insertMember.run(...m));

// --- Classes (weekly schedule, 14 classes) ---
const insertClass = db.prepare(`
  INSERT INTO classes (name, class_type, instructor_id, day_of_week, start_time, duration_minutes, capacity, room)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

// day_of_week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const classes = [
  // Monday
  ['Sunrise Vinyasa', 'yoga', 1, 1, '06:30', 60, 20, 'Studio A'],
  ['Burn & Build', 'hiit', 2, 1, '07:30', 45, 16, 'Studio B'],
  ['Power Spin', 'spin', 3, 1, '17:30', 45, 24, 'Cycle Room'],
  // Tuesday
  ['Boxing Fundamentals', 'boxing', 2, 2, '07:00', 60, 14, 'Studio B'],
  ['Reformer Pilates', 'pilates', 5, 2, '09:00', 55, 12, 'Studio A'],
  ['Evening Strength', 'strength', 4, 2, '18:00', 60, 16, 'Weight Room'],
  // Wednesday
  ['Morning Meditation', 'meditation', 1, 3, '06:00', 30, 20, 'Studio A'],
  ['HIIT Express', 'hiit', 2, 3, '12:00', 30, 16, 'Studio B'],
  ['Barre Sculpt', 'barre', 5, 3, '17:00', 55, 18, 'Studio A'],
  // Thursday
  ['Spin & Sweat', 'spin', 3, 4, '06:00', 45, 24, 'Cycle Room'],
  ['Yoga Flow', 'yoga', 1, 4, '09:30', 75, 20, 'Studio A'],
  ['Fight Night', 'boxing', 2, 4, '18:30', 60, 14, 'Studio B'],
  // Friday
  ['Total Body Strength', 'strength', 4, 5, '07:00', 60, 16, 'Weight Room'],
  ['Happy Hour Spin', 'spin', 3, 5, '17:00', 45, 24, 'Cycle Room'],
  // Saturday
  ['Weekend Warrior HIIT', 'hiit', 2, 6, '08:00', 60, 20, 'Studio B'],
  ['Slow Flow Yoga', 'yoga', 1, 6, '10:00', 75, 20, 'Studio A'],
  ['Barre & Brunch', 'barre', 5, 6, '11:30', 55, 18, 'Studio A'],
  // Sunday
  ['Restorative Yoga', 'yoga', 1, 0, '09:00', 75, 20, 'Studio A'],
  ['Sunday Spin', 'spin', 3, 0, '10:30', 45, 24, 'Cycle Room'],
];

classes.forEach(c => insertClass.run(...c));

// --- Class Instances & Bookings (past 4 weeks + this week) ---
const insertInstance = db.prepare(`
  INSERT INTO class_instances (class_id, instance_date, instructor_id, status, notes)
  VALUES (?, ?, ?, ?, ?)
`);
const insertBooking = db.prepare(`
  INSERT INTO bookings (member_id, class_instance_id, status, booked_at, checked_in_at)
  VALUES (?, ?, ?, ?, ?)
`);
const insertCheckIn = db.prepare(`
  INSERT INTO check_ins (member_id, check_in_time, check_out_time, type)
  VALUES (?, ?, ?, ?)
`);

// Get day-of-week for a date (0=Sun)
function getDow(d: Date): number {
  return d.getDay();
}

// Generate instances for the last 4 weeks
const classRows = db.prepare('SELECT * FROM classes WHERE is_active = 1').all() as any[];

// Active member IDs for booking assignments
const regularMembers = [1, 2, 3, 4, 5, 6, 7, 21, 22, 23, 24, 25]; // consistent attendees
const packMembers = [8, 9, 10, 11]; // class pack members
const atRiskMembers = [12, 13, 14, 15]; // at-risk (fewer recent bookings)
const dropIn = [20];

let instanceId = 0;

// Booking patterns — who likes what
const memberPrefs: Record<number, string[]> = {
  1: ['yoga', 'meditation', 'pilates'], // Sarah — yoga regular
  2: ['hiit', 'spin', 'strength'],       // Tom — high intensity
  3: ['hiit', 'barre', 'spin'],          // Priya
  4: ['barre', 'pilates', 'yoga'],       // Elena — founding member
  5: ['hiit', 'strength', 'boxing'],     // Jordan — new, consistent
  6: ['yoga', 'strength'],               // Rachel — annual
  7: ['strength', 'hiit', 'spin'],       // David — very active annual
  8: ['yoga'],                           // Mia — yoga only pack
  9: ['spin'],                           // Nathan — spin pack (almost out)
  10: ['barre', 'pilates'],              // Ava — last class (at-risk pack)
  11: ['hiit', 'spin', 'yoga'],          // Chris — new pack, exploring
  12: ['hiit', 'strength', 'spin'],      // Olivia — was active, dropped off
  13: ['yoga', 'meditation'],            // Ben — dropped off
  14: ['boxing'],                        // Zoe — stopped after instructor change
  15: ['hiit'],                          // Liam — barely uses annual
  20: ['yoga'],                          // Nora — drop-in
  21: ['strength', 'hiit'],              // Derek
  22: ['spin'],                          // Isla — morning spin
  23: ['boxing', 'hiit'],                // Kai — competitive
  24: ['pilates', 'barre'],              // Lucy — steady 2x/week
  25: ['hiit', 'spin', 'yoga', 'strength', 'boxing', 'barre'], // Omar — everything
};

for (let weekOffset = 4; weekOffset >= 0; weekOffset--) {
  classRows.forEach(cls => {
    // Find the date for this class this week
    const d = new Date(today);
    d.setDate(d.getDate() - (weekOffset * 7));

    // Find the right day of week
    const currentDow = getDow(d);
    const targetDow = cls.day_of_week;
    const diff = targetDow - currentDow;
    d.setDate(d.getDate() + diff);

    const instDate = dateStr(d);

    // Skip future dates (only generate up to today)
    if (d > today) return;

    const isCompleted = d < today;
    const isCancelled = weekOffset === 2 && cls.id === 7; // Cancel one meditation 2 weeks ago

    instanceId++;
    const status = isCancelled ? 'cancelled' : isCompleted ? 'completed' : 'scheduled';
    const note = isCancelled ? 'Instructor sick — cancelled' : null;

    insertInstance.run(cls.id, instDate, null, status, note);

    if (isCancelled) return;

    // Assign bookings based on member preferences
    const eligibleMembers = [...regularMembers, ...packMembers, ...dropIn].filter(mid => {
      const prefs = memberPrefs[mid];
      return prefs && prefs.includes(cls.class_type);
    });

    // At-risk members only booked in older weeks
    if (weekOffset >= 3) {
      atRiskMembers.forEach(mid => {
        const prefs = memberPrefs[mid];
        if (prefs && prefs.includes(cls.class_type)) {
          eligibleMembers.push(mid);
        }
      });
    }
    // Member 12 (Olivia) also booked week 3 (25 days ago is her last visit)
    // Member 15 (Liam) booked very rarely — only 1 class in last 3 months

    // Randomize attendance — fill ~60-85% of capacity
    const fillRate = 0.6 + Math.random() * 0.25;
    const attendeeCount = Math.min(Math.floor(cls.capacity * fillRate), eligibleMembers.length);

    // Shuffle and pick
    const shuffled = eligibleMembers.sort(() => Math.random() - 0.5).slice(0, attendeeCount);

    shuffled.forEach((memberId, idx) => {
      let bookingStatus: string;
      if (!isCompleted) {
        bookingStatus = 'booked';
      } else {
        // ~85% attended, ~10% no-show, ~5% cancelled
        const roll = Math.random();
        if (roll < 0.85) bookingStatus = 'attended';
        else if (roll < 0.95) bookingStatus = 'no_show';
        else bookingStatus = 'cancelled';
      }

      const bookedAt = `${instDate} ${String(8 + Math.floor(Math.random() * 12)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`;
      const checkedIn = bookingStatus === 'attended' ? `${instDate} ${cls.start_time}:00` : null;

      insertBooking.run(memberId, instanceId, bookingStatus, bookedAt, checkedIn);

      // Add check-in record for attended
      if (bookingStatus === 'attended') {
        const checkOutTime = new Date(`${instDate}T${cls.start_time}:00`);
        checkOutTime.setMinutes(checkOutTime.getMinutes() + cls.duration_minutes + 15);
        const coStr = `${instDate} ${String(checkOutTime.getHours()).padStart(2, '0')}:${String(checkOutTime.getMinutes()).padStart(2, '0')}:00`;
        insertCheckIn.run(memberId, `${instDate} ${cls.start_time}:00`, coStr, 'class');
      }
    });

    // Add waitlisted members for popular classes
    if (attendeeCount >= cls.capacity - 2 && eligibleMembers.length > attendeeCount) {
      const waitlisted = eligibleMembers.filter(m => !shuffled.includes(m)).slice(0, 2);
      waitlisted.forEach(memberId => {
        const bookedAt = `${instDate} ${String(14 + Math.floor(Math.random() * 4)).padStart(2, '0')}:00:00`;
        insertBooking.run(memberId, instanceId, 'waitlisted', bookedAt, null);
      });
    }
  });
}

// Add some gym-only check-ins (not class-related)
const gymCheckInMembers = [2, 5, 7, 21, 23, 25];
gymCheckInMembers.forEach(mid => {
  for (let d = 0; d < 14; d++) {
    if (Math.random() < 0.4) { // ~40% of days
      const date = daysAgo(d);
      const hour = 5 + Math.floor(Math.random() * 14);
      const checkIn = `${date} ${String(hour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`;
      const checkOut = `${date} ${String(hour + 1).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`;
      insertCheckIn.run(mid, checkIn, checkOut, 'gym');
    }
  }
});

// Add upcoming scheduled instances for the rest of this week and next
for (let dayOffset = 1; dayOffset <= 10; dayOffset++) {
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + dayOffset);
  const futureDow = getDow(futureDate);
  const fDateStr = dateStr(futureDate);

  classRows.filter(c => c.day_of_week === futureDow).forEach(cls => {
    instanceId++;
    insertInstance.run(cls.id, fDateStr, null, 'scheduled', null);

    // Pre-book some members
    const eligibleMembers = [...regularMembers, ...packMembers].filter(mid => {
      const prefs = memberPrefs[mid];
      return prefs && prefs.includes(cls.class_type);
    });

    const bookCount = Math.min(Math.floor(cls.capacity * 0.3 + Math.random() * cls.capacity * 0.3), eligibleMembers.length);
    const booked = eligibleMembers.sort(() => Math.random() - 0.5).slice(0, bookCount);

    booked.forEach(memberId => {
      const bookedAt = `${daysAgo(Math.floor(Math.random() * 3))} 12:00:00`;
      insertBooking.run(memberId, instanceId, 'booked', bookedAt, null);
    });
  });
}

db.close();

const memberCount = 25;
const instructorCount = 6;
const classCount = classes.length;
const instanceCount = instanceId;

console.log(`Seeded Iron Pulse Fitness:`);
console.log(`  ${instructorCount} instructors`);
console.log(`  ${memberCount} members`);
console.log(`  ${classCount} weekly classes`);
console.log(`  ${instanceCount} class instances (4 weeks + upcoming)`);
console.log(`  Bookings, check-ins, and attendance data generated`);
