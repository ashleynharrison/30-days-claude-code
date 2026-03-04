import { getDb } from '../database.js';

export function partyLookup(params: {
  name?: string;
  role?: string;
  document_id?: number;
}): string {
  const db = getDb();
  const conditions: string[] = [];
  const values: any[] = [];

  if (params.name) {
    conditions.push("p.name LIKE ?");
    values.push(`%${params.name}%`);
  }

  if (params.role) {
    conditions.push("p.role LIKE ?");
    values.push(`%${params.role}%`);
  }

  if (params.document_id) {
    conditions.push("p.document_id = ?");
    values.push(params.document_id);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT p.*, d.title AS document_title
    FROM parties p
    JOIN documents d ON p.document_id = d.id
    ${where}
    ORDER BY p.name ASC
  `).all(...values) as any[];

  if (rows.length === 0) {
    return 'No parties found matching the specified criteria.';
  }

  const header = `=== Party Lookup Results (${rows.length} found) ===\n`;

  const results = rows.map((p: any, i: number) => {
    return [
      `--- Party ${i + 1} ---`,
      `Name: ${p.name}`,
      `Document: ${p.document_title}`,
      `Role: ${p.role}`,
      `Entity Type: ${p.entity_type || 'N/A'}`,
      `Contact Email: ${p.contact_email || 'N/A'}`,
    ].join('\n');
  });

  return header + results.join('\n\n');
}
