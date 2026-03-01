import { getAtRiskMembers } from '../database.js';

export function atRiskMembers(args: {
  days_inactive?: number;
}): string {
  const members = getAtRiskMembers(args.days_inactive || 21);

  if (members.length === 0) {
    return `No at-risk members found (no active members inactive for ${args.days_inactive || 21}+ days).`;
  }

  const output: string[] = [`═══ AT-RISK MEMBERS (${members.length} member${members.length !== 1 ? 's' : ''}) ═══`, ''];
  output.push(`Criteria: Active members with no visit in ${args.days_inactive || 21}+ days`, '');

  members.forEach((m: any) => {
    const urgency = m.days_since_visit >= 30 ? '🔴' : m.days_since_visit >= 21 ? '🟡' : '🟢';
    const renewalWarning = m.days_until_renewal !== null && m.days_until_renewal <= 14
      ? ` ⚠️ Renewal in ${m.days_until_renewal} days!`
      : '';

    output.push(`${urgency} ${m.name} — ${m.days_since_visit} days since last visit${renewalWarning}`);
    output.push(`   Email: ${m.email} | Phone: ${m.phone || 'N/A'}`);
    output.push(`   Membership: ${m.membership_type.replace(/_/g, ' ')} ($${m.membership_price})`);
    output.push(`   Last visit: ${m.last_visit || 'Never'}`);
    output.push(`   Activity: ${m.classes_last_30d} classes (30d) | ${m.classes_last_90d} classes (90d) | ${m.no_shows_last_30d} no-shows (30d)`);

    if (m.classes_remaining !== null) {
      output.push(`   Classes remaining: ${m.classes_remaining}`);
    }

    if (m.notes) {
      output.push(`   Notes: ${m.notes}`);
    }

    output.push('');
  });

  // Summary
  const highRisk = members.filter((m: any) => m.days_since_visit >= 30).length;
  const revenueAtRisk = members.reduce((sum: number, m: any) => {
    if (m.membership_type.includes('monthly')) return sum + m.membership_price;
    if (m.membership_type.includes('annual')) return sum + Math.round(m.membership_price / 12);
    return sum;
  }, 0);

  output.push('── Summary ──');
  output.push(`  High risk (30+ days): ${highRisk}`);
  output.push(`  Monthly revenue at risk: $${revenueAtRisk.toFixed(2)}`);

  return output.join('\n');
}
