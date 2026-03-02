import { getInspections } from '../database.js';

export function inspectionTracker(args: {
  project_id?: number;
  status?: string;
  result?: string;
  date_from?: string;
  date_to?: string;
}): string {
  const inspections = getInspections(args);

  if (inspections.length === 0) {
    return 'No inspections found matching those criteria.';
  }

  const output: string[] = [`═══ INSPECTIONS (${inspections.length}) ═══`, ''];

  // Group by project
  const byProject = new Map<string, any[]>();
  inspections.forEach((i: any) => {
    const arr = byProject.get(i.project_name) || [];
    arr.push(i);
    byProject.set(i.project_name, arr);
  });

  byProject.forEach((list, projectName) => {
    output.push(`── ${projectName} ──`);

    list.forEach((i: any) => {
      let icon = '📋';
      if (i.result === 'passed') icon = '✅';
      else if (i.result === 'failed') icon = '❌';
      else if (i.result === 'conditional') icon = '⚠️';
      else if (i.status === 'scheduled') icon = '📅';
      else if (i.status === 'cancelled') icon = '🚫';

      output.push(`  ${icon} ${i.inspection_type} (${i.trade || 'general'})`);
      output.push(`     ${i.status === 'scheduled' ? 'Scheduled' : 'Completed'}: ${i.scheduled_date}${i.completed_date && i.completed_date !== i.scheduled_date ? ` (completed ${i.completed_date})` : ''}`);

      if (i.inspector_name) {
        output.push(`     Inspector: ${i.inspector_name}`);
      }

      if (i.result && i.result !== 'pending') {
        output.push(`     Result: ${i.result.toUpperCase()}`);
      }

      if (i.correction_deadline) {
        const today = new Date();
        const deadline = new Date(i.correction_deadline);
        const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const urgency = daysLeft <= 0 ? '🔴 OVERDUE' : daysLeft <= 3 ? '🟡' : '🟢';
        output.push(`     Correction deadline: ${i.correction_deadline} (${urgency} ${daysLeft} days ${daysLeft <= 0 ? 'past' : 'remaining'})`);
      }

      if (i.notes) {
        output.push(`     Notes: ${i.notes}`);
      }

      output.push('');
    });
  });

  // Summary
  const passed = inspections.filter((i: any) => i.result === 'passed').length;
  const failed = inspections.filter((i: any) => i.result === 'failed').length;
  const conditional = inspections.filter((i: any) => i.result === 'conditional').length;
  const scheduled = inspections.filter((i: any) => i.status === 'scheduled').length;

  output.push('── Summary ──');
  output.push(`  Passed: ${passed} | Failed: ${failed} | Conditional: ${conditional} | Scheduled: ${scheduled}`);

  return output.join('\n');
}
