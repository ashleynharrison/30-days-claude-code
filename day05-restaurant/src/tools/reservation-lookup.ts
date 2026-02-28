import { searchReservations } from '../database.js';

export function reservationLookup(args: {
  date?: string;
  guest_name?: string;
  party_size_min?: number;
  status?: string;
  upcoming_only?: boolean;
}): string {
  const results = searchReservations(args);

  if (results.length === 0) {
    return 'No reservations found matching your criteria.';
  }

  const lines = results.map((r: any) => {
    const tableInfo = r.table_number ? `Table ${r.table_number} (${r.section}, seats ${r.capacity})` : 'Table TBD';
    const statusEmoji = r.status === 'completed' ? '✓' : r.status === 'seated' ? '🍽' : r.status === 'no_show' ? '✗' : r.status === 'cancelled' ? '—' : '◯';
    return [
      `${statusEmoji} ${r.guest_name} — Party of ${r.party_size}`,
      `  ${r.reservation_date} at ${r.reservation_time} | ${tableInfo}`,
      `  Status: ${r.status.replace('_', ' ')}${r.notes ? `\n  Notes: ${r.notes}` : ''}`,
    ].join('\n');
  });

  return `Found ${results.length} reservation(s):\n\n${lines.join('\n\n')}`;
}
