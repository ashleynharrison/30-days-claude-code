import { getTableStatus } from '../database.js';

export function tableStatus(): string {
  const tables = getTableStatus() as any[];

  // Group by section
  const sections = new Map<string, any[]>();
  tables.forEach(t => {
    const arr = sections.get(t.section) || [];
    arr.push(t);
    sections.set(t.section, arr);
  });

  const sectionOrder = ['main', 'patio', 'bar', 'private'];
  const sectionNames: Record<string, string> = {
    main: 'Main Dining',
    patio: 'Patio',
    bar: 'Bar',
    private: 'Private Dining',
  };

  const output: string[] = ['═══ FLOOR STATUS ═══', ''];

  let totalSeats = 0;
  let occupiedSeats = 0;

  sectionOrder.forEach(section => {
    const sectionTables = sections.get(section);
    if (!sectionTables) return;

    const lines = sectionTables.map(t => {
      totalSeats += t.capacity;
      const statusEmoji = t.status === 'available' ? '🟢' : t.status === 'occupied' ? '🔴' : t.status === 'reserved' ? '🟡' : '🔵';

      if (t.status === 'occupied' && t.order_id) {
        occupiedSeats += t.guest_count || t.capacity;
        const guestInfo = t.guest_name ? `${t.guest_name} (${t.party_size})` : `Walk-in (${t.guest_count})`;
        const pending = t.items_pending > 0 ? ` | ${t.items_pending} items pending` : '';
        return `  ${statusEmoji} Table ${t.table_number} (${t.capacity}-top) — ${guestInfo}\n     ${t.minutes_seated} min seated${pending}`;
      } else if (t.status === 'reserved') {
        return `  ${statusEmoji} Table ${t.table_number} (${t.capacity}-top) — Reserved`;
      } else if (t.status === 'cleaning') {
        return `  ${statusEmoji} Table ${t.table_number} (${t.capacity}-top) — Cleaning`;
      } else {
        return `  ${statusEmoji} Table ${t.table_number} (${t.capacity}-top) — Available`;
      }
    });

    const available = sectionTables.filter(t => t.status === 'available').length;
    output.push(`${sectionNames[section]} (${available}/${sectionTables.length} available):`);
    output.push(lines.join('\n'));
    output.push('');
  });

  const occupancyPct = Math.round((occupiedSeats / totalSeats) * 100);
  output.push(`Summary: ${occupancyPct}% seat occupancy | ${tables.filter(t => t.status === 'available').length} tables open`);

  return output.join('\n');
}
