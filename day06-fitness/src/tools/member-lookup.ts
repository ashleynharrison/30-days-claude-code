import { searchMembers } from '../database.js';

export function memberLookup(args: {
  name?: string;
  membership_type?: string;
  status?: string;
  joined_after?: string;
  joined_before?: string;
}): string {
  const members = searchMembers(args);

  if (members.length === 0) {
    return 'No members found matching those criteria.';
  }

  const output: string[] = [`═══ MEMBER SEARCH (${members.length} result${members.length !== 1 ? 's' : ''}) ═══`, ''];

  members.forEach((m: any) => {
    const statusIcon = m.status === 'active' ? '✅' : m.status === 'frozen' ? '❄️' : m.status === 'cancelled' ? '❌' : '⏳';
    const membershipLabel = m.membership_type.replace(/_/g, ' ');

    output.push(`${statusIcon} ${m.name}`);
    output.push(`   Email: ${m.email} | Phone: ${m.phone || 'N/A'}`);
    output.push(`   Membership: ${membershipLabel} ($${m.membership_price})`);

    if (m.classes_remaining !== null) {
      output.push(`   Classes remaining: ${m.classes_remaining}`);
    }

    output.push(`   Joined: ${m.join_date} | Last visit: ${m.last_visit || 'Never'}`);
    output.push(`   Activity (30d): ${m.classes_last_30d} classes, ${m.checkins_last_30d} check-ins`);

    if (m.renewal_date) {
      output.push(`   Renewal: ${m.renewal_date}`);
    }

    if (m.notes) {
      output.push(`   Notes: ${m.notes}`);
    }

    output.push('');
  });

  return output.join('\n');
}
