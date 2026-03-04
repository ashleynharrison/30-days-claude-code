import db from '../database.js';

interface WorkflowStatusParams {
  client_id?: number;
  assigned_to?: string;
  show_blocked?: boolean;
  show_overdue?: boolean;
}

export function workflowStatus(params: WorkflowStatusParams): string {
  let sql = `
    SELECT ws.*, c.name as client_name, c.company, c.status as client_status
    FROM workflow_steps ws
    JOIN clients c ON ws.client_id = c.id
    WHERE 1=1
  `;
  const bindings: unknown[] = [];

  if (params.client_id) {
    sql += ' AND ws.client_id = ?';
    bindings.push(params.client_id);
  }

  if (params.assigned_to) {
    sql += ' AND ws.assigned_to LIKE ?';
    bindings.push(`%${params.assigned_to}%`);
  }

  if (params.show_blocked) {
    sql += " AND ws.status = 'blocked'";
  }

  if (params.show_overdue) {
    sql += " AND ws.status IN ('pending', 'in_progress') AND ws.due_date < date('now')";
  }

  sql += ' ORDER BY ws.client_id, ws.step_order';

  const rows = db.prepare(sql).all(...bindings) as Record<string, unknown>[];

  if (rows.length === 0) return 'No workflow steps found matching your criteria.';

  // Group by client
  const grouped: Record<number, { name: string; company: string; clientStatus: string; steps: Record<string, unknown>[] }> = {};
  for (const r of rows) {
    const clientId = r.client_id as number;
    if (!grouped[clientId]) {
      grouped[clientId] = { name: r.client_name as string, company: r.company as string, clientStatus: r.client_status as string, steps: [] };
    }
    grouped[clientId].steps.push(r);
  }

  let output = `=== Intake Workflows ===\n`;

  for (const [clientId, group] of Object.entries(grouped)) {
    const completed = group.steps.filter(s => s.status === 'completed').length;
    const total = group.steps.length;
    const pct = Math.round((completed / total) * 100);

    output += `\n>> ${group.name} (${group.company}) — ${pct}% complete (${completed}/${total}) <<\n`;
    output += `Client Status: ${group.clientStatus.toUpperCase()}\n`;

    // Progress bar
    const filled = Math.round(pct / 10);
    output += `[${'█'.repeat(filled)}${'░'.repeat(10 - filled)}] ${pct}%\n\n`;

    for (const s of group.steps) {
      const icon = s.status === 'completed' ? '✅' :
                   s.status === 'in_progress' ? '🔄' :
                   s.status === 'blocked' ? '🚫' :
                   '⬜';

      let line = `  ${icon} ${s.step_order}. ${s.step_name}`;
      line += ` — ${s.assigned_to}`;

      if (s.status === 'completed' && s.completed_at) {
        line += ` (done ${(s.completed_at as string).split(' ')[0]})`;
      } else if (s.due_date) {
        const now = new Date();
        const due = new Date(s.due_date as string);
        const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (s.status !== 'completed') {
          if (daysUntil < 0) line += ` ⚠️ OVERDUE by ${Math.abs(daysUntil)} days`;
          else if (daysUntil <= 2) line += ` (due ${s.due_date} — ${daysUntil} days left)`;
          else line += ` (due ${s.due_date})`;
        }
      }

      output += line + '\n';
      if (s.notes && s.status !== 'completed') output += `     📝 ${s.notes}\n`;
    }
  }

  return output;
}
