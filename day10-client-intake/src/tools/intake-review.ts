import db from '../database.js';

interface IntakeReviewParams {
  client_id?: number;
  status?: string;
  flagged_only?: boolean;
}

export function intakeReview(params: IntakeReviewParams): string {
  let sql = `
    SELECT f.*, c.name as client_name, c.company
    FROM intake_forms f
    JOIN clients c ON f.client_id = c.id
    WHERE 1=1
  `;
  const bindings: unknown[] = [];

  if (params.client_id) {
    sql += ' AND f.client_id = ?';
    bindings.push(params.client_id);
  }

  if (params.status) {
    sql += ' AND f.status = ?';
    bindings.push(params.status);
  }

  if (params.flagged_only) {
    sql += ' AND f.flags IS NOT NULL';
  }

  sql += ' ORDER BY f.submitted_at DESC';

  const rows = db.prepare(sql).all(...bindings) as Record<string, unknown>[];

  if (rows.length === 0) return 'No intake forms found matching your criteria.';

  let output = `=== Intake Forms (${rows.length} found) ===\n`;
  for (const r of rows) {
    const statusLabel = r.status === 'submitted' ? '📋 NEEDS REVIEW' :
                       r.status === 'under_review' ? '🔍 UNDER REVIEW' :
                       r.status === 'approved' ? '✅ APPROVED' :
                       r.status === 'pending' ? '⏳ PENDING SUBMISSION' :
                       (r.status as string).toUpperCase();

    output += `\n--- Form #${r.id}: ${r.client_name} (${r.company}) ---\n`;
    output += `Type: ${r.form_type}\n`;
    output += `Status: ${statusLabel}\n`;
    output += `Submitted: ${r.submitted_at}\n`;
    if (r.reviewed_at) output += `Reviewed: ${r.reviewed_at} by ${r.reviewed_by}\n`;

    // Parse and display form data
    try {
      const data = JSON.parse(r.data as string);
      output += `Form Data:\n`;
      for (const [key, value] of Object.entries(data)) {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        output += `  ${label}: ${Array.isArray(value) ? (value as string[]).join(', ') : value}\n`;
      }
    } catch {
      output += `Form Data: ${r.data}\n`;
    }

    // Parse and display flags
    if (r.flags) {
      try {
        const flags = JSON.parse(r.flags as string);
        output += `⚠️ FLAGS:\n`;
        for (const flag of flags as string[]) {
          output += `  • ${flag}\n`;
        }
      } catch {
        output += `⚠️ Flags: ${r.flags}\n`;
      }
    }

    if (r.notes) output += `Notes: ${r.notes}\n`;
  }

  return output;
}
