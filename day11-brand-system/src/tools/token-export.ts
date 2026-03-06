import db from '../database.js';

interface TokenExportParams {
  brand_id: number;
  category?: string;
  format?: string;
}

export function tokenExport(params: TokenExportParams): string {
  let sql = `
    SELECT dt.*, b.name as brand_name
    FROM design_tokens dt
    JOIN brands b ON dt.brand_id = b.id
    WHERE dt.brand_id = ?
  `;
  const bindings: unknown[] = [params.brand_id];

  if (params.category) {
    sql += ' AND dt.category = ?';
    bindings.push(params.category);
  }

  sql += ' ORDER BY dt.category, dt.id';

  const rows = db.prepare(sql).all(...bindings) as Record<string, unknown>[];
  if (rows.length === 0) return 'No design tokens found for this brand.';

  const brandName = rows[0].brand_name as string;
  const format = params.format || 'css';

  // Group by category
  const grouped: Record<string, Record<string, unknown>[]> = {};
  for (const r of rows) {
    const cat = r.category as string;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(r);
  }

  let output = `=== Design Tokens: ${brandName} (${rows.length} tokens) ===\n`;
  output += `Format: ${format.toUpperCase()}\n\n`;

  if (format === 'css') {
    output += `:root {\n  /* ${brandName} Design Tokens */\n\n`;

    // Also include colors
    const colors = db.prepare('SELECT * FROM color_palettes WHERE brand_id = ? ORDER BY id').all(params.brand_id) as Record<string, unknown>[];
    if (colors.length > 0) {
      output += `  /* Colors */\n`;
      for (const c of colors) {
        const varName = `--color-${(c.role as string).replace(/[_ ]/g, '-')}`;
        output += `  ${varName}: ${c.hex};\n`;
      }
      output += '\n';
    }

    for (const [category, tokens] of Object.entries(grouped)) {
      output += `  /* ${category.charAt(0).toUpperCase() + category.slice(1)} */\n`;
      for (const t of tokens) {
        output += `  ${t.css_variable}: ${t.value};`;
        if (t.description) output += ` /* ${t.description} */`;
        output += '\n';
      }
      output += '\n';
    }
    output += '}\n';

  } else if (format === 'json') {
    const tokenObj: Record<string, Record<string, { value: string; description?: string }>> = {};
    for (const [category, tokens] of Object.entries(grouped)) {
      tokenObj[category] = {};
      for (const t of tokens) {
        tokenObj[category][t.token_name as string] = {
          value: t.value as string,
          ...(t.description ? { description: t.description as string } : {}),
        };
      }
    }
    output += JSON.stringify(tokenObj, null, 2);

  } else if (format === 'tailwind') {
    output += `// tailwind.config.js extend\n`;
    output += `module.exports = {\n  theme: {\n    extend: {\n`;

    const colors = db.prepare('SELECT * FROM color_palettes WHERE brand_id = ? ORDER BY id').all(params.brand_id) as Record<string, unknown>[];
    if (colors.length > 0) {
      output += `      colors: {\n`;
      for (const c of colors) {
        const name = (c.role as string).replace(/[_ ]/g, '-');
        output += `        '${name}': '${c.hex}',\n`;
      }
      output += `      },\n`;
    }

    if (grouped['spacing']) {
      output += `      spacing: {\n`;
      for (const t of grouped['spacing']) {
        const name = (t.token_name as string).replace('space-', '');
        output += `        '${name}': '${t.value}',\n`;
      }
      output += `      },\n`;
    }

    if (grouped['border-radius']) {
      output += `      borderRadius: {\n`;
      for (const t of grouped['border-radius']) {
        const name = (t.token_name as string).replace('radius-', '');
        output += `        '${name}': '${t.value}',\n`;
      }
      output += `      },\n`;
    }

    output += `    },\n  },\n};\n`;
  }

  // Summary table
  output += `\n--- Token Summary ---\n`;
  for (const [category, tokens] of Object.entries(grouped)) {
    output += `  ${category}: ${tokens.length} tokens\n`;
  }

  return output;
}
