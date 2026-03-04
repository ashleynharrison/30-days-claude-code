import { getDb } from '../database.js';

export function obligationTracker(params: {
  document_id?: number;
  party_name?: string;
  obligation_type?: string;
  status?: string;
}): string {
  const db = getDb();
  const conditions: string[] = [];
  const values: any[] = [];

  if (params.document_id) {
    conditions.push("o.document_id = ?");
    values.push(params.document_id);
  }

  if (params.party_name) {
    conditions.push("o.party_name LIKE ?");
    values.push(`%${params.party_name}%`);
  }

  if (params.obligation_type) {
    conditions.push("o.obligation_type = ?");
    values.push(params.obligation_type);
  }

  if (params.status) {
    conditions.push("o.status = ?");
    values.push(params.status);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT o.*, d.title AS document_title
    FROM obligations o
    JOIN documents d ON o.document_id = d.id
    ${where}
    ORDER BY d.title ASC, o.party_name ASC
  `).all(...values) as any[];

  if (rows.length === 0) {
    return 'No obligations found matching the specified criteria.';
  }

  const header = `=== Obligation Tracker (${rows.length} found) ===\n`;

  // Group by document
  const grouped: Record<string, any[]> = {};
  for (const row of rows) {
    const key = row.document_title;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  }

  const sections: string[] = [];
  for (const [docTitle, obligations] of Object.entries(grouped)) {
    const docHeader = `\n>> ${docTitle} <<`;
    const items = obligations.map((o: any, i: number) => {
      return [
        `  ${i + 1}. ${o.description}`,
        `     Party: ${o.party_name}`,
        `     Type: ${o.obligation_type}`,
        `     Section: ${o.section_ref || 'N/A'}`,
        `     Status: ${o.status.toUpperCase()}`,
        `     Due Date: ${o.due_date || 'Ongoing'}`,
      ].join('\n');
    });
    sections.push(docHeader + '\n' + items.join('\n\n'));
  }

  return header + sections.join('\n');
}
