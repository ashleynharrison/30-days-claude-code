import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerOptimizationHitlist(server: McpServer) {
  server.tool(
    'optimization_hitlist',
    'Get prioritized optimization recommendations for a site. Ranked by impact and effort. Includes estimated performance savings and current status.',
    {
      site_name: z.string().optional().describe('Filter to a specific site (partial match). If omitted, shows all sites.'),
      category: z.string().optional().describe('Filter by category (e.g. Images, JavaScript, CSS, Layout, Server, Fonts)'),
      impact: z.enum(['high', 'medium', 'low']).optional().describe('Filter by impact level'),
      status: z.enum(['open', 'in_progress', 'completed']).optional().describe('Filter by status (default: open)'),
    },
    async ({ site_name, category, impact, status }) => {
      let query = `
        SELECT r.*, s.name as site_name
        FROM recommendations r
        JOIN sites s ON r.site_id = s.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (site_name) {
        query += ` AND s.name LIKE ?`;
        params.push(`%${site_name}%`);
      }
      if (category) {
        query += ` AND r.category LIKE ?`;
        params.push(`%${category}%`);
      }
      if (impact) {
        query += ` AND r.impact = ?`;
        params.push(impact);
      }
      if (status) {
        query += ` AND r.status = ?`;
        params.push(status);
      } else {
        query += ` AND r.status != 'completed'`;
      }

      // Sort by impact (high first) then effort (low first)
      query += ` ORDER BY
        CASE r.impact WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
        CASE r.effort WHEN 'low' THEN 1 WHEN 'medium' THEN 2 WHEN 'high' THEN 3 END`;

      const recs = db.prepare(query).all(...params) as any[];

      if (recs.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No recommendations found matching your criteria.' }] };
      }

      const result = recs.map((r) => ({
        site: r.site_name,
        category: r.category,
        title: r.title,
        description: r.description,
        impact: r.impact,
        effort: r.effort,
        status: r.status,
        estimated_savings_ms: r.estimated_savings_ms,
      }));

      const totalSavings = recs
        .filter((r) => r.estimated_savings_ms && r.status !== 'completed')
        .reduce((sum: number, r: any) => sum + r.estimated_savings_ms, 0);

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          recommendations: result,
          count: result.length,
          total_potential_savings_ms: totalSavings,
        }, null, 2) }],
      };
    }
  );
}
