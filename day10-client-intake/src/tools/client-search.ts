import db from '../database.js';

interface ClientSearchParams {
  query?: string;
  status?: string;
  practice_area?: string;
  assigned_attorney?: string;
}

export function clientSearch(params: ClientSearchParams): string {
  let sql = 'SELECT * FROM clients WHERE 1=1';
  const bindings: unknown[] = [];

  if (params.query) {
    sql += ' AND (name LIKE ? OR company LIKE ? OR email LIKE ?)';
    const q = `%${params.query}%`;
    bindings.push(q, q, q);
  }

  if (params.status) {
    sql += ' AND status = ?';
    bindings.push(params.status);
  }

  if (params.practice_area) {
    sql += ' AND practice_area LIKE ?';
    bindings.push(`%${params.practice_area}%`);
  }

  if (params.assigned_attorney) {
    sql += ' AND assigned_attorney LIKE ?';
    bindings.push(`%${params.assigned_attorney}%`);
  }

  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...bindings) as Record<string, unknown>[];

  if (rows.length === 0) return 'No clients found matching your criteria.';

  let output = `=== Client Search (${rows.length} found) ===\n`;
  for (const r of rows) {
    output += `\n--- ${r.name} ---\n`;
    output += `Company: ${r.company || 'Individual'}\n`;
    output += `Email: ${r.email}\n`;
    output += `Phone: ${r.phone || 'N/A'}\n`;
    output += `Status: ${(r.status as string).toUpperCase()}\n`;
    output += `Practice Area: ${r.practice_area}\n`;
    output += `Assigned Attorney: ${r.assigned_attorney || 'Unassigned'}\n`;
    output += `Referral Source: ${r.referral_source || 'N/A'}\n`;
    output += `Created: ${r.created_at}\n`;
    if (r.onboarded_at) output += `Onboarded: ${r.onboarded_at}\n`;
    if (r.notes) output += `Notes: ${r.notes}\n`;
  }

  return output;
}
