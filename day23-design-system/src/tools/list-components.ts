import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerListComponents(server: McpServer) {
  server.tool(
    'list_components',
    'List all components in the design system. Filter by category, status, or owner. Shows variant count, accessibility score, and status for each component.',
    {
      category: z.string().optional().describe('Filter by category: actions, forms, overlays, layout, data-display, feedback, navigation'),
      status: z.string().optional().describe('Filter by status: stable, beta, draft, deprecated'),
      owner: z.string().optional().describe('Filter by owner name (partial match)'),
      search: z.string().optional().describe('Search by component name or description'),
    },
    async ({ category, status, owner, search }) => {
      let query = `SELECT * FROM components WHERE 1=1`;
      const params: any[] = [];

      if (category) {
        query += ` AND category = ?`;
        params.push(category);
      }
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }
      if (owner) {
        query += ` AND owner LIKE ?`;
        params.push(`%${owner}%`);
      }
      if (search) {
        query += ` AND (name LIKE ? OR description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY category, name`;

      const components = db.prepare(query).all(...params) as any[];

      if (components.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No components found matching your criteria.' }] };
      }

      const result = components.map((c) => {
        const variantCount = (db.prepare(`SELECT COUNT(*) as c FROM variants WHERE component_id = ?`).get(c.id) as any).c;
        const a11yTotal = (db.prepare(`SELECT COUNT(*) as c FROM accessibility_checks WHERE component_id = ?`).get(c.id) as any).c;
        const a11yPassed = (db.prepare(`SELECT COUNT(*) as c FROM accessibility_checks WHERE component_id = ? AND passed = 1`).get(c.id) as any).c;
        const depCount = (db.prepare(`SELECT COUNT(*) as c FROM dependencies WHERE component_id = ?`).get(c.id) as any).c;

        return {
          id: c.id,
          name: c.name,
          category: c.category,
          status: c.status,
          owner: c.owner,
          variants: variantCount,
          accessibility_score: c.accessibility_score,
          a11y_checks: `${a11yPassed}/${a11yTotal} passed`,
          dependencies: depCount,
          updated_at: c.updated_at,
        };
      });

      // Category summary
      const categories: Record<string, number> = {};
      for (const c of result) {
        categories[c.category] = (categories[c.category] || 0) + 1;
      }

      const statusSummary: Record<string, number> = {};
      for (const c of result) {
        statusSummary[c.status] = (statusSummary[c.status] || 0) + 1;
      }

      const avgA11y = result.reduce((sum, c) => sum + (c.accessibility_score || 0), 0) / result.length;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            summary: {
              total_components: result.length,
              by_status: statusSummary,
              by_category: categories,
              avg_accessibility_score: Math.round(avgA11y * 10) / 10,
            },
            components: result,
          }, null, 2),
        }],
      };
    }
  );
}
