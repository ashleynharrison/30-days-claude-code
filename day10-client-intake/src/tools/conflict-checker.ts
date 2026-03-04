import db from '../database.js';

interface ConflictCheckerParams {
  client_id?: number;
  status?: string;
  show_all?: boolean;
}

export function conflictChecker(params: ConflictCheckerParams): string {
  let sql = `
    SELECT cc.*, c.name as client_name, c.company, c.practice_area
    FROM conflict_checks cc
    JOIN clients c ON cc.client_id = c.id
    WHERE 1=1
  `;
  const bindings: unknown[] = [];

  if (params.client_id) {
    sql += ' AND cc.client_id = ?';
    bindings.push(params.client_id);
  }

  if (params.status) {
    sql += ' AND cc.status = ?';
    bindings.push(params.status);
  }

  if (!params.show_all && !params.client_id && !params.status) {
    // By default, show only non-cleared checks (actionable items)
    sql += " AND cc.status != 'cleared'";
  }

  sql += ' ORDER BY cc.checked_at DESC';

  const rows = db.prepare(sql).all(...bindings) as Record<string, unknown>[];

  if (rows.length === 0) return 'No conflict checks found matching your criteria.';

  let output = `=== Conflict Checks (${rows.length} found) ===\n`;
  for (const r of rows) {
    const statusLabel = r.status === 'pending' ? '⏳ PENDING' :
                       r.status === 'cleared' ? '✅ CLEARED' :
                       r.status === 'conflict_found' ? '🚨 CONFLICT FOUND' :
                       r.status === 'conflict_confirmed' ? '❌ CONFLICT CONFIRMED' :
                       (r.status as string).toUpperCase();

    output += `\n--- ${r.client_name} (${r.company}) ---\n`;
    output += `Practice Area: ${r.practice_area}\n`;
    output += `Status: ${statusLabel}\n`;
    output += `Checked By: ${r.checked_by}\n`;
    output += `Checked At: ${r.checked_at}\n`;
    output += `Conflicts Found: ${r.conflicts_found}\n`;

    if (r.conflicting_parties) {
      try {
        const parties = JSON.parse(r.conflicting_parties as string);
        output += `Conflicting Parties:\n`;
        for (const p of parties as string[]) {
          output += `  • ${p}\n`;
        }
      } catch {
        output += `Conflicting Parties: ${r.conflicting_parties}\n`;
      }
    }

    if (r.conflicting_matters) {
      try {
        const matters = JSON.parse(r.conflicting_matters as string);
        output += `Conflicting Matters:\n`;
        for (const m of matters as string[]) {
          output += `  • ${m}\n`;
        }
      } catch {
        output += `Conflicting Matters: ${r.conflicting_matters}\n`;
      }
    }

    if (r.resolution) output += `Resolution: ${r.resolution}\n`;
    if (r.notes) output += `Notes: ${r.notes}\n`;
  }

  return output;
}
