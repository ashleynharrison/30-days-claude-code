import { getShowingSchedule, getAgentByName } from '../database.js';

export function handleShowingSchedule(args: Record<string, unknown>): string {
  const filters: { date_range_days?: number; agent_id?: number; listing_id?: number } = {};

  if (args.date_range_days != null) filters.date_range_days = Number(args.date_range_days);
  if (args.listing_id != null) filters.listing_id = Number(args.listing_id);

  if (args.agent) {
    const agent = getAgentByName(String(args.agent));
    if (!agent) return `No agent found matching "${args.agent}".`;
    filters.agent_id = agent.id as number;
  }

  const showings = getShowingSchedule(filters);
  const days = filters.date_range_days ?? 7;

  if (showings.length === 0) {
    return `No showings found in the ${days}-day window.`;
  }

  // Group by date
  const byDate = new Map<string, Array<Record<string, unknown>>>();
  for (const s of showings) {
    const date = s.showing_date as string;
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(s);
  }

  const sections: string[] = [];
  for (const [date, dateShowings] of byDate) {
    const today = new Date().toISOString().split('T')[0];
    const label = date === today ? `${date} (TODAY)` : date;

    const items = dateShowings.map(s => {
      const feedback = s.feedback ? `\n     Feedback: "${s.feedback}"` : '';
      return `  ${s.showing_time} — ${s.client_name} viewing ${s.address} (${s.neighborhood})\n     $${(s.listing_price as number).toLocaleString()} | ${s.mls_number} | Agent: ${s.agent_name} | [${s.status}]${feedback}`;
    });

    sections.push(`── ${label} ──\n${items.join('\n\n')}`);
  }

  const upcoming = showings.filter(s => s.status === 'Scheduled').length;
  const completed = showings.filter(s => s.status === 'Completed').length;

  return `Showing Schedule (${days}-day window)\n${upcoming} upcoming | ${completed} completed | ${showings.length} total\n\n${sections.join('\n\n')}`;
}
