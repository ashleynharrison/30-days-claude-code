import { getDb, createTables, closeDb } from "./database.js";

// ── Helpers ─────────────────────────────────────────────────

function date(daysAgo: number): string {
  const d = new Date("2026-02-24");
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function futureDate(daysAhead: number): string {
  const d = new Date("2026-02-24");
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

const PLAN_PRICES: Record<string, number> = {
  Starter: 29,
  Pro: 59,
  Business: 99,
  Enterprise: 199,
};

const REPS = ["Priya Sharma", "Marcus Lee", "Rachel Torres", "Devon Okafor"];
const PAYMENT_METHODS = [
  "Visa ending 4242",
  "Visa ending 8821",
  "Mastercard ending 5555",
  "Amex ending 1001",
  "ACH - First Republic",
  "ACH - Chase Business",
  "Wire Transfer",
];

let invoiceCounter = 1;
let ticketCounter = 8800;

function invoiceNumber(): string {
  return `INV-2026-${String(invoiceCounter++).padStart(4, "0")}`;
}

function ticketNumber(): string {
  return `TKT-${ticketCounter++}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Seed ────────────────────────────────────────────────────

function seed() {
  const db = getDb();

  // Drop existing tables
  db.exec(`
    DROP TABLE IF EXISTS plan_changes;
    DROP TABLE IF EXISTS tickets;
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS invoices;
    DROP TABLE IF EXISTS customers;
  `);

  createTables();

  // ── Customers ───────────────────────────────────────────

  const customers = [
    // Starter (8 customers)
    { name: "Greenfield Analytics", contact_name: "Jordan Greenfield", contact_email: "jordan@greenfieldanalytics.com", plan: "Starter", seats: 3, billing_cycle: "monthly", status: "Active", signup_date: date(180), next_renewal_date: futureDate(6) },
    { name: "Brightpath Studios", contact_name: "Mia Torres", contact_email: "mia@brightpathstudios.com", plan: "Starter", seats: 2, billing_cycle: "monthly", status: "Active", signup_date: date(120), next_renewal_date: futureDate(6) },
    { name: "Juniper Health Co", contact_name: "Nate Park", contact_email: "nate@juniperhealth.co", plan: "Starter", seats: 5, billing_cycle: "monthly", status: "Past Due", signup_date: date(90), next_renewal_date: date(-3) },
    { name: "Pixel Forge Design", contact_name: "Sasha Reeves", contact_email: "sasha@pixelforge.design", plan: "Starter", seats: 1, billing_cycle: "monthly", status: "Trial", signup_date: date(10), next_renewal_date: futureDate(4) },
    { name: "Lunar Roast Coffee", contact_name: "Emmy Chang", contact_email: "emmy@lunarroast.com", plan: "Starter", seats: 2, billing_cycle: "monthly", status: "Active", signup_date: date(200), next_renewal_date: futureDate(6) },
    { name: "Mosaic Legal Group", contact_name: "Cameron Watts", contact_email: "cameron@mosaiclegal.com", plan: "Starter", seats: 4, billing_cycle: "annual", status: "Active", signup_date: date(300), next_renewal_date: futureDate(65) },
    { name: "Heron Bay Consulting", contact_name: "Patricia Liu", contact_email: "patricia@heronbay.co", plan: "Starter", seats: 3, billing_cycle: "monthly", status: "Churned", signup_date: date(250), next_renewal_date: date(30) },
    { name: "Ridgeline Outdoors", contact_name: "Tyler Moreno", contact_email: "tyler@ridgelineoutdoors.com", plan: "Starter", seats: 2, billing_cycle: "monthly", status: "Active", signup_date: date(60), next_renewal_date: futureDate(6) },

    // Pro (9 customers)
    { name: "Cascade Media Group", contact_name: "Olivia Patel", contact_email: "olivia@cascademedia.io", plan: "Pro", seats: 8, billing_cycle: "annual", status: "Active", signup_date: date(365), next_renewal_date: futureDate(0) },
    { name: "Summit Ridge Partners", contact_name: "Derek Huang", contact_email: "derek@summitridge.com", plan: "Pro", seats: 12, billing_cycle: "monthly", status: "Active", signup_date: date(150), next_renewal_date: futureDate(6) },
    { name: "Clockwork Logistics", contact_name: "Aisha Derry", contact_email: "aisha@clockworklogistics.com", plan: "Pro", seats: 6, billing_cycle: "monthly", status: "Active", signup_date: date(210), next_renewal_date: futureDate(6) },
    { name: "Terraverde Farms", contact_name: "Miguel Santos", contact_email: "miguel@terraverde.farm", plan: "Pro", seats: 5, billing_cycle: "monthly", status: "Past Due", signup_date: date(100), next_renewal_date: date(-7) },
    { name: "Crimson Arc Studios", contact_name: "Zoe Brennan", contact_email: "zoe@crimsonarc.com", plan: "Pro", seats: 10, billing_cycle: "monthly", status: "Active", signup_date: date(170), next_renewal_date: futureDate(6) },
    { name: "Northstar Recruiting", contact_name: "James Whitfield", contact_email: "james@northstarrecruiting.com", plan: "Pro", seats: 7, billing_cycle: "annual", status: "Active", signup_date: date(280), next_renewal_date: futureDate(85) },
    { name: "Bluebird Education", contact_name: "Hannah Kim", contact_email: "hannah@bluebirdedu.org", plan: "Pro", seats: 15, billing_cycle: "monthly", status: "Active", signup_date: date(190), next_renewal_date: futureDate(6) },
    { name: "Ember & Oak Creative", contact_name: "Liam Foster", contact_email: "liam@emberandoak.co", plan: "Pro", seats: 4, billing_cycle: "monthly", status: "Trial", signup_date: date(12), next_renewal_date: futureDate(2) },
    { name: "Daybreak Wellness", contact_name: "Rosa Mendes", contact_email: "rosa@daybreakwellness.com", plan: "Pro", seats: 6, billing_cycle: "monthly", status: "Churned", signup_date: date(320), next_renewal_date: date(50) },

    // Business (8 customers)
    { name: "Atlas Ventures", contact_name: "Kai Nakamura", contact_email: "kai@atlasventures.co", plan: "Business", seats: 20, billing_cycle: "annual", status: "Active", signup_date: date(400), next_renewal_date: futureDate(145) },
    { name: "Ironclad Security", contact_name: "Vanessa Cole", contact_email: "vanessa@ironcladsec.com", plan: "Business", seats: 15, billing_cycle: "monthly", status: "Active", signup_date: date(200), next_renewal_date: futureDate(6) },
    { name: "Solstice Financial", contact_name: "Robert Drake", contact_email: "robert@solsticefinancial.com", plan: "Business", seats: 25, billing_cycle: "monthly", status: "Active", signup_date: date(310), next_renewal_date: futureDate(6) },
    { name: "Verdant Realty Group", contact_name: "Diana Osei", contact_email: "diana@verdantrealty.com", plan: "Business", seats: 10, billing_cycle: "monthly", status: "Active", signup_date: date(140), next_renewal_date: futureDate(6) },
    { name: "Kinetic Sports Tech", contact_name: "Andre Williams", contact_email: "andre@kineticsports.tech", plan: "Business", seats: 18, billing_cycle: "annual", status: "Active", signup_date: date(260), next_renewal_date: futureDate(105) },
    { name: "Prism Data Labs", contact_name: "Elena Volkov", contact_email: "elena@prismdatalabs.com", plan: "Business", seats: 12, billing_cycle: "monthly", status: "Past Due", signup_date: date(180), next_renewal_date: date(-5) },
    { name: "Windward Shipping", contact_name: "Marcus Chen", contact_email: "marcus@windwardshipping.com", plan: "Business", seats: 30, billing_cycle: "monthly", status: "Active", signup_date: date(350), next_renewal_date: futureDate(6) },
    { name: "Cornerstone Edu", contact_name: "Felicia Grant", contact_email: "felicia@cornerstoneedu.org", plan: "Business", seats: 8, billing_cycle: "monthly", status: "Churned", signup_date: date(270), next_renewal_date: date(20) },

    // Enterprise (5 customers)
    { name: "Pacific Dynamics Corp", contact_name: "Christine Yang", contact_email: "cyang@pacificdynamics.com", plan: "Enterprise", seats: 50, billing_cycle: "annual", status: "Active", signup_date: date(500), next_renewal_date: futureDate(230) },
    { name: "Meridian Biotech", contact_name: "Dr. Samuel Okonkwo", contact_email: "sokonkwo@meridianbio.com", plan: "Enterprise", seats: 75, billing_cycle: "annual", status: "Active", signup_date: date(450), next_renewal_date: futureDate(180) },
    { name: "Vanguard Solutions", contact_name: "Lisa Tran", contact_email: "ltran@vanguardsolutions.com", plan: "Enterprise", seats: 40, billing_cycle: "annual", status: "Active", signup_date: date(380), next_renewal_date: futureDate(120) },
    { name: "Apex Manufacturing", contact_name: "Gary Hoffman", contact_email: "ghoffman@apexmfg.com", plan: "Enterprise", seats: 100, billing_cycle: "annual", status: "Active", signup_date: date(600), next_renewal_date: futureDate(90) },
    { name: "Sterling Commerce", contact_name: "Natasha Petrov", contact_email: "npetrov@sterlingcommerce.com", plan: "Enterprise", seats: 35, billing_cycle: "annual", status: "Churned", signup_date: date(420), next_renewal_date: date(15) },
  ];

  const insertCustomer = db.prepare(`
    INSERT INTO customers (name, contact_name, contact_email, plan, seats, mrr, billing_cycle, status, signup_date, next_renewal_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCustomers = db.transaction(() => {
    for (const c of customers) {
      const mrr = PLAN_PRICES[c.plan] * c.seats;
      insertCustomer.run(c.name, c.contact_name, c.contact_email, c.plan, c.seats, mrr, c.billing_cycle, c.status, c.signup_date, c.next_renewal_date);
    }
  });
  insertCustomers();

  // ── Invoices & Transactions ─────────────────────────────

  const insertInvoice = db.prepare(`
    INSERT INTO invoices (customer_id, invoice_number, amount, status, issued_date, paid_date, line_items)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTransaction = db.prepare(`
    INSERT INTO transactions (customer_id, invoice_id, type, amount, description, date, payment_method, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const generateBilling = db.transaction(() => {
    for (let custIdx = 0; custIdx < customers.length; custIdx++) {
      const custId = custIdx + 1;
      const c = customers[custIdx];
      const pricePerSeat = PLAN_PRICES[c.plan];
      const monthlyAmount = pricePerSeat * c.seats;
      const pm = pick(PAYMENT_METHODS);

      // Skip trials — they haven't been billed yet
      if (c.status === "Trial") continue;

      // Generate 4-6 months of invoices depending on signup age
      const monthsActive = Math.min(6, Math.floor((new Date("2026-02-24").getTime() - new Date(c.signup_date).getTime()) / (30 * 86400000)));

      for (let m = 0; m < monthsActive; m++) {
        const issuedDate = date(m * 30 + 15);
        const amount = c.billing_cycle === "annual" ? monthlyAmount * 12 : monthlyAmount;

        // Annual customers get 1 annual invoice, but also generate quarterly add-on invoices
        if (c.billing_cycle === "annual" && m > 0) {
          // Generate quarterly add-on/adjustment invoices for annual customers
          if (m % 2 === 0) {
            const addOnAmount = pricePerSeat * Math.ceil(c.seats * 0.1); // ~10% add-on
            const addOnInv = invoiceNumber();
            const addOnDate = date(m * 30 + 10);
            insertInvoice.run(custId, addOnInv, addOnAmount, "Paid", addOnDate, date(m * 30 + 8),
              JSON.stringify([{ description: `Add-on services — ${c.plan} Plan`, amount: addOnAmount }]));
            const addOnInvId = Number(db.prepare("SELECT last_insert_rowid() as id").get()!["id" as keyof object]);
            insertTransaction.run(custId, addOnInvId, "Charge", addOnAmount, `Payment for ${addOnInv}`, date(m * 30 + 8), pm, "Succeeded");
          }
          continue;
        }

        const lineItems = JSON.stringify([
          { description: `${c.plan} Plan — ${c.seats} seats`, amount: amount },
        ]);

        let invStatus = "Paid";
        let paidDate: string | null = date(m * 30 + 13);

        // Most recent invoice for past-due customers is pending
        if (c.status === "Past Due" && m === 0) {
          invStatus = "Pending";
          paidDate = null;
        }

        const invNum = invoiceNumber();
        insertInvoice.run(custId, invNum, amount, invStatus, issuedDate, paidDate, lineItems);
        const invId = Number(db.prepare("SELECT last_insert_rowid() as id").get()!["id" as keyof object]);

        // Create matching transaction
        if (invStatus === "Paid") {
          insertTransaction.run(custId, invId, "Charge", amount, `Payment for ${invNum}`, paidDate!, pm, "Succeeded");
        } else {
          // Failed attempt for past-due
          insertTransaction.run(custId, invId, "Charge", amount, `Payment attempt for ${invNum}`, issuedDate, pm, "Failed");
        }
      }
    }

    // ── Additional transactions for volume ──────────────────
    // Add credits, prorations, and misc charges for monthly customers
    for (let custIdx = 0; custIdx < customers.length; custIdx++) {
      const custId = custIdx + 1;
      const c = customers[custIdx];
      if (c.status === "Trial") continue;
      const pm = pick(PAYMENT_METHODS);
      const pricePerSeat = PLAN_PRICES[c.plan];

      // Proration charges for seat changes (random subset)
      if (custIdx % 3 === 0) {
        const proAmount = pricePerSeat * 2 * (15 / 30);
        insertTransaction.run(custId, null, "Proration", proAmount, `Proration — 2 seat addition mid-cycle`, date(45 + custIdx * 3), pm, "Succeeded");
      }

      // Credits for various reasons
      if (custIdx % 4 === 0) {
        const creditAmount = pricePerSeat * 0.5;
        insertTransaction.run(custId, null, "Credit", creditAmount, `Service credit — outage on ${date(70 + custIdx)}`, date(65 + custIdx), "N/A", "Succeeded");
      }

      // Some customers have a secondary charge (overage, etc.)
      if (custIdx % 2 === 0 && c.billing_cycle === "monthly") {
        const overageAmount = Math.round(pricePerSeat * c.seats * 0.15 * 100) / 100;
        const overageInv = invoiceNumber();
        const overageDate = date(22 + custIdx * 2);
        insertInvoice.run(custId, overageInv, overageAmount, "Paid", overageDate, date(20 + custIdx * 2),
          JSON.stringify([{ description: `Overage — API usage above plan limit`, amount: overageAmount }]));
        const overageInvId = Number(db.prepare("SELECT last_insert_rowid() as id").get()!["id" as keyof object]);
        insertTransaction.run(custId, overageInvId, "Charge", overageAmount, `Overage payment for ${overageInv}`, date(20 + custIdx * 2), pm, "Succeeded");
      }

      // Failed charge attempts for past-due customers (adds to transaction count)
      if (c.status === "Past Due") {
        insertTransaction.run(custId, null, "Charge", pricePerSeat * c.seats, `Auto-retry payment attempt`, date(2), pm, "Failed");
        insertTransaction.run(custId, null, "Charge", pricePerSeat * c.seats, `Auto-retry payment attempt 2`, date(0), pm, "Failed");
      }

      // Additional monthly charges at different dates for active monthly customers
      if (c.status === "Active" && c.billing_cycle === "monthly") {
        // Second set of invoices at different dates to boost count
        for (let m = 0; m < 2; m++) {
          const addDate = date(m * 30 + 75 + custIdx);
          const amt = pricePerSeat * c.seats;
          const inv = invoiceNumber();
          insertInvoice.run(custId, inv, amt, "Paid", addDate, date(m * 30 + 73 + custIdx),
            JSON.stringify([{ description: `${c.plan} Plan — ${c.seats} seats`, amount: amt }]));
          const invId = Number(db.prepare("SELECT last_insert_rowid() as id").get()!["id" as keyof object]);
          insertTransaction.run(custId, invId, "Charge", amt, `Payment for ${inv}`, date(m * 30 + 73 + custIdx), pm, "Succeeded");
        }
      }
    }

    // ── Misc standalone transactions for volume ──────────────
    // Refunds for various resolved disputes
    insertTransaction.run(19, null, "Refund", 99 * 5, "Refund for overcharged seats — Atlas Ventures", date(36), "ACH - Chase Business", "Succeeded");
    insertTransaction.run(27, null, "Refund", 99 * 30, "Duplicate wire payment refund — Windward Shipping", date(46), "Wire Transfer", "Succeeded");
    insertTransaction.run(5, null, "Credit", 29, "Loyalty credit — Lunar Roast Coffee", date(50), "N/A", "Succeeded");
    insertTransaction.run(14, null, "Charge", 59 * 10 * 0.1, "Late payment fee — Crimson Arc Studios", date(55), "Visa ending 4242", "Succeeded");
    insertTransaction.run(22, null, "Credit", 99 * 25 * 0.05, "Volume discount credit — Solstice Financial", date(30), "N/A", "Succeeded");
    insertTransaction.run(10, null, "Proration", 59 * 4 * (10 / 30), "Proration — 4 seats added mid-cycle", date(28), "Mastercard ending 5555", "Succeeded");
    insertTransaction.run(21, null, "Credit", 99 * 2, "Service credit — downtime compensation", date(40), "N/A", "Succeeded");
    insertTransaction.run(15, null, "Charge", 59 * 15 * 0.08, "API overage charge — Bluebird Education", date(25), "ACH - First Republic", "Succeeded");
    insertTransaction.run(2, null, "Charge", 29 * 2 * 0.1, "Storage overage — Brightpath Studios", date(33), "Visa ending 8821", "Succeeded");
    insertTransaction.run(11, null, "Credit", 59, "Referral credit — Clockwork Logistics", date(38), "N/A", "Succeeded");
    insertTransaction.run(16, null, "Proration", 59 * 2 * (8 / 30), "Proration — 2 seats mid-cycle", date(92), "Amex ending 1001", "Succeeded");
    insertTransaction.run(8, null, "Charge", 29 * 2 * 0.05, "Email add-on — Ridgeline Outdoors", date(28), "Visa ending 4242", "Succeeded");

    // ── EDGE CASE 1: Double-charge (Greenfield Analytics, id=1) ──
    const doubleAmount = 29 * 3; // 87
    const doubleDate1 = date(5);
    const doubleDate2 = date(2);
    const doubleInv = invoiceNumber();
    insertInvoice.run(1, doubleInv, doubleAmount, "Paid", doubleDate1, doubleDate1, JSON.stringify([{ description: "Starter Plan — 3 seats", amount: doubleAmount }]));
    const doubleInvId = Number(db.prepare("SELECT last_insert_rowid() as id").get()!["id" as keyof object]);
    insertTransaction.run(1, doubleInvId, "Charge", doubleAmount, `Payment for ${doubleInv}`, doubleDate1, "Visa ending 4242", "Succeeded");
    // Duplicate charge — same amount, 3 days later
    insertTransaction.run(1, null, "Charge", doubleAmount, "Duplicate charge — system error", doubleDate2, "Visa ending 4242", "Succeeded");

    // ── EDGE CASE 2: 3 failed attempts then success (Juniper Health, id=3) ──
    const retryAmount = 29 * 5; // 145
    const retryInv = invoiceNumber();
    insertInvoice.run(3, retryInv, retryAmount, "Paid", date(20), date(14), JSON.stringify([{ description: "Starter Plan — 5 seats", amount: retryAmount }]));
    const retryInvId = Number(db.prepare("SELECT last_insert_rowid() as id").get()!["id" as keyof object]);
    insertTransaction.run(3, retryInvId, "Charge", retryAmount, `Payment attempt 1 for ${retryInv}`, date(20), "Visa ending 8821", "Failed");
    insertTransaction.run(3, retryInvId, "Charge", retryAmount, `Payment attempt 2 for ${retryInv}`, date(18), "Visa ending 8821", "Failed");
    insertTransaction.run(3, retryInvId, "Charge", retryAmount, `Payment attempt 3 for ${retryInv}`, date(16), "Visa ending 8821", "Failed");
    insertTransaction.run(3, retryInvId, "Charge", retryAmount, `Payment for ${retryInv} (retry succeeded)`, date(14), "ACH - Chase Business", "Succeeded");

    // ── EDGE CASE 3: Annual downgrade mid-cycle with proration credit (Cascade Media, id=9) ──
    // They were on Business with 15 seats, downgraded to Pro with 8 seats mid-cycle
    const prorationCredit = -((99 * 15 - 59 * 8) * (6 / 12)); // ~negative credit for remaining half-year
    insertTransaction.run(9, null, "Credit", Math.abs(prorationCredit), "Proration credit — downgrade from Business 15 seats to Pro 8 seats (6 months remaining)", date(45), "N/A", "Succeeded");

    // ── EDGE CASE 4: Churned customer with open refund request (Sterling Commerce, id=30) ──
    // Already churned — add a refund-related transaction
    const refundInv = invoiceNumber();
    insertInvoice.run(30, refundInv, 199 * 35, "Refunded", date(25), date(25), JSON.stringify([{ description: "Enterprise Plan — 35 seats (annual)", amount: 199 * 35 }]));
    const refundInvId = Number(db.prepare("SELECT last_insert_rowid() as id").get()!["id" as keyof object]);
    insertTransaction.run(30, refundInvId, "Charge", 199 * 35, `Payment for ${refundInv}`, date(25), "Wire Transfer", "Succeeded");
    insertTransaction.run(30, refundInvId, "Refund", 199 * 35, "Full refund — account churned, disputed annual renewal", date(18), "Wire Transfer", "Pending");

    // ── EDGE CASE 5: Enterprise true-up — Apex Manufacturing (id=29) added 12 seats mid-quarter ──
    const trueUpSeats = 12;
    const trueUpMonths = 2; // remaining in quarter
    const trueUpAmount = 199 * trueUpSeats * trueUpMonths;
    const trueUpInv = invoiceNumber();
    insertInvoice.run(29, trueUpInv, trueUpAmount, "Paid", date(35), date(33), JSON.stringify([
      { description: `True-up: ${trueUpSeats} additional seats × $199 × ${trueUpMonths} months remaining`, amount: trueUpAmount },
    ]));
    const trueUpInvId = Number(db.prepare("SELECT last_insert_rowid() as id").get()!["id" as keyof object]);
    insertTransaction.run(29, trueUpInvId, "Charge", trueUpAmount, `True-up payment for ${trueUpInv} — 12 seats added mid-quarter`, date(33), "ACH - First Republic", "Succeeded");
    insertTransaction.run(29, null, "Proration", trueUpAmount, "Proration charge — 12 Enterprise seats for 2 remaining months", date(33), "ACH - First Republic", "Succeeded");
  });

  generateBilling();

  // ── Tickets ─────────────────────────────────────────────

  const insertTicket = db.prepare(`
    INSERT INTO tickets (customer_id, ticket_number, subject, category, status, assigned_to, created_date, resolved_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tickets = [
    // Billing disputes
    { customer_id: 1, subject: "Charged twice in February", category: "Billing Dispute", status: "Open", assigned_to: "Priya Sharma", created_date: date(1), resolved_date: null, notes: "Customer reports two charges of $87.00 within a few days. Needs investigation." },
    { customer_id: 22, subject: "Invoice amount doesn't match contract", category: "Billing Dispute", status: "Escalated", assigned_to: "Marcus Lee", created_date: date(8), resolved_date: null, notes: "Solstice Financial claims their Enterprise rate should be $180/seat per custom deal. Escalated to finance." },
    { customer_id: 19, subject: "Overcharged after seat removal", category: "Billing Dispute", status: "Resolved", assigned_to: "Rachel Torres", created_date: date(40), resolved_date: date(37), notes: "Atlas Ventures removed 5 seats but was charged full amount. Credit issued." },
    { customer_id: 14, subject: "Disputed auto-renewal charge", category: "Billing Dispute", status: "Open", assigned_to: "Devon Okafor", created_date: date(3), resolved_date: null, notes: "Crimson Arc says they requested cancellation before renewal." },

    // Refund requests
    { customer_id: 30, subject: "Full refund for annual renewal — account cancelled", category: "Refund Request", status: "Open", assigned_to: "Priya Sharma", created_date: date(15), resolved_date: null, notes: "Sterling Commerce churned but was charged for annual renewal. Requesting full refund of $6,965." },
    { customer_id: 7, subject: "Refund for unused month after churn", category: "Refund Request", status: "Pending", assigned_to: "Marcus Lee", created_date: date(25), resolved_date: null, notes: "Heron Bay cancelled mid-month, requesting prorated refund." },
    { customer_id: 27, subject: "Refund for duplicate payment", category: "Refund Request", status: "Resolved", assigned_to: "Rachel Torres", created_date: date(50), resolved_date: date(47), notes: "Windward Shipping accidentally paid twice via wire. Refund processed." },
    { customer_id: 18, subject: "Requesting trial extension or refund", category: "Refund Request", status: "Pending", assigned_to: "Devon Okafor", created_date: date(5), resolved_date: null, notes: "Ember & Oak says they weren't ready to convert from trial." },

    // Plan changes
    { customer_id: 9, subject: "Downgrade from Business to Pro", category: "Plan Change", status: "Resolved", assigned_to: "Priya Sharma", created_date: date(48), resolved_date: date(45), notes: "Cascade Media downsizing. Processed downgrade with proration credit." },
    { customer_id: 10, subject: "Upgrade to Business tier", category: "Plan Change", status: "Resolved", assigned_to: "Marcus Lee", created_date: date(30), resolved_date: date(28), notes: "Summit Ridge growing fast — needs Business features." },
    { customer_id: 5, subject: "Add 3 seats to Starter plan", category: "Plan Change", status: "Resolved", assigned_to: "Rachel Torres", created_date: date(20), resolved_date: date(19), notes: "Lunar Roast hiring. Seats added, next invoice adjusted." },
    { customer_id: 20, subject: "Considering Enterprise upgrade", category: "Plan Change", status: "Open", assigned_to: "Devon Okafor", created_date: date(4), resolved_date: null, notes: "Verdant Realty exploring Enterprise for compliance features." },

    // Payment failed
    { customer_id: 3, subject: "Card declined 3 times", category: "Payment Failed", status: "Resolved", assigned_to: "Priya Sharma", created_date: date(19), resolved_date: date(14), notes: "Juniper Health's Visa was declined. Switched to ACH, payment succeeded." },
    { customer_id: 12, subject: "Payment failed — expired card", category: "Payment Failed", status: "Open", assigned_to: "Marcus Lee", created_date: date(6), resolved_date: null, notes: "Terraverde Farms card expired. Awaiting updated payment method." },
    { customer_id: 25, subject: "ACH payment returned", category: "Payment Failed", status: "Pending", assigned_to: "Rachel Torres", created_date: date(10), resolved_date: null, notes: "Prism Data Labs ACH was returned. Insufficient funds. Following up." },
    { customer_id: 8, subject: "Payment processing error", category: "Payment Failed", status: "Resolved", assigned_to: "Devon Okafor", created_date: date(35), resolved_date: date(33), notes: "Ridgeline Outdoors — gateway timeout. Re-processed successfully." },

    // Invoice questions
    { customer_id: 16, subject: "What are the proration charges on my invoice?", category: "Invoice Question", status: "Resolved", assigned_to: "Priya Sharma", created_date: date(22), resolved_date: date(21), notes: "Northstar Recruiting confused by proration after seat addition. Explained calculation." },
    { customer_id: 29, subject: "Need invoice breakdown for true-up", category: "Invoice Question", status: "Resolved", assigned_to: "Marcus Lee", created_date: date(32), resolved_date: date(30), notes: "Apex Manufacturing CFO needs detailed breakdown of 12-seat true-up for board." },
    { customer_id: 21, subject: "Can we get net-30 payment terms?", category: "Invoice Question", status: "Open", assigned_to: "Rachel Torres", created_date: date(7), resolved_date: null, notes: "Ironclad Security requesting net-30. Checking policy for Business tier." },
    { customer_id: 26, subject: "Tax line item missing from invoice", category: "Invoice Question", status: "Pending", assigned_to: "Devon Okafor", created_date: date(12), resolved_date: null, notes: "Kinetic Sports needs tax broken out separately for their accounting." },

    // Cancellations
    { customer_id: 30, subject: "Cancel account — moving to competitor", category: "Cancellation", status: "Resolved", assigned_to: "Priya Sharma", created_date: date(20), resolved_date: date(18), notes: "Sterling Commerce leaving for competitor. Exit survey completed." },
    { customer_id: 7, subject: "Cancel — budget cuts", category: "Cancellation", status: "Resolved", assigned_to: "Marcus Lee", created_date: date(32), resolved_date: date(30), notes: "Heron Bay consulting lost a major client. Cannot justify expense." },
    { customer_id: 28, subject: "Cancel — not using the product", category: "Cancellation", status: "Resolved", assigned_to: "Rachel Torres", created_date: date(22), resolved_date: date(20), notes: "Cornerstone Edu never fully adopted. Offered training but declined." },
    { customer_id: 17, subject: "Considering cancellation", category: "Cancellation", status: "Open", assigned_to: "Devon Okafor", created_date: date(2), resolved_date: null, notes: "Daybreak Wellness unhappy with recent pricing change. Attempting retention." },

    // Additional tickets for volume
    { customer_id: 2, subject: "Need a copy of last 3 invoices", category: "Invoice Question", status: "Resolved", assigned_to: "Priya Sharma", created_date: date(15), resolved_date: date(14), notes: "Brightpath Studios needs invoices for tax filing." },
    { customer_id: 11, subject: "Add 2 more seats", category: "Plan Change", status: "Resolved", assigned_to: "Marcus Lee", created_date: date(42), resolved_date: date(41), notes: "Clockwork Logistics expanding operations team." },
    { customer_id: 23, subject: "Upgrade from Pro to Enterprise", category: "Plan Change", status: "Resolved", assigned_to: "Rachel Torres", created_date: date(55), resolved_date: date(50), notes: "Vanguard Solutions needs SSO and audit logs." },
    { customer_id: 6, subject: "Annual renewal coming up — any discounts?", category: "Invoice Question", status: "Open", assigned_to: "Devon Okafor", created_date: date(3), resolved_date: null, notes: "Mosaic Legal asking about loyalty discount for year 2." },
    { customer_id: 15, subject: "Payment not reflected on portal", category: "Payment Failed", status: "Resolved", assigned_to: "Priya Sharma", created_date: date(28), resolved_date: date(26), notes: "Bluebird Education — payment processing delay. Resolved after sync." },
    { customer_id: 24, subject: "Seat reduction from 100 to 85", category: "Plan Change", status: "Open", assigned_to: "Marcus Lee", created_date: date(5), resolved_date: null, notes: "Apex Manufacturing restructuring. Want to reduce seats." },
    { customer_id: 13, subject: "Wrong email on invoices", category: "Invoice Question", status: "Resolved", assigned_to: "Rachel Torres", created_date: date(18), resolved_date: date(17), notes: "Northstar Recruiting — updated billing email from old address." },
    { customer_id: 4, subject: "How to add teammates to trial?", category: "Plan Change", status: "Open", assigned_to: "Devon Okafor", created_date: date(8), resolved_date: null, notes: "Pixel Forge wants to add 2 more trial users before deciding." },
    { customer_id: 22, subject: "Requesting net-60 terms", category: "Invoice Question", status: "Escalated", assigned_to: "Priya Sharma", created_date: date(14), resolved_date: null, notes: "Solstice Financial — large account requesting extended terms. Needs VP approval." },
    { customer_id: 27, subject: "Upgrade to Enterprise with custom pricing", category: "Plan Change", status: "Pending", assigned_to: "Marcus Lee", created_date: date(9), resolved_date: null, notes: "Windward Shipping — 30 seats, requesting volume discount for Enterprise." },
    { customer_id: 19, subject: "Annual renewal review", category: "Invoice Question", status: "Resolved", assigned_to: "Rachel Torres", created_date: date(60), resolved_date: date(58), notes: "Atlas Ventures — reviewed renewal terms. No changes." },
    { customer_id: 1, subject: "Can I get a receipt for the duplicate charge?", category: "Billing Dispute", status: "Open", assigned_to: "Priya Sharma", created_date: date(0), resolved_date: null, notes: "Greenfield Analytics needs receipt for accounting while dispute is resolved." },
    { customer_id: 9, subject: "Proration credit not yet applied", category: "Billing Dispute", status: "Open", assigned_to: "Devon Okafor", created_date: date(1), resolved_date: null, notes: "Cascade Media says proration credit from downgrade hasn't shown on latest invoice." },
    { customer_id: 12, subject: "Update payment method", category: "Payment Failed", status: "Open", assigned_to: "Marcus Lee", created_date: date(4), resolved_date: null, notes: "Terraverde Farms sending new card details." },
    { customer_id: 26, subject: "Need W-9 for vendor setup", category: "Invoice Question", status: "Resolved", assigned_to: "Rachel Torres", created_date: date(44), resolved_date: date(42), notes: "Kinetic Sports needs W-9 to add us as vendor in their system." },
    { customer_id: 24, subject: "Need breakdown of true-up charges for audit", category: "Invoice Question", status: "Pending", assigned_to: "Priya Sharma", created_date: date(2), resolved_date: null, notes: "Apex Manufacturing internal audit requires line-by-line true-up breakdown." },
  ];

  const insertTickets = db.transaction(() => {
    for (const t of tickets) {
      insertTicket.run(t.customer_id, ticketNumber(), t.subject, t.category, t.status, t.assigned_to, t.created_date, t.resolved_date, t.notes);
    }
  });
  insertTickets();

  // ── Plan Changes ────────────────────────────────────────

  const insertPlanChange = db.prepare(`
    INSERT INTO plan_changes (customer_id, previous_plan, new_plan, previous_seats, new_seats, change_type, effective_date, proration_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const planChanges = [
    // Cascade Media downgrade (edge case 3)
    { customer_id: 9, previous_plan: "Business", new_plan: "Pro", previous_seats: 15, new_seats: 8, change_type: "Downgrade", effective_date: date(45), proration_amount: -((99 * 15 - 59 * 8) * (6 / 12)) },

    // Summit Ridge upgrade
    { customer_id: 10, previous_plan: "Pro", new_plan: "Business", previous_seats: 12, new_seats: 12, change_type: "Upgrade", effective_date: date(28), proration_amount: (99 - 59) * 12 * (20 / 30) },

    // Lunar Roast seat addition
    { customer_id: 5, previous_plan: "Starter", new_plan: "Starter", previous_seats: 2, new_seats: 5, change_type: "Seat Addition", effective_date: date(19), proration_amount: 29 * 3 * (11 / 30) },

    // Clockwork Logistics seat addition
    { customer_id: 11, previous_plan: "Pro", new_plan: "Pro", previous_seats: 4, new_seats: 6, change_type: "Seat Addition", effective_date: date(41), proration_amount: 59 * 2 * (19 / 30) },

    // Vanguard Solutions upgrade
    { customer_id: 23, previous_plan: "Pro", new_plan: "Enterprise", previous_seats: 40, new_seats: 40, change_type: "Upgrade", effective_date: date(50), proration_amount: (199 - 59) * 40 * (8 / 12) },

    // Apex Manufacturing true-up (edge case 5)
    { customer_id: 29, previous_plan: "Enterprise", new_plan: "Enterprise", previous_seats: 88, new_seats: 100, change_type: "Seat Addition", effective_date: date(35), proration_amount: 199 * 12 * 2 },

    // Various other changes for volume
    { customer_id: 2, previous_plan: "Starter", new_plan: "Starter", previous_seats: 1, new_seats: 2, change_type: "Seat Addition", effective_date: date(80), proration_amount: 29 * (20 / 30) },
    { customer_id: 14, previous_plan: "Pro", new_plan: "Pro", previous_seats: 8, new_seats: 10, change_type: "Seat Addition", effective_date: date(60), proration_amount: 59 * 2 * (22 / 30) },
    { customer_id: 21, previous_plan: "Business", new_plan: "Business", previous_seats: 12, new_seats: 15, change_type: "Seat Addition", effective_date: date(55), proration_amount: 99 * 3 * (18 / 30) },
    { customer_id: 15, previous_plan: "Starter", new_plan: "Pro", previous_seats: 15, new_seats: 15, change_type: "Upgrade", effective_date: date(90), proration_amount: (59 - 29) * 15 * (10 / 30) },
    { customer_id: 7, previous_plan: "Pro", new_plan: "Starter", previous_seats: 5, new_seats: 3, change_type: "Downgrade", effective_date: date(60), proration_amount: -((59 * 5 - 29 * 3) * (15 / 30)) },
    { customer_id: 17, previous_plan: "Pro", new_plan: "Pro", previous_seats: 8, new_seats: 6, change_type: "Seat Removal", effective_date: date(55), proration_amount: -(59 * 2 * (12 / 30)) },
    { customer_id: 22, previous_plan: "Pro", new_plan: "Business", previous_seats: 25, new_seats: 25, change_type: "Upgrade", effective_date: date(120), proration_amount: (99 - 59) * 25 * (15 / 30) },
    { customer_id: 19, previous_plan: "Business", new_plan: "Business", previous_seats: 18, new_seats: 20, change_type: "Seat Addition", effective_date: date(100), proration_amount: 99 * 2 * (25 / 30) },
    { customer_id: 28, previous_plan: "Business", new_plan: "Pro", previous_seats: 10, new_seats: 8, change_type: "Downgrade", effective_date: date(40), proration_amount: -((99 * 10 - 59 * 8) * (20 / 30)) },
    { customer_id: 6, previous_plan: "Starter", new_plan: "Starter", previous_seats: 3, new_seats: 4, change_type: "Seat Addition", effective_date: date(150), proration_amount: 29 * (10 / 30) },
    { customer_id: 13, previous_plan: "Pro", new_plan: "Pro", previous_seats: 6, new_seats: 7, change_type: "Seat Addition", effective_date: date(70), proration_amount: 59 * (15 / 30) },
    { customer_id: 20, previous_plan: "Pro", new_plan: "Business", previous_seats: 10, new_seats: 10, change_type: "Upgrade", effective_date: date(65), proration_amount: (99 - 59) * 10 * (10 / 30) },
    { customer_id: 24, previous_plan: "Enterprise", new_plan: "Enterprise", previous_seats: 95, new_seats: 100, change_type: "Seat Addition", effective_date: date(110), proration_amount: 199 * 5 * (4 / 12) },
    { customer_id: 8, previous_plan: "Starter", new_plan: "Starter", previous_seats: 1, new_seats: 2, change_type: "Seat Addition", effective_date: date(30), proration_amount: 29 * (15 / 30) },
    { customer_id: 27, previous_plan: "Business", new_plan: "Business", previous_seats: 25, new_seats: 30, change_type: "Seat Addition", effective_date: date(85), proration_amount: 99 * 5 * (20 / 30) },
    { customer_id: 30, previous_plan: "Enterprise", new_plan: "Enterprise", previous_seats: 40, new_seats: 35, change_type: "Seat Removal", effective_date: date(30), proration_amount: -(199 * 5 * (3 / 12)) },
    { customer_id: 16, previous_plan: "Pro", new_plan: "Pro", previous_seats: 5, new_seats: 7, change_type: "Seat Addition", effective_date: date(95), proration_amount: 59 * 2 * (10 / 30) },
    { customer_id: 25, previous_plan: "Business", new_plan: "Business", previous_seats: 10, new_seats: 12, change_type: "Seat Addition", effective_date: date(50), proration_amount: 99 * 2 * (14 / 30) },
    { customer_id: 26, previous_plan: "Pro", new_plan: "Business", previous_seats: 18, new_seats: 18, change_type: "Upgrade", effective_date: date(75), proration_amount: (99 - 59) * 18 * (8 / 30) },
  ];

  const insertPlanChanges = db.transaction(() => {
    for (const pc of planChanges) {
      insertPlanChange.run(
        pc.customer_id,
        pc.previous_plan,
        pc.new_plan,
        pc.previous_seats,
        pc.new_seats,
        pc.change_type,
        pc.effective_date,
        Math.round(pc.proration_amount * 100) / 100
      );
    }
  });
  insertPlanChanges();

  // ── Verify counts ───────────────────────────────────────

  const customerCount = (db.prepare("SELECT COUNT(*) as c FROM customers").get() as { c: number }).c;
  const invoiceCount = (db.prepare("SELECT COUNT(*) as c FROM invoices").get() as { c: number }).c;
  const txnCount = (db.prepare("SELECT COUNT(*) as c FROM transactions").get() as { c: number }).c;
  const ticketCount = (db.prepare("SELECT COUNT(*) as c FROM tickets").get() as { c: number }).c;
  const planChangeCount = (db.prepare("SELECT COUNT(*) as c FROM plan_changes").get() as { c: number }).c;

  console.log("━━━ Database Seeded ━━━");
  console.log(`Customers:    ${customerCount}`);
  console.log(`Invoices:     ${invoiceCount}`);
  console.log(`Transactions: ${txnCount}`);
  console.log(`Tickets:      ${ticketCount}`);
  console.log(`Plan Changes: ${planChangeCount}`);

  closeDb();
}

seed();
