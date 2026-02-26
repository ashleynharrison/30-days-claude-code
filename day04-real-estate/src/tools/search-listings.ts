import { searchListings, type ListingRow } from '../database.js';

export function handleSearchListings(args: Record<string, unknown>): string {
  const filters: Parameters<typeof searchListings>[0] = {};

  if (args.query) filters.query = String(args.query);
  if (args.min_price != null) filters.min_price = Number(args.min_price);
  if (args.max_price != null) filters.max_price = Number(args.max_price);
  if (args.bedrooms != null) filters.bedrooms = Number(args.bedrooms);
  if (args.bathrooms != null) filters.bathrooms = Number(args.bathrooms);
  if (args.status) filters.status = String(args.status);
  if (args.neighborhood) filters.neighborhood = String(args.neighborhood);
  if (args.property_type) filters.property_type = String(args.property_type);
  if (args.features) filters.features = String(args.features);

  const results = searchListings(filters);

  if (results.length === 0) {
    return 'No listings found matching those criteria.';
  }

  const lines = results.map((l: ListingRow) => {
    const price = `$${l.listing_price.toLocaleString()}`;
    const priceReduced = l.original_price ? ` (reduced from $${l.original_price.toLocaleString()})` : '';
    const features = JSON.parse(l.features).slice(0, 3).join(', ');
    const openHouse = l.open_house_date ? `\n   🏠 Open house: ${l.open_house_date}` : '';

    return [
      `${l.mls_number} — ${l.address}, ${l.neighborhood}`,
      `   ${price}${priceReduced} | ${l.bedrooms}bd/${l.bathrooms}ba | ${l.sqft.toLocaleString()} sqft | $${l.price_per_sqft}/sqft`,
      `   ${l.property_type} | ${l.status} | ${l.days_on_market} DOM | Agent: ${l.listing_agent}`,
      `   ${l.description}`,
      features ? `   Features: ${features}` : '',
      openHouse,
    ].filter(Boolean).join('\n');
  });

  return `Found ${results.length} listing(s):\n\n${lines.join('\n\n')}`;
}
