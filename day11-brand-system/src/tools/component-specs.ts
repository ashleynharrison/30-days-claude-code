import db from '../database.js';

interface ComponentSpecsParams {
  brand_id?: number;
  component_name?: string;
}

export function componentSpecs(params: ComponentSpecsParams): string {
  let sql = `
    SELECT cs.*, b.name as brand_name
    FROM component_specs cs
    JOIN brands b ON cs.brand_id = b.id
    WHERE 1=1
  `;
  const bindings: unknown[] = [];

  if (params.brand_id) {
    sql += ' AND cs.brand_id = ?';
    bindings.push(params.brand_id);
  }

  if (params.component_name) {
    sql += ' AND cs.component_name LIKE ?';
    bindings.push(`%${params.component_name}%`);
  }

  sql += ' ORDER BY cs.brand_id, cs.component_name, cs.variant';

  const rows = db.prepare(sql).all(...bindings) as Record<string, unknown>[];
  if (rows.length === 0) return 'No component specs found.';

  let output = `=== Component Specs (${rows.length} found) ===\n`;

  for (const r of rows) {
    output += `\n>> ${r.brand_name}: ${r.component_name} (${r.variant}) <<\n`;

    // Parse and display properties
    try {
      const props = JSON.parse(r.properties as string);
      output += `  Properties:\n`;
      for (const [key, value] of Object.entries(props)) {
        if (typeof value === 'object' && value !== null) {
          output += `    ${key}:\n`;
          for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            output += `      ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}\n`;
          }
        } else {
          output += `    ${key}: ${value}\n`;
        }
      }
    } catch {
      output += `  Properties: ${r.properties}\n`;
    }

    if (r.usage_guidelines) output += `  Usage: ${r.usage_guidelines}\n`;

    if (r.do_list) {
      try {
        const dos = JSON.parse(r.do_list as string);
        output += `  ✅ DO:\n`;
        for (const d of dos as string[]) output += `    • ${d}\n`;
      } catch { /* skip */ }
    }

    if (r.dont_list) {
      try {
        const donts = JSON.parse(r.dont_list as string);
        output += `  ❌ DON'T:\n`;
        for (const d of donts as string[]) output += `    • ${d}\n`;
      } catch { /* skip */ }
    }
  }

  return output;
}
