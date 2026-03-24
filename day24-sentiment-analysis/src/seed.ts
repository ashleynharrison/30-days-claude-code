import db from './database.js';

// Clear existing data
db.exec('DELETE FROM review_themes');
db.exec('DELETE FROM sentiment_snapshots');
db.exec('DELETE FROM themes');
db.exec('DELETE FROM reviews');
db.exec('DELETE FROM businesses');
db.exec('DELETE FROM sources');

// Sources
const insertSource = db.prepare('INSERT INTO sources (name, type, url) VALUES (?, ?, ?)');
insertSource.run('Google Reviews', 'review_platform', 'https://google.com/maps');
insertSource.run('Yelp', 'review_platform', 'https://yelp.com');
insertSource.run('TripAdvisor', 'review_platform', 'https://tripadvisor.com');
insertSource.run('Internal Survey', 'survey', null);
insertSource.run('OpenTable', 'review_platform', 'https://opentable.com');

// Businesses
const insertBiz = db.prepare('INSERT INTO businesses (name, industry, location) VALUES (?, ?, ?)');
insertBiz.run('The Grand Oak Hotel', 'hospitality', 'Austin, TX');
insertBiz.run('Coastal Brew Coffee', 'food_beverage', 'San Diego, CA');
insertBiz.run('Saffron Kitchen', 'restaurant', 'Portland, OR');
insertBiz.run('Pulse Fitness Studio', 'wellness', 'Denver, CO');
insertBiz.run('Haven Boutique Resort', 'hospitality', 'Savannah, GA');

// Reviews — The Grand Oak Hotel (id: 1)
const insertReview = db.prepare(
  'INSERT INTO reviews (business_id, source_id, author, rating, text, date, sentiment_score, sentiment_label) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);

// Grand Oak Hotel — Mixed reviews, strong on service, weak on rooms
const grandOakReviews = [
  [1, 1, 'Sarah M.', 5, 'Absolutely stunning property. The staff went above and beyond — Maria at the front desk remembered our anniversary and surprised us with champagne. Will definitely be back.', '2026-02-01', 0.92, 'positive'],
  [1, 1, 'James T.', 4, 'Great location downtown. Rooms are a bit dated but the rooftop bar makes up for it. Service was excellent throughout our stay.', '2026-02-03', 0.55, 'positive'],
  [1, 2, 'ReviewerATX', 2, 'Checked in at 3pm and room wasn\'t ready. Waited 45 minutes. Room smelled like cleaning chemicals. Bathroom grout was dark. For $280/night I expected more.', '2026-02-05', -0.72, 'negative'],
  [1, 3, 'TravelCouple2026', 5, 'We\'ve stayed at dozens of boutique hotels and Grand Oak is in our top 3. The breakfast buffet is phenomenal — the brisket hash is a must. Pool area is gorgeous.', '2026-02-08', 0.88, 'positive'],
  [1, 1, 'Mike R.', 3, 'Decent enough. Nothing special. WiFi was spotty on the 4th floor. Bed was comfortable. Parking situation is a mess — valet took 25 minutes both times.', '2026-02-10', -0.15, 'neutral'],
  [1, 2, 'Jessica L.', 5, 'The concierge team here is next level. They booked us a private food tour and even called ahead to our dinner reservation to note our allergies. That\'s the kind of service that makes you a repeat customer.', '2026-02-12', 0.95, 'positive'],
  [1, 4, 'Survey Respondent', 4, 'Overall satisfied. Room cleanliness could improve. Loved the spa services. Would recommend to friends.', '2026-02-14', 0.45, 'positive'],
  [1, 1, 'David K.', 1, 'Worst experience ever. AC broke at 2am in August. Called front desk three times. Nobody came until morning. No apology, no comp. Never again.', '2026-02-16', -0.95, 'negative'],
  [1, 3, 'AustinFoodie', 4, 'Came for a work conference. Meeting rooms are well-equipped. The on-site restaurant punches above its weight — the wagyu burger at lunch was excellent.', '2026-02-18', 0.62, 'positive'],
  [1, 2, 'Karen W.', 3, 'Nice hotel but showing its age. Carpet in hallways is worn. Elevator is slow. But the staff is genuinely friendly and the location can\'t be beat.', '2026-02-20', 0.05, 'neutral'],
  [1, 1, 'Tom and Linda', 5, 'Our third stay here and it keeps getting better. The renovation on the 6th floor rooms is beautiful. New rain shower heads are a game changer.', '2026-02-22', 0.85, 'positive'],
  [1, 5, 'Chris P.', 2, 'Overpriced for what you get. The "luxury" label doesn\'t match the reality. Thin walls, noisy neighbors, minibar prices are criminal. Save your money.', '2026-02-24', -0.68, 'negative'],
  [1, 1, 'Elena R.', 4, 'Beautiful lobby, great first impression. Room was clean and spacious. Only knock is the breakfast line — waited 20 minutes on a Sunday.', '2026-02-26', 0.48, 'positive'],
  [1, 4, 'Survey Respondent', 5, 'Exceeded expectations. The attention to detail in the room (welcome note, local snack basket) made us feel special. Already booked our next visit.', '2026-02-28', 0.90, 'positive'],
  [1, 2, 'RoadWarrior99', 3, 'Fine for business travel. Reliable. Not exciting. Wish the gym had more free weights. The pool closes too early.', '2026-03-02', 0.0, 'neutral'],
  [1, 1, 'Amanda S.', 4, 'Hosted a baby shower in their event space. Team was incredibly helpful with setup. Food was great. A few hiccups with AV equipment but they sorted it out fast.', '2026-03-05', 0.58, 'positive'],
  [1, 3, 'NomadNick', 1, 'Found hair in the bathtub and a stain on the comforter. Housekeeping clearly cut corners. Manager offered 10% off next stay — insulting.', '2026-03-07', -0.88, 'negative'],
  [1, 1, 'Patricia D.', 5, 'I can\'t say enough about the spa. Best deep tissue massage I\'ve had in years. The relaxation lounge with the herbal tea service is so thoughtful.', '2026-03-09', 0.91, 'positive'],
];

// Coastal Brew Coffee (id: 2) — Mostly positive, consistency issue
const coastalBrewReviews = [
  [2, 1, 'CoffeeSnob619', 5, 'Best cortado in San Diego. Period. The single-origin Ethiopian is incredible. Cozy space, friendly baristas, and they actually know their beans.', '2026-02-02', 0.93, 'positive'],
  [2, 2, 'Morning Runner', 4, 'My go-to pre-run stop. Fast service, great cold brew. Wish they had more food options beyond pastries.', '2026-02-06', 0.55, 'positive'],
  [2, 1, 'WorkFromCafe', 5, 'Perfect remote work spot. Strong WiFi, good outlets, not too loud. The oat milk latte is my daily ritual. Staff doesn\'t rush you out.', '2026-02-09', 0.82, 'positive'],
  [2, 2, 'Disappointed Dan', 2, 'Used to be great but quality has dropped. Last three visits, espresso has been sour. Think they changed roasters or their machine needs calibration.', '2026-02-12', -0.55, 'negative'],
  [2, 1, 'Local Mom', 5, 'Love that they support local — pastries from the bakery down the street, milk from a farm in Escondido. The kids\' hot chocolate is a hit with my 6-year-old.', '2026-02-15', 0.78, 'positive'],
  [2, 3, 'Tourist_Review', 4, 'Stumbled in while exploring the Gaslamp Quarter. Charming spot. The pour-over was excellent. A bit pricey but worth it for the quality.', '2026-02-18', 0.60, 'positive'],
  [2, 1, 'BeanCounter', 3, 'Inconsistent. Some days the latte is perfect, other days it tastes burnt. When they\'re on, they\'re the best. When they\'re off, it\'s frustrating.', '2026-02-21', -0.10, 'neutral'],
  [2, 2, 'EarlyBirdSD', 5, 'They open at 6am and the morning crew is always smiling. That matters more than people think. Also, the breakfast burrito they just added is fire.', '2026-02-24', 0.85, 'positive'],
  [2, 1, 'Tea Person', 3, 'Nice cafe but the tea selection is an afterthought. Three generic bags in a box. If you\'re not a coffee person, look elsewhere.', '2026-02-27', -0.20, 'neutral'],
  [2, 4, 'Survey Respondent', 4, 'Great atmosphere and product. Parking is tough. Would love to see a loyalty program.', '2026-03-02', 0.50, 'positive'],
  [2, 1, 'Matcha Mel', 5, 'Their matcha latte is the real deal — ceremonial grade, not that powdered sugar stuff. Beautiful latte art too. This place gets it.', '2026-03-05', 0.88, 'positive'],
  [2, 2, 'Quick Stop', 4, 'Good drip coffee, fair price, in and out in 3 minutes. Exactly what I need on a workday morning.', '2026-03-08', 0.52, 'positive'],
];

// Saffron Kitchen (id: 3) — Strong food, service complaints
const saffronReviews = [
  [3, 1, 'PDXFoodie', 5, 'The lamb biryani is a religious experience. This is the most authentic Indian food in Portland. The naan comes out of the tandoor so fresh you can see the steam.', '2026-02-01', 0.95, 'positive'],
  [3, 2, 'DateNight_PDX', 4, 'Beautiful ambiance, incredible food. Service was a bit slow — waited 40 minutes for entrees on a Tuesday. But the butter chicken made us forget about it.', '2026-02-04', 0.40, 'positive'],
  [3, 5, 'OpenTableUser', 2, 'Made a reservation for 7pm, wasn\'t seated until 7:25. Waiter forgot our appetizer order. Food was good but the experience was frustrating. Not worth the hassle.', '2026-02-07', -0.55, 'negative'],
  [3, 1, 'Spice Lover', 5, 'Finally, a restaurant that doesn\'t dumb down the spice levels. When I say "Indian hot" they deliver. The vindaloo had me sweating and smiling. Respect.', '2026-02-10', 0.88, 'positive'],
  [3, 2, 'Family of Four', 3, 'Kids loved the tikka masala but portions are small for the price. $22 for an entree that wouldn\'t fill a teenager. Quality over quantity I guess.', '2026-02-13', -0.15, 'neutral'],
  [3, 1, 'Vegan Vikki', 5, 'One of the few Indian restaurants that takes vegan seriously. The chana masala and aloo gobi are outstanding. They even have vegan naan. I\'m emotional.', '2026-02-16', 0.90, 'positive'],
  [3, 3, 'Portland_Traveler', 4, 'Heard about this place from a local and wasn\'t disappointed. The mango lassi is thick and perfectly sweet. Chicken korma was creamy and fragrant. Will return.', '2026-02-19', 0.72, 'positive'],
  [3, 2, 'Impatient Ian', 1, 'Waited an hour for food. AN HOUR. On a weeknight. No apology. No explanation. The food was good but I don\'t care — an hour is unacceptable.', '2026-02-22', -0.82, 'negative'],
  [3, 1, 'Chef\'s Friend', 5, 'I\'m a professional chef and I bring my friends here to show them what real Indian cooking tastes like. The spice layering in the rogan josh is masterful.', '2026-02-25', 0.93, 'positive'],
  [3, 4, 'Survey Respondent', 3, 'Food: 10/10. Service: 4/10. Every time. They need to hire more staff or take fewer reservations. It\'s a solvable problem.', '2026-02-28', 0.05, 'neutral'],
  [3, 5, 'Weekend Diner', 4, 'Saturday dinner was buzzing. Great energy. Shared the mixed grill platter — every item was perfectly seasoned. Cocktail list is also surprisingly good.', '2026-03-03', 0.70, 'positive'],
  [3, 1, 'GlutenFreePDX', 4, 'Tons of naturally gluten-free options. Staff was knowledgeable about ingredients. A safe bet for people with dietary restrictions. Food is delicious too.', '2026-03-06', 0.65, 'positive'],
  [3, 2, 'Never Again', 1, 'Server was rude when we asked about allergens. Rolled his eyes. Manager didn\'t seem to care. Food doesn\'t matter if the people serving it are dismissive.', '2026-03-09', -0.90, 'negative'],
];

// Pulse Fitness Studio (id: 4) — Strong community, equipment issues
const pulseReviews = [
  [4, 1, 'FitMom303', 5, 'Best studio in Denver. The instructors actually care about your form. Community is incredible — everyone cheers each other on. This place changed my life.', '2026-02-02', 0.94, 'positive'],
  [4, 2, 'Gym Rat Review', 3, 'Good classes but the equipment is showing wear. Two spin bikes had broken resistance knobs last week. Free weight area needs more 25lb dumbbells.', '2026-02-05', -0.25, 'neutral'],
  [4, 1, 'NewToFitness', 5, 'I was terrified to try a group class. Coach Dani made me feel so welcome. Zero judgment. Modified every move for me. I\'m hooked now — going 4x/week.', '2026-02-08', 0.91, 'positive'],
  [4, 4, 'Survey Respondent', 4, 'Love the variety of classes. Wish there were more evening slots after 7pm. The 5:30am crowd is intense in the best way.', '2026-02-11', 0.50, 'positive'],
  [4, 1, 'CrossfitConvert', 5, 'Switched from a CrossFit box and never looked back. Better programming, better coaching, half the ego. Pulse gets the balance right.', '2026-02-14', 0.82, 'positive'],
  [4, 2, 'Frustrated Member', 2, 'App keeps crashing when I try to book classes. Missed my favorite HIIT class three weeks in a row because I couldn\'t reserve a spot. Fix the tech.', '2026-02-17', -0.65, 'negative'],
  [4, 1, 'YogaLover_CO', 5, 'The yoga program here is seriously underrated. Instructor Priya combines vinyasa with breathwork in a way that\'s both challenging and calming. Thursday 6pm is my therapy.', '2026-02-20', 0.87, 'positive'],
  [4, 2, 'Peak Performance', 4, 'Solid training facility. The strength classes are well-programmed. Only complaint: locker rooms could use an upgrade. Showers are lukewarm at best.', '2026-02-23', 0.35, 'positive'],
  [4, 1, 'Denver Dan', 3, 'Pricing went up $20/month with no added value. Still the same classes, same equipment. Hard to justify $180/month when other studios charge less.', '2026-02-26', -0.40, 'negative'],
  [4, 4, 'Survey Respondent', 5, 'The community events (hikes, social hours) set Pulse apart. It\'s not just a gym, it\'s where my friend group formed. Worth every penny.', '2026-03-01', 0.88, 'positive'],
  [4, 1, 'Morning Glory', 5, 'The 6am bootcamp with Coach Marcus is the best way to start the day. High energy, great music, effective workout. I\'m in the best shape of my life.', '2026-03-04', 0.90, 'positive'],
  [4, 2, 'Cancelation Pending', 2, 'Tried to cancel and was given the runaround. Had to email three times and call twice. Just let people leave gracefully. Bad look.', '2026-03-07', -0.75, 'negative'],
];

// Haven Boutique Resort (id: 5) — Premium property, high expectations
const havenReviews = [
  [5, 1, 'Southern Belle', 5, 'Haven is everything a Savannah getaway should be. The moss-draped courtyard, the sweet tea on arrival, the four-poster beds. Pure Southern charm elevated.', '2026-02-03', 0.94, 'positive'],
  [5, 3, 'Honeymoon Trip', 5, 'Spent our honeymoon here and it was perfect. The couples\' spa package was worth every penny. The private garden dinner under the string lights was magical.', '2026-02-06', 0.96, 'positive'],
  [5, 2, 'Business Traveler', 3, 'Charming but not practical for business. WiFi is unreliable, no business center, no real desk in the room. If you\'re here for work, look elsewhere.', '2026-02-09', -0.20, 'neutral'],
  [5, 1, 'History Buff', 5, 'The building itself is a work of art — 1840s architecture lovingly restored. The guided history walk they offer is a hidden gem. Felt like stepping back in time.', '2026-02-12', 0.85, 'positive'],
  [5, 5, 'Disappointed Diner', 2, 'The restaurant has gone downhill since the chef change. Overcooked fish, bland sides, and a $45 price tag. The old menu was a reason to visit. This isn\'t.', '2026-02-15', -0.70, 'negative'],
  [5, 1, 'Anniversary Trip', 5, 'Third year coming to Haven for our anniversary. They remembered us by name. Left a card and flowers in the room. These personal touches are why we keep coming back.', '2026-02-18', 0.93, 'positive'],
  [5, 4, 'Survey Respondent', 4, 'Beautiful property and exceptional staff. Room rates are high but you get what you pay for. The complimentary evening wine hour is a lovely touch.', '2026-02-21', 0.65, 'positive'],
  [5, 2, 'Pool Critic', 2, 'The pool is tiny. Like, fits-six-people tiny. For a resort charging $400/night, that\'s unacceptable. We ended up at the public pool instead. Embarrassing.', '2026-02-24', -0.60, 'negative'],
  [5, 3, 'Garden Party', 5, 'Hosted my mother\'s 70th birthday brunch in the garden. The event team was flawless. Every guest raved about the food and the setting. Unforgettable.', '2026-02-27', 0.92, 'positive'],
  [5, 1, 'Weekend Escape', 4, 'Lovely property, great location near River Street. Room was spotless. Only issue was noise from the bar downstairs on Saturday night. Ear plugs helped.', '2026-03-02', 0.42, 'positive'],
  [5, 2, 'Return Guest', 5, 'My favorite hotel in the Southeast. The afternoon cookie service, the rocking chairs on the porch, the genuine warmth of the staff. Haven is aptly named.', '2026-03-05', 0.91, 'positive'],
  [5, 4, 'Survey Respondent', 3, 'Love the property but accessibility needs work. No elevator to the third floor. Difficult for elderly guests. Please address this.', '2026-03-08', -0.15, 'neutral'],
];

// Insert all reviews
const allReviews = [
  ...grandOakReviews,
  ...coastalBrewReviews,
  ...saffronReviews,
  ...pulseReviews,
  ...havenReviews,
];

for (const r of allReviews) {
  insertReview.run(...r);
}

// Themes
const insertTheme = db.prepare(
  'INSERT INTO themes (business_id, name, category, mention_count, avg_sentiment, trend) VALUES (?, ?, ?, ?, ?, ?)'
);

// Grand Oak themes
insertTheme.run(1, 'Staff & Service', 'service', 12, 0.78, 'improving');
insertTheme.run(1, 'Room Condition', 'facility', 8, -0.25, 'declining');
insertTheme.run(1, 'Food & Dining', 'amenity', 7, 0.72, 'stable');
insertTheme.run(1, 'Cleanliness', 'facility', 5, -0.45, 'declining');
insertTheme.run(1, 'Location', 'location', 6, 0.80, 'stable');
insertTheme.run(1, 'Spa & Wellness', 'amenity', 4, 0.88, 'improving');
insertTheme.run(1, 'Parking & Access', 'logistics', 3, -0.50, 'stable');
insertTheme.run(1, 'Value for Money', 'pricing', 4, -0.35, 'declining');

// Coastal Brew themes
insertTheme.run(2, 'Coffee Quality', 'product', 10, 0.72, 'stable');
insertTheme.run(2, 'Atmosphere', 'ambiance', 6, 0.80, 'stable');
insertTheme.run(2, 'Barista Service', 'service', 5, 0.75, 'improving');
insertTheme.run(2, 'Consistency', 'quality', 3, -0.30, 'declining');
insertTheme.run(2, 'Food Options', 'product', 4, 0.25, 'improving');
insertTheme.run(2, 'Pricing', 'pricing', 3, -0.10, 'stable');

// Saffron Kitchen themes
insertTheme.run(3, 'Food Quality', 'product', 11, 0.88, 'stable');
insertTheme.run(3, 'Wait Times', 'service', 6, -0.65, 'declining');
insertTheme.run(3, 'Spice & Authenticity', 'product', 5, 0.90, 'stable');
insertTheme.run(3, 'Server Attitude', 'service', 4, -0.55, 'declining');
insertTheme.run(3, 'Dietary Accommodations', 'service', 4, 0.75, 'improving');
insertTheme.run(3, 'Portions & Pricing', 'pricing', 3, -0.20, 'stable');

// Pulse Fitness themes
insertTheme.run(4, 'Instructor Quality', 'service', 8, 0.88, 'stable');
insertTheme.run(4, 'Community & Culture', 'experience', 6, 0.90, 'improving');
insertTheme.run(4, 'Equipment Condition', 'facility', 4, -0.45, 'declining');
insertTheme.run(4, 'App & Booking', 'technology', 3, -0.60, 'declining');
insertTheme.run(4, 'Pricing', 'pricing', 3, -0.35, 'stable');
insertTheme.run(4, 'Facilities', 'facility', 3, -0.20, 'stable');

// Haven Resort themes
insertTheme.run(5, 'Ambiance & Charm', 'experience', 8, 0.90, 'stable');
insertTheme.run(5, 'Personal Touches', 'service', 6, 0.92, 'improving');
insertTheme.run(5, 'Restaurant Quality', 'amenity', 4, -0.15, 'declining');
insertTheme.run(5, 'Pool & Amenities', 'facility', 3, -0.45, 'stable');
insertTheme.run(5, 'Accessibility', 'facility', 2, -0.40, 'stable');
insertTheme.run(5, 'Events & Celebrations', 'service', 4, 0.88, 'improving');

// Map reviews to themes (simplified — connect reviews to relevant themes by keyword matching)
const reviewThemeMap = db.prepare('INSERT INTO review_themes (review_id, theme_id, relevance) VALUES (?, ?, ?)');

// We'll do a simplified mapping: link each review to 1-3 themes from its business
const allReviewRows = db.prepare('SELECT id, business_id, text FROM reviews').all() as Array<{ id: number; business_id: number; text: string }>;
const allThemes = db.prepare('SELECT id, business_id, name FROM themes').all() as Array<{ id: number; business_id: number; name: string }>;

const themeKeywords: Record<string, string[]> = {
  'Staff & Service': ['staff', 'service', 'front desk', 'concierge', 'friendly', 'helpful', 'team'],
  'Room Condition': ['room', 'bed', 'carpet', 'dated', 'renovation', 'shower'],
  'Food & Dining': ['food', 'breakfast', 'restaurant', 'buffet', 'burger', 'dining', 'lunch'],
  'Cleanliness': ['clean', 'hair', 'stain', 'housekeeping', 'grout', 'smell'],
  'Location': ['location', 'downtown', 'walk'],
  'Spa & Wellness': ['spa', 'massage', 'relaxation'],
  'Parking & Access': ['parking', 'valet'],
  'Value for Money': ['price', 'overpriced', 'worth', 'money', '$'],
  'Coffee Quality': ['coffee', 'espresso', 'cortado', 'latte', 'cold brew', 'pour-over', 'bean', 'matcha'],
  'Atmosphere': ['cozy', 'space', 'spot', 'atmosphere', 'ambiance', 'charming'],
  'Barista Service': ['barista', 'staff', 'crew', 'smiling', 'friendly'],
  'Consistency': ['inconsistent', 'consistency', 'some days', 'dropped', 'sour', 'burnt'],
  'Food Options': ['food', 'pastry', 'burrito', 'menu'],
  'Pricing': ['price', 'pricey', 'worth', 'money', '$', 'cost', 'charge'],
  'Food Quality': ['food', 'biryani', 'chicken', 'naan', 'masala', 'cooking', 'seasoned', 'delicious', 'korma'],
  'Wait Times': ['wait', 'waited', 'hour', 'slow', 'minutes'],
  'Spice & Authenticity': ['spice', 'authentic', 'hot', 'tandoor', 'vindaloo', 'rogan josh'],
  'Server Attitude': ['server', 'waiter', 'rude', 'dismissive', 'eye'],
  'Dietary Accommodations': ['vegan', 'gluten', 'allergy', 'dietary'],
  'Portions & Pricing': ['portion', 'small', 'price', '$'],
  'Instructor Quality': ['instructor', 'coach', 'form', 'modified', 'programming'],
  'Community & Culture': ['community', 'friend', 'cheer', 'social', 'hike', 'event'],
  'Equipment Condition': ['equipment', 'bike', 'broken', 'dumbbell', 'weight'],
  'App & Booking': ['app', 'book', 'reserve', 'crash', 'tech'],
  'Facilities': ['locker', 'shower', 'gym'],
  'Ambiance & Charm': ['charm', 'courtyard', 'moss', 'architecture', 'porch', 'garden', 'beautiful'],
  'Personal Touches': ['remember', 'name', 'card', 'flower', 'welcome', 'personal', 'touch'],
  'Restaurant Quality': ['restaurant', 'chef', 'fish', 'menu', 'overcooked', 'bland'],
  'Pool & Amenities': ['pool', 'tiny', 'amenity'],
  'Accessibility': ['accessibility', 'elevator', 'elderly'],
  'Events & Celebrations': ['event', 'birthday', 'brunch', 'party', 'wedding', 'anniversary'],
};

for (const review of allReviewRows) {
  const bizThemes = allThemes.filter(t => t.business_id === review.business_id);
  const textLower = review.text.toLowerCase();

  let matched = 0;
  for (const theme of bizThemes) {
    const keywords = themeKeywords[theme.name] || [];
    const hits = keywords.filter(kw => textLower.includes(kw)).length;
    if (hits > 0) {
      const relevance = Math.min(1.0, hits * 0.4);
      reviewThemeMap.run(review.id, theme.id, relevance);
      matched++;
    }
    if (matched >= 3) break;
  }
}

// Sentiment snapshots (weekly aggregates)
const insertSnapshot = db.prepare(
  'INSERT INTO sentiment_snapshots (business_id, week_start, avg_sentiment, review_count, positive_pct, neutral_pct, negative_pct, top_positive_theme, top_negative_theme) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

// Grand Oak Hotel snapshots
insertSnapshot.run(1, '2026-01-27', 0.45, 4, 50, 25, 25, 'Staff & Service', 'Room Condition');
insertSnapshot.run(1, '2026-02-03', 0.38, 5, 60, 20, 20, 'Food & Dining', 'Cleanliness');
insertSnapshot.run(1, '2026-02-10', 0.52, 4, 75, 0, 25, 'Staff & Service', 'Parking & Access');
insertSnapshot.run(1, '2026-02-17', 0.28, 4, 50, 25, 25, 'Spa & Wellness', 'Value for Money');
insertSnapshot.run(1, '2026-02-24', 0.35, 3, 33, 33, 33, 'Location', 'Cleanliness');
insertSnapshot.run(1, '2026-03-03', 0.42, 3, 66, 0, 33, 'Staff & Service', 'Room Condition');

// Coastal Brew snapshots
insertSnapshot.run(2, '2026-02-03', 0.65, 3, 66, 0, 33, 'Coffee Quality', 'Consistency');
insertSnapshot.run(2, '2026-02-10', 0.50, 2, 50, 50, 0, 'Atmosphere', null);
insertSnapshot.run(2, '2026-02-17', 0.58, 2, 50, 50, 0, 'Coffee Quality', 'Pricing');
insertSnapshot.run(2, '2026-02-24', 0.70, 3, 100, 0, 0, 'Barista Service', null);
insertSnapshot.run(2, '2026-03-03', 0.63, 2, 100, 0, 0, 'Coffee Quality', null);

// Saffron Kitchen snapshots
insertSnapshot.run(3, '2026-02-03', 0.42, 3, 66, 0, 33, 'Food Quality', 'Wait Times');
insertSnapshot.run(3, '2026-02-10', 0.55, 2, 50, 50, 0, 'Spice & Authenticity', 'Portions & Pricing');
insertSnapshot.run(3, '2026-02-17', 0.48, 2, 50, 0, 50, 'Dietary Accommodations', 'Wait Times');
insertSnapshot.run(3, '2026-02-24', 0.35, 2, 50, 50, 0, 'Food Quality', 'Server Attitude');
insertSnapshot.run(3, '2026-03-03', 0.15, 3, 33, 33, 33, 'Food Quality', 'Server Attitude');

// Pulse Fitness snapshots
insertSnapshot.run(4, '2026-02-03', 0.55, 3, 66, 33, 0, 'Community & Culture', 'Equipment Condition');
insertSnapshot.run(4, '2026-02-10', 0.60, 2, 50, 50, 0, 'Instructor Quality', null);
insertSnapshot.run(4, '2026-02-17', 0.30, 2, 50, 0, 50, 'Instructor Quality', 'App & Booking');
insertSnapshot.run(4, '2026-02-24', 0.22, 2, 50, 0, 50, 'Community & Culture', 'Pricing');
insertSnapshot.run(4, '2026-03-03', 0.34, 3, 66, 0, 33, 'Instructor Quality', 'App & Booking');

// Haven Resort snapshots
insertSnapshot.run(5, '2026-02-03', 0.78, 2, 100, 0, 0, 'Ambiance & Charm', null);
insertSnapshot.run(5, '2026-02-10', 0.40, 2, 50, 50, 0, 'Personal Touches', 'Restaurant Quality');
insertSnapshot.run(5, '2026-02-17', 0.55, 2, 50, 0, 50, 'Ambiance & Charm', 'Pool & Amenities');
insertSnapshot.run(5, '2026-02-24', 0.48, 2, 50, 50, 0, 'Events & Celebrations', null);
insertSnapshot.run(5, '2026-03-03', 0.55, 2, 50, 50, 0, 'Personal Touches', 'Accessibility');

console.log('Seeded sentiment analysis database:');
console.log(`  ${allReviews.length} reviews across 5 businesses`);
console.log('  36 themes');
console.log('  26 weekly sentiment snapshots');
console.log('Done.');
