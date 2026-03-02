import { getSubcontractors } from '../database.js';

export function subcontractorStatus(args: {
  project_id?: number;
  trade?: string;
  status?: string;
}): string {
  const subs = getSubcontractors(args);

  if (subs.length === 0) {
    return 'No subcontractors found matching those criteria.';
  }

  const output: string[] = [`═══ SUBCONTRACTOR STATUS (${subs.length}) ═══`, ''];

  // Group by project
  const byProject = new Map<string, any[]>();
  subs.forEach((s: any) => {
    const arr = byProject.get(s.project_name) || [];
    arr.push(s);
    byProject.set(s.project_name, arr);
  });

  byProject.forEach((subList, projectName) => {
    output.push(`── ${projectName} ──`);

    subList.forEach((s: any) => {
      const statusIcon = s.status === 'active' ? '🟢' : s.status === 'completed' ? '✅' : s.status === 'pending' ? '⏳' : '❌';

      // Insurance warning
      const today = new Date();
      const insExpiry = s.insurance_expiry ? new Date(s.insurance_expiry) : null;
      const daysUntilExpiry = insExpiry ? Math.ceil((insExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
      const insWarning = daysUntilExpiry !== null && daysUntilExpiry <= 60 ? ` ⚠️ Insurance expires in ${daysUntilExpiry} days!` : '';

      output.push(`  ${statusIcon} ${s.company_name} — ${s.trade.replace(/_/g, ' ')}`);
      output.push(`     Contact: ${s.contact_name} | ${s.phone || 'N/A'} | ${s.email || 'N/A'}`);
      output.push(`     Contract: $${s.contract_amount.toLocaleString()} | License: ${s.license_number || 'N/A'}${insWarning}`);

      if (s.failed_inspections > 0) {
        output.push(`     ⚠️ ${s.failed_inspections} failed inspection${s.failed_inspections > 1 ? 's' : ''} (${s.inspection_count} total)`);
      }

      if (s.notes) {
        output.push(`     Notes: ${s.notes}`);
      }

      output.push('');
    });
  });

  return output.join('\n');
}
