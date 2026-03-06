import db from '../database.js';

interface StyleAuditParams {
  brand_id?: number;
  severity?: string;
  audit_type?: string;
}

export function styleAudit(params: StyleAuditParams): string {
  let sql = `
    SELECT sa.*, b.name as brand_name
    FROM style_audits sa
    JOIN brands b ON sa.brand_id = b.id
    WHERE 1=1
  `;
  const bindings: unknown[] = [];

  if (params.brand_id) {
    sql += ' AND sa.brand_id = ?';
    bindings.push(params.brand_id);
  }

  if (params.severity) {
    sql += ' AND sa.severity = ?';
    bindings.push(params.severity);
  }

  if (params.audit_type) {
    sql += ' AND sa.audit_type = ?';
    bindings.push(params.audit_type);
  }

  // High severity first
  sql += ` ORDER BY
    CASE sa.severity WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
    sa.brand_id, sa.id`;

  const rows = db.prepare(sql).all(...bindings) as Record<string, unknown>[];
  if (rows.length === 0) return 'No style audit issues found. Everything looks good!';

  const highCount = rows.filter(r => r.severity === 'high').length;
  const medCount = rows.filter(r => r.severity === 'medium').length;
  const lowCount = rows.filter(r => r.severity === 'low').length;
  const fixableCount = rows.filter(r => r.auto_fixable === 1).length;

  let output = `=== Style Audit Report (${rows.length} issues) ===\n`;
  output += `🔴 High: ${highCount}  |  🟡 Medium: ${medCount}  |  🔵 Low: ${lowCount}\n`;
  output += `🔧 Auto-fixable: ${fixableCount}\n`;

  for (const r of rows) {
    const icon = r.severity === 'high' ? '🔴' : r.severity === 'medium' ? '🟡' : '🔵';
    const fixIcon = r.auto_fixable ? ' 🔧' : '';

    output += `\n${icon} ${(r.severity as string).toUpperCase()} — ${r.brand_name}${fixIcon}\n`;
    output += `  Type: ${(r.audit_type as string).toUpperCase()}\n`;
    output += `  Element: ${r.element}\n`;
    output += `  Issue: ${r.issue}\n`;
    output += `  Fix: ${r.recommendation}\n`;
  }

  return output;
}
