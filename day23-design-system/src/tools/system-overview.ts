import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import db from '../database.js';

export function registerSystemOverview(server: McpServer) {
  server.tool(
    'system_overview',
    'Get a high-level overview of the entire design system — token coverage, component health, accessibility scores, dependency graph, and team activity.',
    {},
    async () => {
      // Token stats
      const tokensByCategory = db.prepare(`
        SELECT category, COUNT(*) as count
        FROM tokens
        GROUP BY category
        ORDER BY count DESC
      `).all() as any[];

      const darkModeTokens = (db.prepare(`SELECT COUNT(*) as c FROM tokens WHERE dark_value IS NOT NULL`).get() as any).c;
      const totalTokens = (db.prepare(`SELECT COUNT(*) as c FROM tokens`).get() as any).c;

      // Component stats
      const components = db.prepare(`SELECT * FROM components`).all() as any[];
      const byStatus: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      for (const c of components) {
        byStatus[c.status] = (byStatus[c.status] || 0) + 1;
        byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      }

      const totalVariants = (db.prepare(`SELECT COUNT(*) as c FROM variants`).get() as any).c;

      // Accessibility
      const totalA11yChecks = (db.prepare(`SELECT COUNT(*) as c FROM accessibility_checks`).get() as any).c;
      const passedA11yChecks = (db.prepare(`SELECT COUNT(*) as c FROM accessibility_checks WHERE passed = 1`).get() as any).c;
      const avgScore = Math.round(components.reduce((sum: number, c: any) => sum + (c.accessibility_score || 0), 0) / components.length);

      const lowestScoring = db.prepare(`
        SELECT name, accessibility_score, status
        FROM components
        ORDER BY accessibility_score ASC
        LIMIT 3
      `).all() as any[];

      const highestScoring = db.prepare(`
        SELECT name, accessibility_score, status
        FROM components
        ORDER BY accessibility_score DESC
        LIMIT 3
      `).all() as any[];

      // Dependencies
      const totalDeps = (db.prepare(`SELECT COUNT(*) as c FROM dependencies`).get() as any).c;
      const tokenDeps = (db.prepare(`SELECT COUNT(*) as c FROM dependencies WHERE depends_on_type = 'token'`).get() as any).c;
      const componentDeps = (db.prepare(`SELECT COUNT(*) as c FROM dependencies WHERE depends_on_type = 'component'`).get() as any).c;

      // Most depended-on tokens
      const topTokens = db.prepare(`
        SELECT depends_on_name as token, COUNT(*) as used_by
        FROM dependencies
        WHERE depends_on_type = 'token'
        GROUP BY depends_on_name
        ORDER BY used_by DESC
        LIMIT 5
      `).all() as any[];

      // Most depended-on components
      const topComponents = db.prepare(`
        SELECT depends_on_name as component, COUNT(*) as used_by
        FROM dependencies
        WHERE depends_on_type = 'component'
        GROUP BY depends_on_name
        ORDER BY used_by DESC
        LIMIT 5
      `).all() as any[];

      // Team activity
      const authorStats = db.prepare(`
        SELECT author, COUNT(*) as changes
        FROM changelog
        GROUP BY author
        ORDER BY changes DESC
      `).all() as any[];

      const recentChanges = db.prepare(`
        SELECT cl.action, c.name as component, cl.description, cl.author, cl.version, cl.created_at
        FROM changelog cl
        LEFT JOIN components c ON c.id = cl.component_id
        ORDER BY cl.created_at DESC
        LIMIT 5
      `).all() as any[];

      const latestVersion = db.prepare(`
        SELECT version FROM changelog WHERE version IS NOT NULL ORDER BY created_at DESC LIMIT 1
      `).get() as any;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            design_system: {
              version: latestVersion?.version || 'unknown',
              tokens: {
                total: totalTokens,
                dark_mode_coverage: `${darkModeTokens}/${totalTokens} (${Math.round((darkModeTokens / totalTokens) * 100)}%)`,
                by_category: tokensByCategory,
              },
              components: {
                total: components.length,
                total_variants: totalVariants,
                by_status: byStatus,
                by_category: byCategory,
              },
              accessibility: {
                system_score: avgScore,
                checks: `${passedA11yChecks}/${totalA11yChecks} passed (${Math.round((passedA11yChecks / totalA11yChecks) * 100)}%)`,
                highest_scoring: highestScoring,
                needs_attention: lowestScoring,
              },
              dependencies: {
                total: totalDeps,
                token_references: tokenDeps,
                component_references: componentDeps,
                most_used_tokens: topTokens,
                most_used_components: topComponents,
              },
              team: {
                contributors: authorStats,
                recent_changes: recentChanges,
              },
            },
          }, null, 2),
        }],
      };
    }
  );
}
