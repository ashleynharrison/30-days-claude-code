import {
  getListingById,
  getListingByMls,
  getListingByAddress,
  getShowingsForListing,
  getOffersForListing,
  getTasksForListing,
  type ListingRow,
} from '../database.js';

export function handleGetListingDetails(args: Record<string, unknown>): string {
  let listing: ListingRow | undefined;

  if (args.listing_id) {
    listing = getListingById(Number(args.listing_id));
  } else if (args.mls_number) {
    listing = getListingByMls(String(args.mls_number));
  } else if (args.address) {
    listing = getListingByAddress(String(args.address));
  } else {
    return 'Please provide a listing_id, mls_number, or address.';
  }

  if (!listing) return 'Listing not found.';

  const features = JSON.parse(listing.features);
  const priceReduced = listing.original_price
    ? `\nOriginal Price: $${listing.original_price.toLocaleString()} (reduced ${listing.price_reduced_date})`
    : '';
  const soldInfo = listing.sold_price
    ? `\nSold Price: $${listing.sold_price.toLocaleString()} (${listing.sold_date})`
    : '';
  const openHouse = listing.open_house_date
    ? `\n🏠 Open House: ${listing.open_house_date}`
    : '';

  const header = [
    `═══ ${listing.mls_number} ═══`,
    `${listing.address}, ${listing.city} ${listing.zip}`,
    `Neighborhood: ${listing.neighborhood}`,
    ``,
    `Listing Price: $${listing.listing_price.toLocaleString()} | $${listing.price_per_sqft}/sqft`,
    priceReduced,
    soldInfo,
    `${listing.bedrooms}bd / ${listing.bathrooms}ba | ${listing.sqft.toLocaleString()} sqft${listing.lot_sqft ? ` | Lot: ${listing.lot_sqft.toLocaleString()} sqft` : ''}`,
    `Year Built: ${listing.year_built} | ${listing.property_type}`,
    `Status: ${listing.status} | ${listing.days_on_market} days on market`,
    `Listed: ${listing.listing_date} | Agent: ${listing.listing_agent}`,
    openHouse,
    ``,
    `"${listing.description}"`,
    features.length > 0 ? `Features: ${features.join(', ')}` : '',
  ].filter(s => s !== undefined).join('\n');

  // Showings
  const showings = getShowingsForListing(listing.id);
  let showingSection = '\n\n─── Showings ───\n';
  if (showings.length === 0) {
    showingSection += 'No showings recorded.';
  } else {
    showingSection += `${showings.length} total showing(s):\n`;
    showingSection += showings.map(s => {
      const feedback = s.feedback ? `\n   Feedback: "${s.feedback}"` : '';
      return `  ${s.showing_date} ${s.showing_time} — ${s.client_name} (Agent: ${s.agent_name}) [${s.status}]${feedback}`;
    }).join('\n');
  }

  // Offers
  const offers = getOffersForListing(listing.id);
  let offerSection = '\n\n─── Offers ───\n';
  if (offers.length === 0) {
    offerSection += 'No offers received.';
  } else {
    offerSection += `${offers.length} offer(s):\n`;
    offerSection += offers.map(o => {
      const contingencies = o.contingencies ? JSON.parse(o.contingencies as string) : [];
      const contText = contingencies.length > 0 ? `\n   Contingencies: ${contingencies.join(', ')}` : '';
      const closing = o.closing_date ? `\n   Closing: ${o.closing_date}` : '';
      const notes = o.notes ? `\n   Notes: ${o.notes}` : '';
      return `  $${(o.offer_amount as number).toLocaleString()} — ${o.client_name} (${o.offer_date}) [${o.status}]${contText}${closing}${notes}`;
    }).join('\n');
  }

  // Tasks
  const tasks = getTasksForListing(listing.id);
  const openTasks = tasks.filter(t => t.status !== 'Complete');
  let taskSection = '\n\n─── Open Tasks ───\n';
  if (openTasks.length === 0) {
    taskSection += 'No open tasks.';
  } else {
    taskSection += openTasks.map(t => {
      const overdue = t.is_overdue ? ' ⚠️ OVERDUE' : '';
      return `  [${t.priority}] ${t.description} — Due: ${t.due_date} (${t.assigned_to}) [${t.status}]${overdue}`;
    }).join('\n');
  }

  return header + showingSection + offerSection + taskSection;
}
