import { getDb } from '../database.js';

export function keyDatesTracker(params: {
  document_id?: number;
  upcoming_days?: number;
  deadlines_only?: boolean;
}): string {
  const db = getDb();
  const conditions: string[] = [];
  const values: any[] = [];

  if (params.document_id) {
    conditions.push("kd.document_id = ?");
    values.push(params.document_id);
  }

  if (params.deadlines_only) {
    conditions.push("kd.is_deadline = 1");
  }

  const today = new Date().toISOString().split('T')[0];

  if (params.upcoming_days) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + params.upcoming_days);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    conditions.push("kd.date >= ? AND kd.date <= ?");
    values.push(today, futureDateStr);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT kd.*, d.title AS document_title
    FROM key_dates kd
    JOIN documents d ON kd.document_id = d.id
    ${where}
    ORDER BY kd.date ASC
  `).all(...values) as any[];

  if (rows.length === 0) {
    return 'No key dates found matching the specified criteria.';
  }

  const header = `=== Key Dates (${rows.length} found) ===\n`;

  const results = rows.map((kd: any, i: number) => {
    const dateObj = new Date(kd.date + 'T00:00:00');
    const todayObj = new Date(today + 'T00:00:00');
    const diffMs = dateObj.getTime() - todayObj.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    let timing: string;
    if (diffDays < 0) {
      timing = `${Math.abs(diffDays)} days ago`;
    } else if (diffDays === 0) {
      timing = 'TODAY';
    } else {
      timing = `in ${diffDays} days`;
    }

    const isOverdue = kd.is_deadline && diffDays < 0;
    const overdueFlag = isOverdue ? ' [OVERDUE]' : '';
    const deadlineTag = kd.is_deadline ? ' (Deadline)' : '';

    return [
      `--- Date ${i + 1}${overdueFlag} ---`,
      `Document: ${kd.document_title}`,
      `Label: ${kd.label}${deadlineTag}`,
      `Date: ${kd.date} (${timing})`,
      `Deadline: ${kd.is_deadline ? 'Yes' : 'No'}`,
      kd.notes ? `Notes: ${kd.notes}` : null,
    ].filter(Boolean).join('\n');
  });

  return header + results.join('\n\n');
}
