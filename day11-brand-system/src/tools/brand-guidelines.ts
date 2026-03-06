import db from '../database.js';

interface BrandGuidelinesParams {
  brand_id?: number;
  section?: string;
}

export function brandGuidelines(params: BrandGuidelinesParams): string {
  let sql = `
    SELECT bg.*, b.name as brand_name, b.tagline, b.personality, b.target_audience
    FROM brand_guidelines bg
    JOIN brands b ON bg.brand_id = b.id
    WHERE 1=1
  `;
  const bindings: unknown[] = [];

  if (params.brand_id) {
    sql += ' AND bg.brand_id = ?';
    bindings.push(params.brand_id);
  }

  if (params.section) {
    sql += ' AND bg.section = ?';
    bindings.push(params.section);
  }

  sql += ' ORDER BY bg.brand_id, bg.priority, bg.id';

  const rows = db.prepare(sql).all(...bindings) as Record<string, unknown>[];
  if (rows.length === 0) return 'No brand guidelines found.';

  // Group by brand
  const grouped: Record<number, { name: string; tagline: string; personality: string; audience: string; guidelines: Record<string, unknown>[] }> = {};
  for (const r of rows) {
    const bid = r.brand_id as number;
    if (!grouped[bid]) grouped[bid] = {
      name: r.brand_name as string,
      tagline: r.tagline as string,
      personality: r.personality as string,
      audience: r.target_audience as string,
      guidelines: [],
    };
    grouped[bid].guidelines.push(r);
  }

  let output = `=== Brand Guidelines ===\n`;

  for (const group of Object.values(grouped)) {
    output += `\n${'═'.repeat(50)}\n`;
    output += `${group.name}\n`;
    output += `"${group.tagline}"\n`;
    output += `Personality: ${group.personality}\n`;
    output += `Audience: ${group.audience}\n`;
    output += `${'═'.repeat(50)}\n`;

    for (const g of group.guidelines) {
      output += `\n--- ${g.title} (${(g.section as string).toUpperCase()}) ---\n`;
      output += `${g.content}\n`;

      if (g.examples) {
        try {
          const examples = JSON.parse(g.examples as string);
          if (examples.do) {
            output += `\n  ✅ DO say:\n`;
            for (const d of examples.do as string[]) output += `    "${d}"\n`;
          }
          if (examples.dont) {
            output += `  ❌ DON'T say:\n`;
            for (const d of examples.dont as string[]) output += `    "${d}"\n`;
          }
        } catch { /* skip */ }
      }
    }
  }

  return output;
}
