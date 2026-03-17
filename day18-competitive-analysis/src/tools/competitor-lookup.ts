import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerCompetitorLookup(server: McpServer) {
  server.tool(
    'competitor_lookup',
    'Search competitors by name, category, or status. Returns company info, funding, headcount, and latest market moves.',
    {
      search: z.string().optional().describe('Search by competitor name (partial match)'),
      category: z.string().optional().describe('Filter by category (e.g. Developer Tools, DevOps, Platform Engineering)'),
      status: z.enum(['active', 'acquired', 'inactive']).optional().describe('Filter by competitor status'),
    },
    async ({ search, category, status }) => {
      let query = `SELECT * FROM competitors WHERE 1=1`;
      const params: any[] = [];

      if (search) {
        query += ` AND name LIKE ?`;
        params.push(`%${search}%`);
      }
      if (category) {
        query += ` AND category LIKE ?`;
        params.push(`%${category}%`);
      }
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      query += ` ORDER BY name`;

      const competitors = db.prepare(query).all(...params) as any[];

      if (competitors.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No competitors found matching your criteria.' }] };
      }

      const result = competitors.map((c) => {
        const recentMoves = db.prepare(`
          SELECT move_type, title, move_date, impact
          FROM market_moves
          WHERE competitor_id = ?
          ORDER BY move_date DESC
          LIMIT 3
        `).all(c.id) as any[];

        const pricingTiers = db.prepare(`
          SELECT tier_name, price_monthly, billing_model
          FROM pricing
          WHERE competitor_id = ?
          ORDER BY COALESCE(price_monthly, 999999)
        `).all(c.id) as any[];

        return {
          name: c.name,
          website: c.website,
          category: c.category,
          founded: c.founded_year,
          hq: c.hq_location,
          employees: c.employee_count,
          funding: c.funding_total,
          status: c.status,
          notes: c.notes,
          pricing_tiers: pricingTiers.map((p: any) => ({
            tier: p.tier_name,
            monthly: p.price_monthly ? `$${p.price_monthly}` : 'Custom',
            model: p.billing_model,
          })),
          recent_moves: recentMoves,
        };
      });

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ competitors: result, count: result.length }, null, 2) }],
      };
    }
  );
}
