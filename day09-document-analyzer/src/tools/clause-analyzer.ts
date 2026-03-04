import { getDb } from '../database.js';

export function clauseAnalyzer(params: {
  document_id?: number;
  clause_type?: string;
  risk_level?: string;
}): string {
  const db = getDb();
  const conditions: string[] = [];
  const values: any[] = [];

  if (params.document_id) {
    conditions.push("c.document_id = ?");
    values.push(params.document_id);
  }

  if (params.clause_type) {
    conditions.push("c.clause_type LIKE ?");
    values.push(`%${params.clause_type}%`);
  }

  if (params.risk_level) {
    conditions.push("c.risk_level = ?");
    values.push(params.risk_level);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT c.*, d.title AS document_title
    FROM clauses c
    JOIN documents d ON c.document_id = d.id
    ${where}
    ORDER BY
      CASE c.risk_level WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
      d.title ASC
  `).all(...values) as any[];

  if (rows.length === 0) {
    return 'No clauses found matching the specified criteria.';
  }

  const header = `=== Clause Analysis (${rows.length} found) ===\n`;

  const results = rows.map((c: any, i: number) => {
    const riskTag = c.risk_level === 'high' ? ' [HIGH RISK]' : '';
    return [
      `--- Clause ${i + 1}${riskTag} ---`,
      `Document: ${c.document_title}`,
      `Type: ${c.clause_type}`,
      `Section: ${c.section_ref || 'N/A'}`,
      `Title: ${c.title}`,
      `Summary: ${c.summary}`,
      `Risk Level: ${c.risk_level.toUpperCase()}`,
    ].join('\n');
  });

  return header + results.join('\n\n');
}
