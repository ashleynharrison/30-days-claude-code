import { getDb, initializeDb } from './database.js';

function seed() {
  const db = getDb();
  initializeDb();

  // Clear existing data
  db.exec(`
    DELETE FROM tasks;
    DELETE FROM offers;
    DELETE FROM showings;
    DELETE FROM clients;
    DELETE FROM listings;
    DELETE FROM agents;
  `);

  // ── Agents ──
  const insertAgent = db.prepare(`
    INSERT INTO agents (name, email, phone, role, license_number)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertAgent.run('Nicole Tran', 'nicole@tranrealtygroup.com', '(323) 555-0147', 'Agent', 'DRE-02087451');
  insertAgent.run('Omar Farid', 'omar@tranrealtygroup.com', '(323) 555-0293', 'Agent', 'DRE-02091836');
  insertAgent.run('Jessie Park', 'jessie@tranrealtygroup.com', '(323) 555-0384', 'Coordinator', null);

  // Agent IDs: Nicole=1, Omar=2, Jessie=3

  // ── Listings ──
  // 40 listings: 20 active, 8 pending, 10 sold, 2 expired
  // Realistic LA pricing by neighborhood
  const insertListing = db.prepare(`
    INSERT INTO listings (mls_number, address, city, zip, neighborhood, listing_price, original_price, price_reduced_date,
      bedrooms, bathrooms, sqft, lot_sqft, year_built, property_type, status, listing_date, sold_date, sold_price,
      listing_agent_id, description, features, open_house_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // ─── ACTIVE LISTINGS (20) ───

  // 1: Silver Lake condo — hot listing, 6 showings in one week, 3 competing offers
  insertListing.run('MLS-26-00142', '2847 Hyperion Ave #4', 'Los Angeles', '90027', 'Silver Lake',
    749000, null, null, 2, 2, 1050, null, 2008, 'Condo', 'Active', '2026-02-10', null, null,
    1, 'Modern Silver Lake condo with rooftop deck and city views', '["rooftop deck","in-unit laundry","city views","secure parking"]', null);

  // 2: Mar Vista single family
  insertListing.run('MLS-26-00089', '4215 Beethoven St', 'Los Angeles', '90066', 'Mar Vista',
    1350000, null, null, 3, 2, 1680, 5800, 1952, 'Single Family', 'Active', '2026-01-28', null, null,
    1, 'Updated Mar Vista bungalow with detached studio and mature fruit trees', '["detached studio","updated kitchen","fruit trees","hardwood floors"]', '2026-03-01');

  // 3: Eagle Rock — stale, 95+ days, overpriced
  insertListing.run('MLS-25-08721', '1638 Yosemite Dr', 'Los Angeles', '90041', 'Eagle Rock',
    1150000, 1250000, '2026-01-15', 3, 1.5, 1420, 6200, 1938, 'Single Family', 'Active', '2025-11-22', null, null,
    2, 'Classic Eagle Rock bungalow — original hardwood, spacious lot, needs TLC', '["hardwood floors","large lot","detached garage"]', null);

  // 4: DTLA condo
  insertListing.run('MLS-26-00201', '800 S Spring St #1205', 'Los Angeles', '90014', 'Downtown',
    575000, null, null, 1, 1, 780, null, 2016, 'Condo', 'Active', '2026-02-05', null, null,
    2, 'Sleek DTLA loft in Arts District adjacent building with floor-to-ceiling windows', '["floor-to-ceiling windows","doorman","gym","rooftop pool"]', null);

  // 5: Pasadena single family
  insertListing.run('MLS-26-00167', '1485 Mar Vista Ave', 'Pasadena', '91104', 'Pasadena',
    1280000, null, null, 4, 2.5, 2100, 7500, 1926, 'Single Family', 'Active', '2026-02-01', null, null,
    1, 'Gorgeous Craftsman with original built-ins, updated kitchen, and wraparound porch', '["Craftsman","built-ins","wraparound porch","updated kitchen","ADU potential"]', '2026-03-02');

  // 6: Highland Park
  insertListing.run('MLS-26-00055', '5517 N Figueroa St', 'Los Angeles', '90042', 'Highland Park',
    879000, null, null, 2, 1, 1100, 4800, 1945, 'Single Family', 'Active', '2026-01-15', null, null,
    2, 'Charming Highland Park cottage near York Blvd restaurants', '["original tile","backyard patio","detached garage"]', null);

  // 7: Culver City townhouse
  insertListing.run('MLS-26-00118', '11245 Washington Blvd #B', 'Culver City', '90232', 'Culver City',
    935000, null, null, 3, 2.5, 1550, null, 2019, 'Townhouse', 'Active', '2026-02-08', null, null,
    1, 'Modern townhouse steps from Downtown Culver City with private rooftop', '["private rooftop","2-car garage","smart home","quartz counters"]', null);

  // 8: Silver Lake — larger condo
  insertListing.run('MLS-26-00233', '3011 Rowena Ave #8', 'Los Angeles', '90039', 'Silver Lake',
    695000, null, null, 2, 1, 920, null, 2004, 'Condo', 'Active', '2026-02-15', null, null,
    2, 'Corner unit with Silver Lake Reservoir views and private balcony', '["reservoir views","balcony","in-unit laundry","parking"]', null);

  // 9: Mar Vista — larger SFR
  insertListing.run('MLS-26-00076', '3928 Grandview Blvd', 'Los Angeles', '90066', 'Mar Vista',
    1495000, null, null, 4, 3, 2200, 6400, 1955, 'Single Family', 'Active', '2026-01-20', null, null,
    1, 'Fully renovated mid-century with pool, ADU, and solar panels', '["pool","ADU","solar panels","renovated","mid-century"]', '2026-03-01');

  // 10: DTLA — 2 bed condo
  insertListing.run('MLS-26-00188', '1100 Wilshire Blvd #2408', 'Los Angeles', '90017', 'Downtown',
    685000, null, null, 2, 2, 1150, null, 2020, 'Condo', 'Active', '2026-02-12', null, null,
    1, 'High-rise living with panoramic views and full-service amenities', '["panoramic views","concierge","pool","gym","EV charging"]', null);

  // 11: Eagle Rock — starter
  insertListing.run('MLS-26-00099', '2004 Hill Dr', 'Los Angeles', '90041', 'Eagle Rock',
    875000, null, null, 2, 1, 980, 5100, 1941, 'Single Family', 'Active', '2026-01-30', null, null,
    2, 'Sweet starter home on a quiet street with big backyard', '["large backyard","fruit trees","updated bathroom"]', null);

  // 12: Pasadena — condo
  insertListing.run('MLS-26-00214', '680 S Madison Ave #302', 'Pasadena', '91106', 'Pasadena',
    620000, null, null, 2, 2, 1080, null, 2012, 'Condo', 'Active', '2026-02-18', null, null,
    1, 'Bright Pasadena condo near Old Town with tree-lined views', '["Old Town adjacent","balcony","in-unit laundry","parking"]', null);

  // 13: Highland Park — multi-family
  insertListing.run('MLS-26-00044', '5103 Monte Vista St', 'Los Angeles', '90042', 'Highland Park',
    985000, null, null, 4, 2, 1800, 5600, 1928, 'Multi-Family', 'Active', '2026-01-10', null, null,
    2, 'Duplex — live in one, rent the other. Both units updated.', '["duplex","updated units","separate meters","laundry hookups"]', null);

  // 14: Culver City — condo
  insertListing.run('MLS-26-00155', '10345 National Blvd #201', 'Culver City', '90232', 'Culver City',
    625000, null, null, 1, 1, 800, null, 2017, 'Condo', 'Active', '2026-02-03', null, null,
    1, 'Move-in ready near Sony Studios with resort-style pool', '["resort pool","gym","bike storage","EV charging"]', null);

  // 15: Silver Lake — stale, 60+ days, price reduced
  insertListing.run('MLS-25-09102', '1520 Lucile Ave', 'Los Angeles', '90026', 'Silver Lake',
    1075000, 1175000, '2026-01-20', 3, 2, 1500, 4200, 1924, 'Single Family', 'Active', '2025-12-20', null, null,
    1, 'Silver Lake Craftsman with original details, needs updating in spots', '["Craftsman","original details","hillside views","covered patio"]', null);

  // 16: Pasadena — large family home
  insertListing.run('MLS-26-00178', '2255 E Orange Grove Blvd', 'Pasadena', '91104', 'Pasadena',
    1395000, null, null, 5, 3, 2800, 9000, 1935, 'Single Family', 'Active', '2026-02-06', null, null,
    2, 'Grand Pasadena estate with pool, guest house, and mature landscaping', '["pool","guest house","library","fireplace","mature landscaping"]', null);

  // 17: Mar Vista — townhouse
  insertListing.run('MLS-26-00245', '12110 Venice Blvd #C', 'Los Angeles', '90066', 'Mar Vista',
    895000, null, null, 2, 2.5, 1350, null, 2021, 'Townhouse', 'Active', '2026-02-20', null, null,
    1, 'Brand new construction townhouse with rooftop deck and 2-car garage', '["new construction","rooftop deck","2-car garage","smart home"]', null);

  // 18: Eagle Rock — open house this weekend
  insertListing.run('MLS-26-00260', '4742 Toland Way', 'Los Angeles', '90041', 'Eagle Rock',
    949000, null, null, 3, 2, 1380, 5400, 1947, 'Single Family', 'Active', '2026-02-19', null, null,
    2, 'Move-in ready Eagle Rock home with mountain views and updated kitchen', '["mountain views","updated kitchen","hardwood floors","covered patio"]', '2026-03-01');

  // 19: Highland Park — fixer
  insertListing.run('MLS-26-00032', '6012 Aldama St', 'Los Angeles', '90042', 'Highland Park',
    750000, null, null, 3, 1, 1200, 5000, 1922, 'Single Family', 'Active', '2026-01-05', null, null,
    1, 'Investor special — great bones, needs full renovation, huge lot', '["large lot","original character","fixer-upper","ADU potential"]', null);

  // 20: DTLA — luxury
  insertListing.run('MLS-26-00275', '900 Olympic Blvd #3601', 'Los Angeles', '90015', 'Downtown',
    1250000, null, null, 3, 2.5, 1800, null, 2023, 'Condo', 'Active', '2026-02-22', null, null,
    2, 'Penthouse-level luxury condo with wraparound terrace and city views', '["penthouse","wraparound terrace","city views","valet parking","wine storage"]', null);

  // ─── PENDING LISTINGS (8) ───

  // 21: Pending — closing next week with open tasks
  insertListing.run('MLS-26-00061', '3847 McManus Ave', 'Culver City', '90232', 'Culver City',
    1050000, null, null, 3, 2, 1650, 5200, 1956, 'Single Family', 'Pending', '2025-12-15', null, null,
    1, 'Charming Culver City bungalow under contract — closing soon', '["updated kitchen","hardwood floors","backyard","detached garage"]', null);

  // 22
  insertListing.run('MLS-26-00134', '1917 W Silver Lake Dr #6', 'Los Angeles', '90039', 'Silver Lake',
    820000, null, null, 2, 2, 1180, null, 2015, 'Condo', 'Pending', '2026-01-08', null, null,
    2, 'Silver Lake condo with private patio and walkable to Sunset Junction', '["private patio","Sunset Junction","secure entry","parking"]', null);

  // 23
  insertListing.run('MLS-26-00108', '852 Manzanita St', 'Pasadena', '91103', 'Pasadena',
    1180000, null, null, 3, 2.5, 1900, 6800, 1942, 'Single Family', 'Pending', '2025-12-28', null, null,
    1, 'Pasadena traditional with updated systems and shady backyard', '["new roof","updated HVAC","backyard oasis","near Caltech"]', null);

  // 24
  insertListing.run('MLS-26-00192', '4401 Finley Ave #12', 'Los Angeles', '90027', 'Silver Lake',
    555000, null, null, 1, 1, 680, null, 2010, 'Condo', 'Pending', '2026-01-22', null, null,
    2, 'Efficient Silver Lake one-bed — ideal starter or investment', '["in-unit laundry","parking","walkable"]', null);

  // 25
  insertListing.run('MLS-26-00071', '11834 Culver Blvd #A', 'Los Angeles', '90066', 'Mar Vista',
    1125000, null, null, 3, 2, 1450, null, 2020, 'Townhouse', 'Pending', '2026-01-02', null, null,
    1, 'Like-new Mar Vista townhouse — buyer in escrow', '["new construction","rooftop","2-car garage","open floor plan"]', null);

  // 26
  insertListing.run('MLS-26-00222', '2201 N Ave 50', 'Los Angeles', '90042', 'Highland Park',
    895000, null, null, 3, 1.5, 1300, 4600, 1936, 'Single Family', 'Pending', '2026-01-18', null, null,
    2, 'Highland Park charmer near the Gold Line — multiple offers received', '["Gold Line adjacent","original tile","covered porch"]', null);

  // 27
  insertListing.run('MLS-26-00148', '3760 Glenfeliz Blvd', 'Los Angeles', '90039', 'Atwater Village',
    1195000, null, null, 3, 2, 1550, 5400, 1940, 'Single Family', 'Pending', '2026-01-12', null, null,
    1, 'Atwater Village gem with ADU and walkable to shops', '["ADU","walkable","updated kitchen","backyard"]', null);

  // 28
  insertListing.run('MLS-26-00256', '1005 E Colorado Blvd #410', 'Pasadena', '91106', 'Pasadena',
    590000, null, null, 2, 1, 950, null, 2008, 'Condo', 'Pending', '2026-02-01', null, null,
    2, 'Walk-to-everything Pasadena condo near Old Town and Caltech', '["Old Town adjacent","balcony","secure parking"]', null);

  // ─── SOLD LISTINGS (10) ───

  // 29
  insertListing.run('MLS-25-08340', '4102 Duquesne Ave', 'Culver City', '90232', 'Culver City',
    1080000, null, null, 3, 2, 1520, 5600, 1950, 'Single Family', 'Sold', '2025-09-15', '2025-12-10', 1065000,
    1, 'Updated Culver City home — sold above asking', '["updated kitchen","hardwood floors","backyard"]', null);

  // 30
  insertListing.run('MLS-25-08455', '2311 Bancroft Ave', 'Los Angeles', '90039', 'Silver Lake',
    795000, null, null, 2, 2, 1100, null, 2012, 'Condo', 'Sold', '2025-10-01', '2025-12-20', 810000,
    2, 'Silver Lake condo that sparked a bidding war', '["rooftop access","secure parking","in-unit laundry"]', null);

  // 31
  insertListing.run('MLS-25-08602', '1928 Chickasaw Ave', 'Los Angeles', '90041', 'Eagle Rock',
    925000, null, null, 3, 1.5, 1350, 5800, 1939, 'Single Family', 'Sold', '2025-10-20', '2026-01-05', 910000,
    1, 'Classic Eagle Rock bungalow — sold at a slight discount', '["hardwood floors","detached garage","mature trees"]', null);

  // 32
  insertListing.run('MLS-25-08810', '12405 Pacific Ave', 'Los Angeles', '90066', 'Mar Vista',
    1220000, null, null, 3, 2, 1600, 5200, 1948, 'Single Family', 'Sold', '2025-11-01', '2026-01-15', 1195000,
    2, 'Renovated Mar Vista — closed below asking after 60 DOM', '["renovated","open floor plan","backyard"]', null);

  // 33
  insertListing.run('MLS-25-09001', '245 S Marengo Ave #502', 'Pasadena', '91101', 'Pasadena',
    710000, null, null, 2, 2, 1200, null, 2014, 'Condo', 'Sold', '2025-11-10', '2026-01-20', 720000,
    1, 'Pasadena condo with mountain views — sold over asking', '["mountain views","balcony","pool","gym"]', null);

  // 34
  insertListing.run('MLS-25-09145', '5801 York Blvd', 'Los Angeles', '90042', 'Highland Park',
    830000, null, null, 2, 1, 1050, 4200, 1932, 'Single Family', 'Sold', '2025-11-20', '2026-02-01', 815000,
    2, 'Highland Park bungalow near York Blvd corridor — just closed', '["original character","covered porch","detached garage"]', null);

  // 35
  insertListing.run('MLS-25-09200', '615 S Spring St #808', 'Los Angeles', '90014', 'Downtown',
    520000, null, null, 1, 1, 720, null, 2018, 'Condo', 'Sold', '2025-10-05', '2025-12-15', 510000,
    1, 'DTLA studio-style one-bed — sold quickly', '["doorman","gym","rooftop"]', null);

  // 36
  insertListing.run('MLS-25-09310', '3205 Waverly Dr', 'Los Angeles', '90027', 'Silver Lake',
    1450000, null, null, 4, 3, 2400, 7200, 1930, 'Single Family', 'Sold', '2025-08-15', '2025-11-20', 1420000,
    1, 'Stunning Silver Lake hillside home — sold after extensive renovation', '["hillside","renovated","views","pool","guest suite"]', null);

  // 37
  insertListing.run('MLS-25-09420', '10600 Eastborne Ave', 'Los Angeles', '90024', 'Westwood',
    1650000, null, null, 4, 3, 2600, 8000, 1960, 'Single Family', 'Sold', '2025-09-01', '2025-12-01', 1600000,
    2, 'Westwood classic — sold to relocating family', '["pool","updated","large lot","near UCLA"]', null);

  // 38
  insertListing.run('MLS-25-08950', '4410 Clark Ave', 'Burbank', '91505', 'Burbank',
    980000, null, null, 3, 2, 1500, 6000, 1952, 'Single Family', 'Sold', '2025-10-15', '2026-01-08', 970000,
    1, 'Magnolia Park charmer — sold to first-time buyers', '["Magnolia Park","updated kitchen","backyard","fruit trees"]', null);

  // ─── EXPIRED LISTINGS (2) ───

  // 39: Expired then relisted — this IS listing 3 (Eagle Rock) which was relisted at lower price
  insertListing.run('MLS-25-07890', '1638 Yosemite Dr', 'Los Angeles', '90041', 'Eagle Rock',
    1250000, null, null, 3, 1.5, 1420, 6200, 1938, 'Single Family', 'Expired', '2025-08-01', null, null,
    2, 'Eagle Rock bungalow — original listing expired, relisted as MLS-25-08721', '["hardwood floors","large lot","detached garage"]', null);

  // 40: Another expired
  insertListing.run('MLS-25-08100', '7422 Earldom Ave', 'Los Angeles', '90046', 'Hollywood Hills',
    2250000, null, null, 3, 3, 2100, 4800, 1962, 'Single Family', 'Expired', '2025-07-15', null, null,
    1, 'Hollywood Hills mid-century — overpriced for the location, failed to sell', '["mid-century","city views","pool","carport"]', null);


  // ── Clients (20) ──
  const insertClient = db.prepare(`
    INSERT INTO clients (name, email, phone, type, assigned_agent_id, budget_min, budget_max,
      preferred_neighborhoods, preferred_property_types, bedrooms_min, preapproved, preapproval_amount,
      status, notes, intake_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Buyers
  // 1: Nguyen family — looking for 3-bed in Eagle Rock / Highland Park
  insertClient.run('David & Mai Nguyen', 'nguyen.family@gmail.com', '(626) 555-0142', 'Buyer', 1,
    700000, 1000000, '["Eagle Rock","Highland Park"]', '["Single Family"]', 3, 1, 950000,
    'Active', 'Relocating from Bay Area. Want walkable neighborhood with good schools.', '2026-01-05');

  // 2: Serial browser — seen 12 properties, no offer (edge case)
  insertClient.run('Jason Whitfield', 'jwhitfield@outlook.com', '(310) 555-0288', 'Buyer', 2,
    500000, 750000, '["Silver Lake","Downtown","Highland Park"]', '["Condo","Townhouse"]', 1, 1, 700000,
    'Active', 'Very particular. Has seen 12+ properties. Keeps saying "not quite right."', '2025-11-15');

  // 3: First-time buyer
  insertClient.run('Priya Desai', 'priya.desai@gmail.com', '(213) 555-0376', 'Buyer', 1,
    450000, 650000, '["Downtown","Culver City","Pasadena"]', '["Condo"]', 1, 1, 620000,
    'Active', 'First-time buyer. Pre-approved through Chase. Wants modern finishes.', '2026-01-20');

  // 4: Move-up buyer
  insertClient.run('Marcus & Aliyah Johnson', 'johnson.family@yahoo.com', '(323) 555-0419', 'Buyer', 2,
    1100000, 1500000, '["Mar Vista","Culver City","Pasadena"]', '["Single Family"]', 4, 1, 1400000,
    'Active', 'Selling their condo, upgrading to a house. Need 4 bedrooms for growing family.', '2026-01-10');

  // 5: Investor
  insertClient.run('Raymond Chen', 'rchen@investprop.com', '(626) 555-0503', 'Buyer', 1,
    700000, 1200000, '["Highland Park","Eagle Rock","Mar Vista"]', '["Single Family","Multi-Family"]', 2, 1, 1100000,
    'Active', 'Cash buyer. Looking for rental income properties or fix-and-flips.', '2025-12-01');

  // 6: Under contract buyer
  insertClient.run('Sophie Bergmann', 'sophie.b@gmail.com', '(310) 555-0617', 'Buyer', 1,
    900000, 1100000, '["Culver City","Mar Vista"]', '["Single Family","Townhouse"]', 3, 1, 1050000,
    'Under Contract', 'In escrow on McManus Ave. Closing early March.', '2025-12-15');

  // 7: Budget buyer
  insertClient.run('Tomás Rivera', 'tomas.r@gmail.com', '(213) 555-0738', 'Buyer', 2,
    350000, 600000, '["Downtown","Pasadena"]', '["Condo"]', 1, 0, null,
    'Active', 'Looking for a starter condo. Needs to get pre-approved first.', '2026-02-10');

  // 8: Luxury buyer
  insertClient.run('Victoria Ashworth', 'vashworth@ashworthmgmt.com', '(310) 555-0822', 'Buyer', 1,
    1200000, 2000000, '["Silver Lake","Pasadena"]', '["Single Family"]', 4, 1, 1800000,
    'Active', 'Relocating from NYC. Wants character home with space. Very decisive when she finds the right one.', '2026-02-01');

  // Sellers
  // 9: Seller — listing #2 (Mar Vista)
  insertClient.run('Greg & Hannah Porter', 'portergh@gmail.com', '(310) 555-0934', 'Seller', 1,
    null, null, null, null, null, 0, null,
    'Active', 'Selling Beethoven St home. Moving to Portland.', '2026-01-15');

  // 10: Seller — listing #5 (Pasadena Craftsman)
  insertClient.run('Dorothy Kim', 'dkim@sbcglobal.net', '(626) 555-1047', 'Seller', 1,
    null, null, null, null, null, 0, null,
    'Active', 'Downsizing. Lived in the Craftsman for 30 years. Emotional sale.', '2026-01-20');

  // 11: Seller — listing #3 (stale Eagle Rock)
  insertClient.run('Frank Palazzo', 'fpalazzo@earthlink.net', '(323) 555-1152', 'Seller', 2,
    null, null, null, null, null, 0, null,
    'Active', 'Getting frustrated with lack of offers. Already did one price reduction. May need another conversation about pricing.', '2025-11-01');

  // 12: Seller — listing #16 (Pasadena estate)
  insertClient.run('Robert & Ellen Wu', 'wufamily@gmail.com', '(626) 555-1268', 'Seller', 2,
    null, null, null, null, null, 0, null,
    'Active', 'Relocating to Austin. Want to close before summer.', '2026-01-25');

  // Both (buying and selling)
  // 13
  insertClient.run('Carlos & Maria Santos', 'santos.cm@gmail.com', '(323) 555-1377', 'Both', 1,
    800000, 1100000, '["Culver City","Mar Vista"]', '["Townhouse","Single Family"]', 3, 1, 1000000,
    'Active', 'Selling their Highland Park home, buying in Culver City. Need timing to align.', '2025-12-20');

  // Closed buyers
  // 14: Closed — bought listing #29
  insertClient.run('Kenji & Lisa Tanaka', 'tanaka.kl@gmail.com', '(310) 555-1483', 'Buyer', 1,
    900000, 1100000, '["Culver City"]', '["Single Family"]', 3, 1, 1050000,
    'Closed', 'Closed on Duquesne Ave in December. Very happy.', '2025-09-01');

  // 15: Closed — bought listing #30
  insertClient.run('Aiden McCarthy', 'aiden.mc@gmail.com', '(213) 555-1594', 'Buyer', 2,
    650000, 850000, '["Silver Lake"]', '["Condo"]', 2, 1, 800000,
    'Closed', 'First-time buyer. Closed on Bancroft Ave condo.', '2025-09-15');

  // 16: Closed — bought listing #34
  insertClient.run('Nina Okafor', 'nina.okafor@gmail.com', '(323) 555-1608', 'Buyer', 2,
    700000, 900000, '["Highland Park"]', '["Single Family"]', 2, 1, 850000,
    'Closed', 'Bought York Blvd property. Plans to renovate kitchen.', '2025-10-15');

  // Inactive
  // 17
  insertClient.run('Brad & Courtney Wells', 'wellsfam@icloud.com', '(818) 555-1715', 'Buyer', 1,
    600000, 900000, '["Pasadena","Eagle Rock"]', '["Single Family"]', 3, 0, null,
    'Inactive', 'Decided to wait until next year. Market too competitive.', '2025-10-01');

  // 18
  insertClient.run('Amanda Liu', 'aliu88@gmail.com', '(626) 555-1829', 'Buyer', 2,
    400000, 600000, '["Downtown","Silver Lake"]', '["Condo"]', 1, 1, 550000,
    'Active', 'Just got pre-approved. Ready to start looking seriously.', '2026-02-15');

  // 19: Seller — listing #9 (Mar Vista pool house)
  insertClient.run('Jim & Patty O\'Brien', 'obrien.jp@gmail.com', '(310) 555-1936', 'Seller', 1,
    null, null, null, null, null, 0, null,
    'Active', 'Selling the Grandview Blvd property. Moving closer to family in San Diego.', '2026-01-10');

  // 20: Active buyer — recent intake
  insertClient.run('Derek Washington', 'dwashington@protonmail.com', '(323) 555-2041', 'Buyer', 2,
    750000, 1000000, '["Eagle Rock","Highland Park","Pasadena"]', '["Single Family"]', 3, 1, 950000,
    'Active', 'Moving from Chicago. Wants neighborhood with character. Flexible on timeline.', '2026-02-18');


  // ── Showings (65+) ──
  const insertShowing = db.prepare(`
    INSERT INTO showings (listing_id, client_id, showing_date, showing_time, agent_id, feedback, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // ─── Hot listing #1 (Silver Lake condo) — 6 showings in a week ───
  insertShowing.run(1, 3, '2026-02-15', '10:00', 1, 'Loved the rooftop deck. Perfect size for a starter.', 'Completed');
  insertShowing.run(1, 2, '2026-02-15', '14:00', 2, 'Nice but wishes it had a second bathroom. Still interested.', 'Completed');
  insertShowing.run(1, 7, '2026-02-16', '11:00', 2, 'Great location but slightly over budget.', 'Completed');
  insertShowing.run(1, 18, '2026-02-17', '10:00', 2, 'Really liked it. Wants to come back for a second look.', 'Completed');
  insertShowing.run(1, 5, '2026-02-18', '15:00', 1, 'Considering as rental investment. Running numbers.', 'Completed');
  insertShowing.run(1, 13, '2026-02-19', '11:00', 1, 'Loved it but too small for the family long-term.', 'Completed');

  // ─── Stale listing #3 (Eagle Rock overpriced) — only 2 showings in 95 days ───
  insertShowing.run(3, 1, '2025-12-10', '14:00', 2, 'Nice lot but needs too much work for the price.', 'Completed');
  insertShowing.run(3, 20, '2026-01-25', '10:00', 2, 'Liked the neighborhood but the house felt dated. Price is too high.', 'Completed');

  // ─── Jason Whitfield (#2) — serial browser, 12 showings ───
  insertShowing.run(4, 2, '2025-12-05', '11:00', 2, 'Too small. Wants more natural light.', 'Completed');
  insertShowing.run(8, 2, '2025-12-12', '14:00', 2, 'Nice views but kitchen is too small.', 'Completed');
  insertShowing.run(10, 2, '2025-12-20', '10:00', 2, 'Impressive building but unit felt sterile.', 'Completed');
  insertShowing.run(14, 2, '2026-01-08', '13:00', 2, 'Good price point but too far from work.', 'Completed');
  insertShowing.run(6, 2, '2026-01-15', '11:00', 2, 'Charming but worried about street noise.', 'Completed');
  insertShowing.run(11, 2, '2026-01-22', '10:00', 2, 'Great backyard but the interior needs too much.', 'Completed');
  insertShowing.run(12, 2, '2026-01-29', '14:00', 2, 'Nice complex. Balcony too small.', 'Completed');
  insertShowing.run(15, 2, '2026-02-05', '11:00', 2, 'Beautiful bones but worried about renovation costs.', 'Completed');
  insertShowing.run(13, 2, '2026-02-08', '10:00', 2, 'Interesting as investment but not for living in.', 'Completed');
  // listing 1 showing already inserted in hot listing section above
  insertShowing.run(17, 2, '2026-02-22', '11:00', 2, 'Closest yet to what he wants. Thinking about it.', 'Completed');
  insertShowing.run(7, 2, '2026-02-25', '15:00', 2, null, 'Scheduled');  // Today

  // ─── Nguyen family — looking actively ───
  // listing 3 showing already inserted in stale listing section above
  insertShowing.run(6, 1, '2026-01-18', '10:00', 1, 'Loved the cottage feel. Wish it had one more bedroom.', 'Completed');
  insertShowing.run(11, 1, '2026-01-30', '14:00', 1, 'Sweet house. Good starter but might outgrow it.', 'Completed');
  insertShowing.run(18, 1, '2026-02-22', '10:00', 1, 'Really liked this one! Mountain views are amazing. Want to come back.', 'Completed');
  insertShowing.run(18, 1, '2026-02-28', '10:00', 1, null, 'Scheduled'); // Second showing

  // ─── Priya Desai — first-time buyer ───
  insertShowing.run(4, 3, '2026-01-25', '11:00', 1, 'Perfect size. Worried about HOA fees.', 'Completed');
  insertShowing.run(14, 3, '2026-02-05', '14:00', 1, 'Loved the pool and amenities. Wants to research the building.', 'Completed');
  insertShowing.run(12, 3, '2026-02-18', '10:00', 1, 'Really nice. Close to her office. Top contender.', 'Completed');
  // listing 1 showing already inserted in hot listing section above

  // ─── Johnson family — move-up buyers ───
  insertShowing.run(9, 4, '2026-01-25', '10:00', 2, 'Pool is great. ADU a huge plus. Want to bring parents to see it.', 'Completed');
  insertShowing.run(5, 4, '2026-02-08', '14:00', 2, 'Stunning Craftsman. Loved the built-ins. A bit over budget.', 'Completed');
  insertShowing.run(16, 4, '2026-02-15', '10:00', 2, 'Dream house but the price is a stretch. Guest house is incredible.', 'Completed');
  insertShowing.run(2, 4, '2026-02-22', '14:00', 2, 'Really nice but not as much space as the Pasadena houses.', 'Completed');

  // ─── Raymond Chen — investor ───
  insertShowing.run(13, 5, '2025-12-15', '10:00', 1, 'Good cap rate potential. Need to verify rental income.', 'Completed');
  insertShowing.run(19, 5, '2026-01-10', '14:00', 1, 'Huge lot. ADU potential makes this interesting.', 'Completed');
  insertShowing.run(3, 5, '2026-01-20', '10:00', 1, 'Too expensive for the work needed. Would consider at $950K.', 'Completed');

  // ─── Sophie Bergmann — under contract ───
  insertShowing.run(21, 6, '2025-12-20', '11:00', 1, 'Love it. Want to make an offer.', 'Completed');
  insertShowing.run(7, 6, '2025-12-18', '14:00', 1, 'Nice but prefers single family.', 'Completed');
  insertShowing.run(2, 6, '2025-12-22', '10:00', 1, 'Beautiful but out of budget range.', 'Completed');

  // ─── Victoria Ashworth — luxury buyer ───
  insertShowing.run(5, 8, '2026-02-10', '10:00', 1, 'Absolutely gorgeous. The porch alone is worth it. Top of the list.', 'Completed');
  insertShowing.run(16, 8, '2026-02-12', '14:00', 1, 'Grand property. Guest house perfect for office. Seriously considering.', 'Completed');
  insertShowing.run(15, 8, '2026-02-20', '10:00', 1, 'Beautiful bones but too much renovation for her timeline.', 'Completed');
  insertShowing.run(9, 8, '2026-02-24', '10:00', 1, 'Loved the pool and solar. ADU is a bonus. Wants to revisit.', 'Completed');

  // ─── Derek Washington — new buyer ───
  insertShowing.run(18, 20, '2026-02-24', '14:00', 2, 'First showing in LA. Really liked Eagle Rock vibe.', 'Completed');
  insertShowing.run(6, 20, '2026-02-25', '10:00', 2, null, 'Scheduled'); // Today
  insertShowing.run(11, 20, '2026-02-26', '14:00', 2, null, 'Scheduled'); // Tomorrow
  insertShowing.run(3, 20, '2026-02-27', '10:00', 2, null, 'Scheduled'); // Later this week

  // ─── Carlos & Maria Santos ───
  insertShowing.run(7, 13, '2026-01-05', '11:00', 1, 'Great space. Love the rooftop. Top choice.', 'Completed');
  insertShowing.run(21, 13, '2026-01-08', '14:00', 1, 'Nice but Sophie already snagged it.', 'Completed');
  insertShowing.run(2, 13, '2026-01-15', '10:00', 1, 'Slightly above budget but the studio is great.', 'Completed');

  // ─── Amanda Liu — just starting ───
  insertShowing.run(4, 18, '2026-02-20', '14:00', 2, 'Good first showing. Building felt modern. Wants to see more options.', 'Completed');
  // listing 1 showing already inserted in hot listing section above

  // ─── No-shows and cancellations ───
  insertShowing.run(9, 7, '2026-02-10', '14:00', 2, null, 'No-Show');
  insertShowing.run(16, 7, '2026-02-17', '10:00', 2, null, 'Cancelled');

  // ─── Completed buyer showings (sold listings) ───
  insertShowing.run(29, 14, '2025-10-15', '10:00', 1, 'Love it. Making an offer.', 'Completed');
  insertShowing.run(30, 15, '2025-10-20', '14:00', 2, 'Perfect for me. Want to move fast.', 'Completed');
  insertShowing.run(34, 16, '2025-12-01', '11:00', 2, 'Great neighborhood. Ready to offer.', 'Completed');

  // ─── Upcoming scheduled showings ───
  insertShowing.run(5, 8, '2026-02-28', '10:00', 1, null, 'Scheduled'); // Victoria second look at Pasadena Craftsman
  insertShowing.run(9, 4, '2026-02-28', '14:00', 2, null, 'Scheduled'); // Johnsons second look at Mar Vista pool house
  insertShowing.run(20, 8, '2026-03-01', '11:00', 1, null, 'Scheduled'); // Victoria looking at DTLA luxury
  insertShowing.run(2, 1, '2026-03-01', '14:00', 1, null, 'Scheduled'); // Nguyens at Mar Vista open house


  // ── Offers (15) ──
  const insertOffer = db.prepare(`
    INSERT INTO offers (listing_id, client_id, offer_amount, offer_date, status, contingencies, closing_date, agent_id, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 3 competing offers on hot listing #1
  insertOffer.run(1, 3, 765000, '2026-02-20', 'Submitted',
    '["inspection","appraisal","financing"]', null, 1, 'Priya offering 2% over asking. Strong pre-approval.');
  insertOffer.run(1, 18, 755000, '2026-02-21', 'Submitted',
    '["inspection","financing"]', null, 2, 'Amanda waiving appraisal contingency.');
  insertOffer.run(1, 5, 780000, '2026-02-21', 'Submitted',
    '[]', null, 1, 'Raymond cash offer, no contingencies. 14-day close.');

  // Accepted offer on listing #21 (Culver City pending)
  insertOffer.run(21, 6, 1030000, '2026-01-02', 'Accepted',
    '["inspection","appraisal","financing"]', '2026-03-05', 1, 'Sophie — inspection passed. Appraisal came in at value. On track to close March 5.');

  // Accepted offer on listing #22 (Silver Lake pending)
  insertOffer.run(22, 15, 815000, '2026-01-15', 'Accepted',
    '["inspection","financing"]', '2026-03-10', 2, 'Smooth transaction. All contingencies cleared.');

  // Accepted offer on listing #25 (Mar Vista townhouse pending)
  insertOffer.run(25, 13, 1100000, '2026-01-20', 'Accepted',
    '["inspection","appraisal","financing"]', '2026-03-15', 1, 'Carlos & Maria — contingent on selling their Highland Park home.');

  // Rejected offer on listing #5 (Pasadena Craftsman)
  insertOffer.run(5, 4, 1150000, '2026-02-12', 'Rejected',
    '["inspection","appraisal","financing"]', null, 2, 'Seller Dorothy felt it was too far below asking. Wants at least $1.25M.');

  // Countered offer on listing #16 (Pasadena estate)
  insertOffer.run(16, 8, 1300000, '2026-02-18', 'Countered',
    '["inspection","appraisal"]', null, 2, 'Seller countered at $1,365,000. Victoria reviewing.');

  // Accepted offers on sold listings
  insertOffer.run(29, 14, 1065000, '2025-11-01', 'Accepted',
    '["inspection","appraisal","financing"]', '2025-12-10', 1, 'Tanaka family — closed successfully.');
  insertOffer.run(30, 15, 810000, '2025-11-05', 'Accepted',
    '["inspection","financing"]', '2025-12-20', 2, 'Bidding war — Aiden won with escalation clause.');
  insertOffer.run(34, 16, 815000, '2025-12-10', 'Accepted',
    '["inspection","financing"]', '2026-02-01', 2, 'Nina — smooth closing.');

  // Expired offer
  insertOffer.run(3, 1, 980000, '2026-01-15', 'Expired',
    '["inspection","appraisal","financing"]', null, 1, 'Nguyens offered 15% below asking. Seller didn\'t respond in time. Offer expired.');

  // Withdrawn offer
  insertOffer.run(15, 5, 950000, '2026-01-28', 'Withdrawn',
    '["inspection"]', null, 1, 'Raymond pulled offer after inspection revealed foundation issues.');

  // Rejected lowball on stale Eagle Rock
  insertOffer.run(3, 5, 900000, '2026-02-10', 'Rejected',
    '[]', null, 1, 'Cash offer but seller Frank insists on at least $1.1M.');

  // Recently submitted
  insertOffer.run(18, 1, 935000, '2026-02-24', 'Submitted',
    '["inspection","appraisal","financing"]', null, 1, 'Nguyens loved the Eagle Rock home after second showing. Full price offer.');


  // ── Tasks (30) ──
  const insertTask = db.prepare(`
    INSERT INTO tasks (listing_id, client_id, description, due_date, assigned_to_id, status, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Tasks for listing #21 closing (4 open tasks — edge case)
  insertTask.run(21, 6, 'Confirm final walkthrough date with Sophie', '2026-03-03', 1, 'Pending', 'High');
  insertTask.run(21, 6, 'Submit repair request from inspection to seller', '2026-02-20', 1, 'Complete', 'High');
  insertTask.run(21, 6, 'Coordinate with title company for closing docs', '2026-03-01', 3, 'In Progress', 'High');
  insertTask.run(21, 6, 'Schedule final walkthrough', '2026-03-03', 1, 'Pending', 'High');
  insertTask.run(21, 6, 'Confirm wire transfer details with escrow', '2026-03-04', 3, 'Pending', 'High');

  // Overdue tasks
  insertTask.run(3, 11, 'Call Frank to discuss second price reduction', '2026-02-18', 2, 'Pending', 'High'); // OVERDUE
  insertTask.run(null, 2, 'Follow up with Jason — discuss what\'s holding him back', '2026-02-20', 2, 'Pending', 'Medium'); // OVERDUE
  insertTask.run(15, null, 'Get updated comps for Lucile Ave price strategy', '2026-02-15', 1, 'Pending', 'High'); // OVERDUE
  insertTask.run(null, 7, 'Check in with Tomás about pre-approval status', '2026-02-22', 2, 'Pending', 'Medium'); // OVERDUE
  insertTask.run(null, 1, 'Send Nguyens comp report for Eagle Rock', '2026-02-23', 1, 'Pending', 'Medium'); // OVERDUE

  // Active tasks
  insertTask.run(1, null, 'Review competing offers on Hyperion Ave with seller', '2026-02-26', 1, 'In Progress', 'High');
  insertTask.run(16, 8, 'Present counter offer to Victoria', '2026-02-26', 2, 'In Progress', 'High');
  insertTask.run(2, null, 'Prepare open house materials for Beethoven St', '2026-02-28', 1, 'Pending', 'Medium');
  insertTask.run(9, null, 'Prepare open house materials for Grandview Blvd', '2026-02-28', 1, 'Pending', 'Medium');
  insertTask.run(18, null, 'Prepare open house materials for Toland Way', '2026-02-28', 2, 'Pending', 'Medium');
  insertTask.run(5, null, 'Prepare open house materials for Mar Vista Ave', '2026-02-28', 1, 'Pending', 'Medium');
  insertTask.run(null, 20, 'Set up additional showings for Derek in Eagle Rock area', '2026-02-27', 2, 'Pending', 'Medium');
  insertTask.run(null, 4, 'Schedule Johnsons second look at Grandview Blvd', '2026-02-27', 2, 'In Progress', 'Medium');
  insertTask.run(null, 8, 'Send Victoria detailed packet on Pasadena Craftsman', '2026-02-27', 1, 'Pending', 'High');

  // Completed tasks
  insertTask.run(29, 14, 'File closing documents for Duquesne Ave', '2025-12-12', 3, 'Complete', 'High');
  insertTask.run(30, 15, 'File closing documents for Bancroft Ave', '2025-12-22', 3, 'Complete', 'High');
  insertTask.run(34, 16, 'File closing documents for York Blvd', '2026-02-03', 3, 'Complete', 'High');
  insertTask.run(22, null, 'Order pest inspection for Silver Lake Dr condo', '2026-02-10', 3, 'Complete', 'Medium');
  insertTask.run(23, null, 'Schedule home inspection for Manzanita St', '2026-01-15', 3, 'Complete', 'High');
  insertTask.run(null, 3, 'Send Priya list of first-time buyer resources', '2026-02-01', 1, 'Complete', 'Low');
  insertTask.run(null, 5, 'Run rental income analysis for Highland Park duplex', '2026-01-05', 1, 'Complete', 'Medium');

  // Low priority / future
  insertTask.run(null, null, 'Update office CRM with Q1 pipeline numbers', '2026-03-15', 3, 'Pending', 'Low');
  insertTask.run(null, null, 'Plan team meeting to review February closings', '2026-03-05', 3, 'Pending', 'Low');
  insertTask.run(null, 13, 'Follow up with Santos family about Highland Park listing timeline', '2026-03-01', 1, 'Pending', 'Medium');

  console.log('✅ Seed complete: 3 agents, 40 listings, 20 clients, 65+ showings, 15 offers, 30 tasks');
}

seed();
