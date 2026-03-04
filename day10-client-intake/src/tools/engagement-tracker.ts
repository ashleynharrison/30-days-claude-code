import db from '../database.js';

interface EngagementTrackerParams {
  client_id?: number;
  status?: string;
  fee_structure?: string;
}

export function engagementTracker(params: EngagementTrackerParams): string {
  let sql = `
    SELECT e.*, c.name as client_name, c.company
    FROM engagements e
    JOIN clients c ON e.client_id = c.id
    WHERE 1=1
  `;
  const bindings: unknown[] = [];

  if (params.client_id) {
    sql += ' AND e.client_id = ?';
    bindings.push(params.client_id);
  }

  if (params.status) {
    sql += ' AND e.status = ?';
    bindings.push(params.status);
  }

  if (params.fee_structure) {
    sql += ' AND e.fee_structure LIKE ?';
    bindings.push(`%${params.fee_structure}%`);
  }

  sql += ' ORDER BY e.id DESC';

  const rows = db.prepare(sql).all(...bindings) as Record<string, unknown>[];

  if (rows.length === 0) return 'No engagement letters found matching your criteria.';

  let output = `=== Engagement Letters (${rows.length} found) ===\n`;

  // Summary stats
  const signed = rows.filter(r => r.status === 'signed');
  const totalRetainer = signed.reduce((sum, r) => sum + ((r.retainer_amount as number) || 0), 0);
  const totalFlat = signed.reduce((sum, r) => sum + ((r.flat_fee as number) || 0), 0);
  output += `\nSummary: ${signed.length} signed | $${totalRetainer.toLocaleString()} in retainers | $${totalFlat.toLocaleString()} in flat fees\n`;

  for (const r of rows) {
    const statusLabel = r.status === 'draft' ? '📝 DRAFT' :
                       r.status === 'sent' ? '📤 SENT — AWAITING SIGNATURE' :
                       r.status === 'signed' ? '✅ SIGNED' :
                       r.status === 'expired' ? '⏰ EXPIRED' :
                       (r.status as string).toUpperCase();

    output += `\n--- ${r.client_name} (${r.company}) ---\n`;
    output += `Type: ${r.engagement_type}\n`;
    output += `Status: ${statusLabel}\n`;
    output += `Scope: ${r.scope}\n`;
    output += `Fee Structure: ${(r.fee_structure as string).replace(/_/g, ' ')}\n`;

    if (r.retainer_amount) output += `Retainer: $${(r.retainer_amount as number).toLocaleString()}\n`;
    if (r.hourly_rate) output += `Hourly Rate: $${r.hourly_rate}/hr\n`;
    if (r.flat_fee) output += `Flat Fee: $${(r.flat_fee as number).toLocaleString()}\n`;

    if (r.sent_at) output += `Sent: ${r.sent_at}\n`;
    if (r.signed_at) output += `Signed: ${r.signed_at}\n`;
    if (r.expires_at) {
      const now = new Date();
      const exp = new Date(r.expires_at as string);
      const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      output += `Expires: ${r.expires_at}`;
      if (r.status === 'sent' && daysLeft > 0) output += ` (${daysLeft} days left)`;
      else if (r.status === 'sent' && daysLeft <= 0) output += ` ⚠️ EXPIRED`;
      output += '\n';
    }
    if (r.notes) output += `Notes: ${r.notes}\n`;
  }

  return output;
}
