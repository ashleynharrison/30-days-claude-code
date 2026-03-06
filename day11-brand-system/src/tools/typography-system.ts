import db from '../database.js';

interface TypographyParams {
  brand_id?: number;
  role?: string;
}

export function typographySystem(params: TypographyParams): string {
  let sql = `
    SELECT t.*, b.name as brand_name
    FROM typography t
    JOIN brands b ON t.brand_id = b.id
    WHERE 1=1
  `;
  const bindings: unknown[] = [];

  if (params.brand_id) {
    sql += ' AND t.brand_id = ?';
    bindings.push(params.brand_id);
  }

  if (params.role) {
    sql += ' AND t.role = ?';
    bindings.push(params.role);
  }

  sql += ' ORDER BY t.brand_id, t.id';

  const rows = db.prepare(sql).all(...bindings) as Record<string, unknown>[];
  if (rows.length === 0) return 'No typography entries found.';

  const grouped: Record<number, { name: string; types: Record<string, unknown>[] }> = {};
  for (const r of rows) {
    const bid = r.brand_id as number;
    if (!grouped[bid]) grouped[bid] = { name: r.brand_name as string, types: [] };
    grouped[bid].types.push(r);
  }

  let output = `=== Typography Systems (${rows.length} entries) ===\n`;

  for (const group of Object.values(grouped)) {
    output += `\n>> ${group.name} <<\n`;
    for (const t of group.types) {
      output += `\n  𝐀 ${t.font_family} — ${(t.role as string).toUpperCase()}\n`;
      output += `    Source: ${t.font_source}\n`;
      output += `    Weights: ${t.weight_range}\n`;
      output += `    Fallback: ${t.fallback_stack}\n`;
      output += `    Usage: ${t.usage}\n`;
      if (t.pairing_rationale) output += `    Rationale: ${t.pairing_rationale}\n`;

      // Generate CSS snippet
      output += `    CSS: font-family: '${t.font_family}', ${t.fallback_stack};\n`;
    }
  }

  return output;
}
