import { getChangeOrders } from '../database.js';

export function changeOrderLog(args: {
  project_id?: number;
  status?: string;
}): string {
  const orders = getChangeOrders(args);

  if (orders.length === 0) {
    return 'No change orders found matching those criteria.';
  }

  const output: string[] = [`═══ CHANGE ORDERS (${orders.length}) ═══`, ''];

  // Group by project
  const byProject = new Map<string, any[]>();
  orders.forEach((co: any) => {
    const arr = byProject.get(co.project_name) || [];
    arr.push(co);
    byProject.set(co.project_name, arr);
  });

  byProject.forEach((list, projectName) => {
    const projectTotal = list.reduce((sum: number, co: any) => sum + co.amount, 0);
    const approvedTotal = list.filter((co: any) => co.status === 'approved').reduce((sum: number, co: any) => sum + co.amount, 0);
    const pendingTotal = list.filter((co: any) => co.status !== 'approved' && co.status !== 'rejected').reduce((sum: number, co: any) => sum + co.amount, 0);

    output.push(`── ${projectName} ──`);
    output.push(`   Total: $${projectTotal.toLocaleString()} (approved: $${approvedTotal.toLocaleString()} | pending: $${pendingTotal.toLocaleString()})`);
    output.push('');

    list.forEach((co: any) => {
      const statusIcon = co.status === 'approved' ? '✅' : co.status === 'pending' ? '⏳' : co.status === 'negotiating' ? '🔄' : '❌';
      const amountStr = co.amount >= 0 ? `+$${co.amount.toLocaleString()}` : `-$${Math.abs(co.amount).toLocaleString()}`;
      const reasonLabel = co.reason.replace(/_/g, ' ');

      output.push(`  ${statusIcon} ${co.co_number}: ${co.title}`);
      output.push(`     Amount: ${amountStr} (${co.pct_of_contract}% of contract)`);
      output.push(`     Reason: ${reasonLabel}`);
      output.push(`     Submitted: ${co.submitted_date} by ${co.submitted_by}`);

      if (co.schedule_impact_days !== 0) {
        const impact = co.schedule_impact_days > 0 ? `+${co.schedule_impact_days} days` : `${co.schedule_impact_days} days (schedule savings)`;
        output.push(`     Schedule impact: ${impact}`);
      }

      if (co.approved_by) {
        output.push(`     Approved by: ${co.approved_by} on ${co.approved_date}`);
      }

      if (co.notes) {
        output.push(`     Notes: ${co.notes}`);
      }

      output.push('');
    });
  });

  return output.join('\n');
}
