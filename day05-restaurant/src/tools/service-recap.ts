import { getServiceRecap } from '../database.js';

export function serviceRecap(args: { date: string }): string {
  const data = getServiceRecap(args.date);
  const s = data.summary as any;
  const r = data.reservationStats as any;

  if (!s || !s.total_orders) {
    return `No service data found for ${args.date}. Either no orders were placed or the date is in the future.`;
  }

  const topSellers = (data.topSellers as any[]).map((item, i) =>
    `  ${i + 1}. ${item.name} (${item.category}) — ${item.qty} sold, $${item.revenue}`
  ).join('\n');

  const eightySixed = (data.eightySixed as any[]).length > 0
    ? (data.eightySixed as any[]).map((e: any) => `  • ${e.name} — ${e.reason} (${e.eighty_sixed_at})`).join('\n')
    : '  None';

  const servers = (data.serverPerformance as any[]).map((sv: any) =>
    `  ${sv.server_name}: ${sv.tables_served} tables, ${sv.covers} covers, $${sv.revenue} revenue, $${sv.tips} tips (${sv.avg_tip_pct}% avg)`
  ).join('\n');

  return [
    `═══ SERVICE RECAP: ${args.date} ═══`,
    '',
    '📊 Overview:',
    `  Orders: ${s.total_orders} | Covers: ${s.total_covers}`,
    `  Revenue: $${s.total_revenue} | Avg Check: $${s.avg_check}`,
    `  Avg Turn Time: ${s.avg_turn_time_min} min`,
    `  Total Tips: $${s.total_tips} | Avg Tip: $${s.avg_tip}`,
    '',
    '📋 Reservations:',
    `  Total: ${r.total_reservations} | Completed: ${r.completed} | No-Shows: ${r.no_shows} | Cancelled: ${r.cancelled}`,
    '',
    '🏆 Top Sellers:',
    topSellers,
    '',
    '🚫 86\'d Items:',
    eightySixed,
    '',
    '👤 Server Performance:',
    servers,
  ].join('\n');
}
