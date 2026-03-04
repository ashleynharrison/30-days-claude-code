import { getDb } from '../database.js';

export function redFlags(params: {
  document_id?: number;
  severity?: string;
  category?: string;
}): string {
  const db = getDb();
  const conditions: string[] = [];
  const values: any[] = [];

  if (params.document_id) {
    conditions.push("rf.document_id = ?");
    values.push(params.document_id);
  }

  if (params.severity) {
    conditions.push("rf.severity = ?");
    values.push(params.severity);
  }

  if (params.category) {
    conditions.push("rf.category LIKE ?");
    values.push(`%${params.category}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT rf.*, d.title AS document_title
    FROM red_flags rf
    JOIN documents d ON rf.document_id = d.id
    ${where}
    ORDER BY
      CASE rf.severity WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
      d.title ASC
  `).all(...values) as any[];

  if (rows.length === 0) {
    return 'No red flags found matching the specified criteria.';
  }

  const highCount = rows.filter((r: any) => r.severity === 'high').length;
  const header = `=== Red Flags (${rows.length} found, ${highCount} high severity) ===\n`;

  const results = rows.map((rf: any, i: number) => {
    const severityTag = rf.severity === 'high' ? ' [HIGH]' : rf.severity === 'medium' ? ' [MEDIUM]' : ' [LOW]';
    return [
      `--- Red Flag ${i + 1}${severityTag} ---`,
      `Document: ${rf.document_title}`,
      `Severity: ${rf.severity.toUpperCase()}`,
      `Category: ${rf.category}`,
      `Description: ${rf.description}`,
      `Section: ${rf.section_ref || 'N/A'}`,
      `Recommendation: ${rf.recommendation}`,
    ].join('\n');
  });

  return header + results.join('\n\n');
}
