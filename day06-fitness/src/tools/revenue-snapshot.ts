import { getRevenueSnapshot } from '../database.js';

export function revenueSnapshot(): string {
  const data = getRevenueSnapshot();

  const output: string[] = ['═══ REVENUE SNAPSHOT ═══', ''];

  // Membership revenue
  output.push('── Membership Revenue (Active Members) ──');
  if (data.membershipRevenue && data.membershipRevenue.length > 0) {
    data.membershipRevenue.forEach((r: any) => {
      const label = r.membership_type.replace(/_/g, ' ');
      output.push(`  ${label}: ${r.count} members → $${r.monthly_revenue}/mo`);
    });
    output.push(`  ─────────────────────────────`);
    output.push(`  Total active monthly revenue: $${data.totalMonthly}`);
  } else {
    output.push('  No active memberships.');
  }
  output.push('');

  // Expiring class packs
  output.push('── Expiring Class Packs (≤2 classes left) ──');
  if (data.expiringPacks && data.expiringPacks.length > 0) {
    data.expiringPacks.forEach((p: any) => {
      output.push(`  ⚠️ ${p.name} (${p.email}) — ${p.classes_remaining} class${p.classes_remaining !== 1 ? 'es' : ''} left on ${p.membership_type.replace(/_/g, ' ')}`);
    });
  } else {
    output.push('  None — all packs have 3+ classes remaining.');
  }
  output.push('');

  // Upcoming renewals
  output.push('── Upcoming Renewals (next 30 days) ──');
  if (data.upcomingRenewals && data.upcomingRenewals.length > 0) {
    data.upcomingRenewals.forEach((r: any) => {
      const urgency = r.days_until <= 7 ? '🔴' : r.days_until <= 14 ? '🟡' : '🟢';
      output.push(`  ${urgency} ${r.name} — ${r.membership_type.replace(/_/g, ' ')} ($${r.membership_price}) renews ${r.renewal_date} (${r.days_until} days)`);
    });
  } else {
    output.push('  No renewals in the next 30 days.');
  }
  output.push('');

  // Frozen members (lost revenue)
  output.push('── Frozen Memberships ──');
  if (data.frozenMembers && data.frozenMembers.length > 0) {
    const frozenRevenue = data.frozenMembers.reduce((sum: number, m: any) => sum + m.membership_price, 0);
    data.frozenMembers.forEach((m: any) => {
      output.push(`  ❄️ ${m.name} (${m.email}) — ${m.membership_type.replace(/_/g, ' ')} ($${m.membership_price}/mo)`);
    });
    output.push(`  Frozen revenue: $${frozenRevenue}/mo`);
  } else {
    output.push('  No frozen memberships.');
  }

  return output.join('\n');
}
