import { getPipelineSummary, getAgentByName } from '../database.js';

export function handlePipelineSummary(args: Record<string, unknown>): string {
  let agentId: number | undefined;
  let agentName = 'All Agents';

  if (args.agent) {
    const agent = getAgentByName(String(args.agent));
    if (!agent) return `No agent found matching "${args.agent}".`;
    agentId = agent.id as number;
    agentName = agent.name as string;
  }

  const pipeline = getPipelineSummary(agentId);

  const header = [
    `═══ Pipeline Summary: ${agentName} ═══`,
    '',
    `Active Listings:     ${pipeline.active_listings}`,
    `Pending Deals:       ${pipeline.pending_deals}`,
    `Submitted Offers:    ${pipeline.submitted_offers}`,
    `Avg Days on Market:  ${pipeline.avg_days_on_market ?? 'N/A'}`,
    `Sold (count):        ${pipeline.sold_count}`,
    `Sold Volume:         $${(pipeline.sold_volume as number).toLocaleString()}`,
  ].join('\n');

  // Upcoming closings
  const closings = pipeline.upcoming_closings as Array<Record<string, unknown>>;
  let closingSection = '\n\n─── Upcoming Closings ───\n';
  if (closings.length === 0) {
    closingSection += 'No upcoming closings.';
  } else {
    closingSection += closings.map(c =>
      `  ${c.closing_date} — ${c.address} (${c.neighborhood})\n     $${(c.offer_amount as number).toLocaleString()} | Buyer: ${c.client_name}`
    ).join('\n');
  }

  // Overdue tasks
  const overdue = pipeline.overdue_tasks as Array<Record<string, unknown>>;
  let taskSection = '\n\n─── ⚠️ Overdue Tasks ───\n';
  if (overdue.length === 0) {
    taskSection += 'No overdue tasks. 🎉';
  } else {
    taskSection += overdue.map(t => {
      const context = t.listing_address
        ? `(${t.listing_address})`
        : t.client_name
          ? `(${t.client_name})`
          : '';
      return `  [${t.priority}] ${t.description} ${context}\n     Due: ${t.due_date} | Assigned: ${t.assigned_to}`;
    }).join('\n');
  }

  return header + closingSection + taskSection;
}
