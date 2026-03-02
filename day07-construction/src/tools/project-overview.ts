import { searchProjects } from '../database.js';

export function projectOverview(args: {
  name?: string;
  status?: string;
  project_type?: string;
}): string {
  const projects = searchProjects(args);

  if (projects.length === 0) {
    return 'No projects found matching those criteria.';
  }

  const output: string[] = [`═══ PROJECT OVERVIEW (${projects.length} project${projects.length !== 1 ? 's' : ''}) ═══`, ''];

  projects.forEach((p: any) => {
    const statusIcon = p.status === 'active' ? '🟢' : p.status === 'on_hold' ? '🟡' : p.status === 'completed' ? '✅' : '⚪';
    const budgetPct = Math.round((p.spent_to_date / p.contract_value) * 100);
    const budgetBar = '█'.repeat(Math.round(budgetPct / 10)) + '░'.repeat(10 - Math.round(budgetPct / 10));
    const progressBar = '█'.repeat(Math.round(p.completion_pct / 10)) + '░'.repeat(10 - Math.round(p.completion_pct / 10));
    const changeOrderTotal = p.approved_change_total || 0;
    const adjustedContract = p.contract_value + changeOrderTotal;

    output.push(`${statusIcon} ${p.name}`);
    output.push(`   Type: ${p.project_type} | Client: ${p.client_name}`);
    output.push(`   Address: ${p.address}`);
    output.push(`   Superintendent: ${p.superintendent}`);
    output.push(`   Schedule: ${p.start_date} → ${p.estimated_end_date}${p.actual_end_date ? ` (completed ${p.actual_end_date})` : ''}`);
    output.push(`   Progress:  ${progressBar} ${p.completion_pct}%`);
    output.push(`   Budget:    ${budgetBar} ${budgetPct}% ($${(p.spent_to_date / 1000).toFixed(0)}k / $${(p.contract_value / 1000).toFixed(0)}k)`);

    if (changeOrderTotal > 0) {
      output.push(`   Change Orders: +$${(changeOrderTotal / 1000).toFixed(1)}k approved (${p.change_order_count} total) → adjusted contract: $${(adjustedContract / 1000).toFixed(0)}k`);
    }

    output.push(`   Open RFIs: ${p.open_rfis} | Upcoming Inspections: ${p.upcoming_inspections} | Daily Logs: ${p.log_count}`);

    if (p.notes) {
      output.push(`   Notes: ${p.notes}`);
    }

    output.push('');
  });

  return output.join('\n');
}
