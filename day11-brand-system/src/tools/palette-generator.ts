import db from '../database.js';

interface PaletteParams {
  brand_id?: number;
  role?: string;
  wcag_compliant_only?: boolean;
}

export function paletteGenerator(params: PaletteParams): string {
  let sql = `
    SELECT cp.*, b.name as brand_name, b.personality
    FROM color_palettes cp
    JOIN brands b ON cp.brand_id = b.id
    WHERE 1=1
  `;
  const bindings: unknown[] = [];

  if (params.brand_id) {
    sql += ' AND cp.brand_id = ?';
    bindings.push(params.brand_id);
  }

  if (params.role) {
    sql += ' AND cp.role LIKE ?';
    bindings.push(`%${params.role}%`);
  }

  if (params.wcag_compliant_only) {
    sql += ' AND cp.wcag_aa_text = 1';
  }

  sql += ' ORDER BY cp.brand_id, cp.id';

  const rows = db.prepare(sql).all(...bindings) as Record<string, unknown>[];
  if (rows.length === 0) return 'No colors found matching your criteria.';

  // Group by brand
  const grouped: Record<number, { name: string; personality: string; colors: Record<string, unknown>[] }> = {};
  for (const r of rows) {
    const bid = r.brand_id as number;
    if (!grouped[bid]) grouped[bid] = { name: r.brand_name as string, personality: r.personality as string, colors: [] };
    grouped[bid].colors.push(r);
  }

  let output = `=== Color Palettes (${rows.length} colors) ===\n`;

  for (const group of Object.values(grouped)) {
    output += `\n>> ${group.name} — "${group.personality}" <<\n`;
    for (const c of group.colors) {
      const aaLabel = c.wcag_aa_text ? '✅ AA' : '❌ AA';
      const aaaLabel = c.wcag_aaa_text ? '✅ AAA' : '';
      output += `\n  ■ ${c.name} (${c.role})\n`;
      output += `    Hex: ${c.hex}  |  HSL: ${c.hsl}  |  RGB: ${c.rgb}\n`;
      output += `    Usage: ${c.usage}\n`;
      output += `    Contrast: ${c.contrast_on_white} on white, ${c.contrast_on_black} on black\n`;
      output += `    WCAG: ${aaLabel} ${aaaLabel}\n`;
    }
  }

  return output;
}
