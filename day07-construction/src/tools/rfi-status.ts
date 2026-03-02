import { getRFIs } from '../database.js';

export function rfiStatus(args: {
  project_id?: number;
  status?: string;
  priority?: string;
}): string {
  const rfis = getRFIs(args);

  if (rfis.length === 0) {
    return 'No RFIs found matching those criteria.';
  }

  const output: string[] = [`═══ RFIs (${rfis.length}) ═══`, ''];

  // Group by project
  const byProject = new Map<string, any[]>();
  rfis.forEach((r: any) => {
    const arr = byProject.get(r.project_name) || [];
    arr.push(r);
    byProject.set(r.project_name, arr);
  });

  byProject.forEach((list, projectName) => {
    output.push(`── ${projectName} ──`);

    list.forEach((r: any) => {
      const statusIcon = r.status === 'open' ? '🔴' : r.status === 'answered' ? '🟢' : r.status === 'closed' ? '✅' : '⚪';
      const priorityIcon = r.priority === 'critical' ? '🚨' : r.priority === 'high' ? '🔶' : r.priority === 'medium' ? '🔵' : '⚪';

      output.push(`  ${statusIcon} ${r.rfi_number}: ${r.subject}`);
      output.push(`     Priority: ${priorityIcon} ${r.priority.toUpperCase()} | Status: ${r.status}`);
      output.push(`     Submitted: ${r.submitted_date} by ${r.submitted_by}`);
      output.push(`     Assigned to: ${r.assigned_to || 'Unassigned'}`);

      if (r.status === 'open') {
        output.push(`     ⏱️ Open for ${r.days_open} day${r.days_open !== 1 ? 's' : ''}`);
      }

      if (r.impact_area) {
        output.push(`     Impact area: ${r.impact_area}`);
      }

      output.push(`     ${r.description}`);

      if (r.response) {
        output.push(`     ─── Response (${r.response_date}) ───`);
        output.push(`     ${r.response}`);
      }

      output.push('');
    });
  });

  // Summary
  const open = rfis.filter((r: any) => r.status === 'open').length;
  const critical = rfis.filter((r: any) => r.priority === 'critical' && r.status === 'open').length;
  const avgDaysOpen = rfis.filter((r: any) => r.status === 'open').reduce((sum: number, r: any) => sum + r.days_open, 0) / (open || 1);

  output.push('── Summary ──');
  output.push(`  Open: ${open} (${critical} critical) | Avg days open: ${Math.round(avgDaysOpen)}`);

  return output.join('\n');
}
