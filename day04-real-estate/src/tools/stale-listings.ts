import { getStaleListings } from '../database.js';

export function handleStaleListings(args: Record<string, unknown>): string {
  const threshold = args.days_threshold != null ? Number(args.days_threshold) : 30;
  const results = getStaleListings(threshold);

  if (results.length === 0) {
    return `No active listings have been on market for ${threshold}+ days.`;
  }

  const listings = results.map(l => {
    const pricePerSqft = l.price_per_sqft as number;
    const compPriceSqft = l.comp_price_per_sqft as number | null;
    const totalShowings = l.total_showings as number;
    const recentShowings = l.recent_showings as number;
    const totalOffers = l.total_offers as number;
    const dom = l.days_on_market as number;
    const features = JSON.parse(l.features as string).slice(0, 3).join(', ');

    // Price comparison
    let compAnalysis = '';
    if (compPriceSqft && pricePerSqft) {
      const diff = pricePerSqft - compPriceSqft;
      const pct = ((diff / compPriceSqft) * 100).toFixed(1);
      if (diff > 0) {
        compAnalysis = `\n   📊 Price/sqft is $${diff.toFixed(0)} ABOVE comparable solds in ${l.neighborhood} (+${pct}%)`;
      } else {
        compAnalysis = `\n   📊 Price/sqft is $${Math.abs(diff).toFixed(0)} below comparable solds in ${l.neighborhood} (${pct}%)`;
      }
    }

    // Activity assessment
    let activityFlag = '';
    if (totalShowings === 0) {
      activityFlag = '\n   🚨 ZERO showings — consider marketing push or significant price adjustment';
    } else if (recentShowings === 0) {
      activityFlag = `\n   ⚠️ No showings in last 30 days (${totalShowings} total) — listing may be going stale`;
    } else if (totalOffers === 0) {
      activityFlag = `\n   ⚠️ ${totalShowings} showings but ZERO offers — possible pricing issue`;
    }

    const priceReduced = l.original_price
      ? `\n   Previously reduced from $${(l.original_price as number).toLocaleString()} on ${l.price_reduced_date}`
      : '';

    return [
      `${l.mls_number} — ${l.address}, ${l.neighborhood}`,
      `   $${(l.listing_price as number).toLocaleString()} | ${l.bedrooms}bd/${l.bathrooms}ba | ${l.sqft} sqft | $${pricePerSqft}/sqft`,
      `   ${l.days_on_market} days on market | ${totalShowings} showings | ${totalOffers} offers`,
      `   Agent: ${l.listing_agent}`,
      `   ${l.description}`,
      features ? `   Features: ${features}` : '',
      priceReduced,
      compAnalysis,
      activityFlag,
    ].filter(Boolean).join('\n');
  });

  return `═══ Stale Listings (${threshold}+ days on market) ═══\n${results.length} listing(s) need attention:\n\n${listings.join('\n\n')}`;
}
