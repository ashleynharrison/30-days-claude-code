import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerSiteLookup(server: McpServer) {
  server.tool(
    'site_lookup',
    'Search monitored sites by name, category, or owner. Returns site info, latest Core Web Vitals scores, and overall health status.',
    {
      search: z.string().optional().describe('Search by site name (partial match)'),
      category: z.string().optional().describe('Filter by category (e.g. E-Commerce, Content, SaaS App, Marketing)'),
      owner: z.string().optional().describe('Filter by site owner name'),
    },
    async ({ search, category, owner }) => {
      let query = `SELECT * FROM sites WHERE 1=1`;
      const params: any[] = [];

      if (search) {
        query += ` AND name LIKE ?`;
        params.push(`%${search}%`);
      }
      if (category) {
        query += ` AND category LIKE ?`;
        params.push(`%${category}%`);
      }
      if (owner) {
        query += ` AND owner LIKE ?`;
        params.push(`%${owner}%`);
      }

      query += ` ORDER BY name`;

      const sites = db.prepare(query).all(...params) as any[];

      if (sites.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No sites found matching your criteria.' }] };
      }

      const result = sites.map((s) => {
        const latest = db.prepare(`
          SELECT lcp_ms, cls, inp_ms, fcp_ms, ttfb_ms, device, measured_at
          FROM measurements
          WHERE site_id = ?
          ORDER BY measured_at DESC
          LIMIT 2
        `).all(s.id) as any[];

        const budgets = db.prepare(`
          SELECT metric, current_value, status
          FROM budgets
          WHERE site_id = ?
        `).all(s.id) as any[];

        const openAlerts = (db.prepare(`
          SELECT COUNT(*) as c FROM alerts WHERE site_id = ? AND acknowledged = 0
        `).get(s.id) as any).c;

        return {
          name: s.name,
          url: s.url,
          category: s.category,
          owner: s.owner,
          status: s.status,
          latest_vitals: latest,
          budget_status: budgets,
          open_alerts: openAlerts,
        };
      });

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ sites: result, count: result.length }, null, 2) }],
      };
    }
  );
}
