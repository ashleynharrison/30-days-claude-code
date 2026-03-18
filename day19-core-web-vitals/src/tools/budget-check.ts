import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerBudgetCheck(server: McpServer) {
  server.tool(
    'budget_check',
    'Check performance budgets across all monitored sites. Shows which sites are passing, warning, or failing their Core Web Vitals thresholds.',
    {
      status_filter: z.enum(['all', 'passing', 'warning', 'failing']).optional().describe('Filter by budget status (default: all)'),
      site_name: z.string().optional().describe('Filter to a specific site (partial match)'),
    },
    async ({ status_filter, site_name }) => {
      let query = `
        SELECT b.*, s.name as site_name, s.url as site_url
        FROM budgets b
        JOIN sites s ON b.site_id = s.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (status_filter && status_filter !== 'all') {
        query += ` AND b.status = ?`;
        params.push(status_filter);
      }
      if (site_name) {
        query += ` AND s.name LIKE ?`;
        params.push(`%${site_name}%`);
      }

      query += ` ORDER BY s.name, b.metric`;

      const budgets = db.prepare(query).all(...params) as any[];

      if (budgets.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No budgets found matching your criteria.' }] };
      }

      // Group by site
      const bySite: Record<string, any> = {};
      for (const b of budgets) {
        if (!bySite[b.site_name]) {
          bySite[b.site_name] = { site: b.site_name, url: b.site_url, metrics: [], overall: 'passing' };
        }
        bySite[b.site_name].metrics.push({
          metric: b.metric,
          current_value: b.current_value,
          good_threshold: b.threshold_good,
          poor_threshold: b.threshold_poor,
          status: b.status,
        });
        if (b.status === 'failing') bySite[b.site_name].overall = 'failing';
        else if (b.status === 'warning' && bySite[b.site_name].overall !== 'failing') bySite[b.site_name].overall = 'warning';
      }

      const sites = Object.values(bySite);
      const summary = {
        total_sites: sites.length,
        passing: sites.filter((s: any) => s.overall === 'passing').length,
        warning: sites.filter((s: any) => s.overall === 'warning').length,
        failing: sites.filter((s: any) => s.overall === 'failing').length,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ summary, sites }, null, 2) }],
      };
    }
  );
}
