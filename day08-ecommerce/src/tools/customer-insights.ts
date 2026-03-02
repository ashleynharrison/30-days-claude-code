import { searchCustomers } from '../database.js';

export function customerInsights(args: {
  name?: string;
  tier?: string;
  has_recent_order?: boolean;
}): string {
  const customers = searchCustomers(args);

  if (customers.length === 0) {
    return 'No customers found matching those criteria.';
  }

  const output: string[] = [`═══ CUSTOMERS (${customers.length}) ═══`, ''];

  customers.forEach((c: any) => {
    const tierMap: Record<string, string> = { vip: '👑', gold: '🥇', silver: '🥈', standard: '⚪' };
    const tierIcon = tierMap[c.tier] || '⚪';

    output.push(`${tierIcon} ${c.name} (${c.tier})`);
    output.push(`   Email: ${c.email} | Phone: ${c.phone || 'N/A'}`);
    output.push(`   Location: ${c.address_city || 'N/A'}, ${c.address_state || 'N/A'} ${c.address_zip || ''}`);
    output.push(`   Joined: ${c.joined_date}`);
    output.push(`   Orders: ${c.order_count} | Lifetime value: $${c.lifetime_value.toFixed(2)}`);
    output.push(`   Last order: ${c.last_order_date || 'Never'}${c.days_since_last_order ? ` (${c.days_since_last_order} days ago)` : ''}`);

    if (c.notes) {
      output.push(`   Notes: ${c.notes}`);
    }

    output.push('');
  });

  return output.join('\n');
}
