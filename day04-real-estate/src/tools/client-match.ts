import { searchClients, getClientById, clientMatchListings, type ListingRow } from '../database.js';

export function handleClientMatch(args: Record<string, unknown>): string {
  let clientId: number | undefined;

  if (args.client_id) {
    clientId = Number(args.client_id);
  } else if (args.client_name) {
    const clients = searchClients(String(args.client_name));
    if (clients.length === 0) return `No client found matching "${args.client_name}".`;
    if (clients.length > 1) {
      const names = clients.map(c => `  • ${c.name} (ID: ${c.id}, ${c.type})`).join('\n');
      return `Multiple clients found. Please specify:\n${names}`;
    }
    clientId = clients[0].id as number;
  } else {
    return 'Please provide a client_id or client_name.';
  }

  const client = getClientById(clientId);
  if (!client) return 'Client not found.';

  if (client.type === 'Seller') {
    return `${client.name} is a seller, not a buyer. Client match works for buyers only.`;
  }

  const neighborhoods = client.preferred_neighborhoods
    ? JSON.parse(client.preferred_neighborhoods as string)
    : [];
  const propertyTypes = client.preferred_property_types
    ? JSON.parse(client.preferred_property_types as string)
    : [];

  const header = [
    `═══ Client Match: ${client.name} ═══`,
    `Type: ${client.type} | Status: ${client.status}`,
    client.budget_min || client.budget_max
      ? `Budget: $${((client.budget_min as number) || 0).toLocaleString()} – $${((client.budget_max as number) || 0).toLocaleString()}`
      : '',
    client.bedrooms_min ? `Min Bedrooms: ${client.bedrooms_min}` : '',
    neighborhoods.length > 0 ? `Preferred Neighborhoods: ${neighborhoods.join(', ')}` : '',
    propertyTypes.length > 0 ? `Preferred Property Types: ${propertyTypes.join(', ')}` : '',
    client.preapproved ? `✅ Pre-approved: $${((client.preapproval_amount as number) || 0).toLocaleString()}` : '⚠️ Not pre-approved',
    client.notes ? `Notes: ${client.notes}` : '',
  ].filter(Boolean).join('\n');

  const matches = clientMatchListings(clientId);

  if (matches.length === 0) {
    return `${header}\n\nNo active listings match this client's criteria.`;
  }

  const listings = matches.map((l: ListingRow & { neighborhood_match?: number }, i: number) => {
    const matchBadge = l.neighborhood_match ? '⭐ Preferred neighborhood' : '';
    const features = JSON.parse(l.features).slice(0, 3).join(', ');
    return [
      `${i + 1}. ${l.mls_number} — ${l.address}, ${l.neighborhood} ${matchBadge}`,
      `   $${l.listing_price.toLocaleString()} | ${l.bedrooms}bd/${l.bathrooms}ba | ${l.sqft.toLocaleString()} sqft | $${l.price_per_sqft}/sqft`,
      `   ${l.property_type} | ${l.days_on_market} DOM`,
      `   ${l.description}`,
      features ? `   Features: ${features}` : '',
    ].filter(Boolean).join('\n');
  });

  return `${header}\n\n─── ${matches.length} Matching Listings ───\n\n${listings.join('\n\n')}`;
}
