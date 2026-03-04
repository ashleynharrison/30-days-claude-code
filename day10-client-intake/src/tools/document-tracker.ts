import db from '../database.js';

interface DocumentTrackerParams {
  client_id?: number;
  status?: string;
  doc_type?: string;
}

export function documentTracker(params: DocumentTrackerParams): string {
  let sql = `
    SELECT d.*, c.name as client_name, c.company
    FROM documents d
    JOIN clients c ON d.client_id = c.id
    WHERE 1=1
  `;
  const bindings: unknown[] = [];

  if (params.client_id) {
    sql += ' AND d.client_id = ?';
    bindings.push(params.client_id);
  }

  if (params.status) {
    sql += ' AND d.status = ?';
    bindings.push(params.status);
  }

  if (params.doc_type) {
    sql += ' AND d.doc_type LIKE ?';
    bindings.push(`%${params.doc_type}%`);
  }

  sql += ' ORDER BY d.uploaded_at DESC';

  const rows = db.prepare(sql).all(...bindings) as Record<string, unknown>[];

  if (rows.length === 0) return 'No documents found matching your criteria.';

  // Summary
  const pending = rows.filter(r => r.status === 'pending_review').length;
  const reviewed = rows.filter(r => r.status === 'reviewed').length;
  const flagged = rows.filter(r => r.status === 'flagged').length;

  let output = `=== Document Tracker (${rows.length} documents) ===\n`;
  output += `Summary: ${reviewed} reviewed | ${pending} pending review | ${flagged} flagged\n`;

  // Group by client
  const grouped: Record<number, { name: string; company: string; docs: Record<string, unknown>[] }> = {};
  for (const r of rows) {
    const clientId = r.client_id as number;
    if (!grouped[clientId]) {
      grouped[clientId] = { name: r.client_name as string, company: r.company as string, docs: [] };
    }
    grouped[clientId].docs.push(r);
  }

  for (const group of Object.values(grouped)) {
    output += `\n>> ${group.name} (${group.company}) — ${group.docs.length} documents <<\n`;
    for (const d of group.docs) {
      const statusIcon = d.status === 'reviewed' ? '✅' :
                         d.status === 'pending_review' ? '📋' :
                         d.status === 'flagged' ? '🚩' : '📄';

      output += `  ${statusIcon} ${d.filename}\n`;
      output += `     Type: ${(d.doc_type as string).replace(/_/g, ' ')}\n`;
      output += `     Status: ${(d.status as string).replace(/_/g, ' ').toUpperCase()}\n`;
      output += `     Uploaded: ${d.uploaded_at}\n`;
      if (d.reviewed_at) output += `     Reviewed: ${d.reviewed_at} by ${d.reviewed_by}\n`;
      if (d.notes) output += `     Notes: ${d.notes}\n`;
    }
  }

  return output;
}
