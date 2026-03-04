import { getDb } from '../database.js';

export function documentSearch(params: {
  query?: string;
  doc_type?: string;
  status?: string;
}): string {
  const db = getDb();
  const conditions: string[] = [];
  const values: any[] = [];

  if (params.query) {
    conditions.push("title LIKE ?");
    values.push(`%${params.query}%`);
  }

  if (params.doc_type) {
    conditions.push("doc_type = ?");
    values.push(params.doc_type);
  }

  if (params.status) {
    conditions.push("status = ?");
    values.push(params.status);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM documents ${where} ORDER BY upload_date DESC`).all(...values) as any[];

  if (rows.length === 0) {
    return 'No documents found matching the specified criteria.';
  }

  const header = `=== Document Search Results (${rows.length} found) ===\n`;

  const results = rows.map((doc: any, i: number) => {
    return [
      `--- Document ${i + 1} ---`,
      `Title: ${doc.title}`,
      `Type: ${doc.doc_type.toUpperCase()}`,
      `Status: ${doc.status}`,
      `Effective Date: ${doc.effective_date || 'N/A'}`,
      `Expiration Date: ${doc.expiration_date || 'N/A'}`,
      `Pages: ${doc.total_pages}`,
      `Summary: ${doc.summary}`,
    ].join('\n');
  });

  return header + results.join('\n\n');
}
