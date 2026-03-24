import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerA11yAudit(server: McpServer) {
  server.tool(
    'a11y_audit',
    'Run an accessibility audit across all components or a specific one. Shows passing/failing checks, overall score, and prioritized list of issues to fix.',
    {
      component: z.string().optional().describe('Audit a specific component by name (omit for full system audit)'),
      failing_only: z.boolean().optional().describe('Show only failing checks (default: false)'),
    },
    async ({ component, failing_only = false }) => {
      let components: any[];

      if (component) {
        const comp = db.prepare(`SELECT * FROM components WHERE LOWER(name) = LOWER(?)`).get(component) as any;
        if (!comp) {
          return { content: [{ type: 'text' as const, text: `Component "${component}" not found.` }] };
        }
        components = [comp];
      } else {
        components = db.prepare(`SELECT * FROM components ORDER BY accessibility_score ASC`).all() as any[];
      }

      const audit = components.map((c) => {
        let checkQuery = `SELECT * FROM accessibility_checks WHERE component_id = ?`;
        if (failing_only) {
          checkQuery += ` AND passed = 0`;
        }
        checkQuery += ` ORDER BY passed ASC, check_type`;

        const checks = db.prepare(checkQuery).all(c.id) as any[];
        const totalChecks = (db.prepare(`SELECT COUNT(*) as c FROM accessibility_checks WHERE component_id = ?`).get(c.id) as any).c;
        const passedChecks = (db.prepare(`SELECT COUNT(*) as c FROM accessibility_checks WHERE component_id = ? AND passed = 1`).get(c.id) as any).c;

        return {
          component: c.name,
          status: c.status,
          score: c.accessibility_score,
          checks_passed: `${passedChecks}/${totalChecks}`,
          pass_rate: totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0,
          checks: checks.map((ch: any) => ({
            type: ch.check_type,
            description: ch.description,
            passed: !!ch.passed,
            notes: ch.notes,
            checked_at: ch.checked_at,
          })),
        };
      });

      // Overall stats
      const totalChecks = (db.prepare(`SELECT COUNT(*) as c FROM accessibility_checks`).get() as any).c;
      const totalPassed = (db.prepare(`SELECT COUNT(*) as c FROM accessibility_checks WHERE passed = 1`).get() as any).c;
      const totalFailing = totalChecks - totalPassed;

      // Components below 90 score
      const belowThreshold = components.filter((c) => c.accessibility_score < 90);

      // Failing checks grouped by type
      const failingByType = db.prepare(`
        SELECT check_type, COUNT(*) as count
        FROM accessibility_checks
        WHERE passed = 0
        GROUP BY check_type
        ORDER BY count DESC
      `).all() as any[];

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            summary: {
              components_audited: components.length,
              total_checks: totalChecks,
              passed: totalPassed,
              failing: totalFailing,
              pass_rate: `${Math.round((totalPassed / totalChecks) * 100)}%`,
              system_score: Math.round(components.reduce((sum, c) => sum + c.accessibility_score, 0) / components.length),
              components_below_90: belowThreshold.map((c) => ({ name: c.name, score: c.accessibility_score })),
              failing_by_type: failingByType,
            },
            audit: audit,
          }, null, 2),
        }],
      };
    }
  );
}
