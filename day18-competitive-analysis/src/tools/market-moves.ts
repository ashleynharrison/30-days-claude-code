import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerMarketMoves(server: McpServer) {
  server.tool(
    'market_moves',
    'Track competitor announcements, launches, funding, hires, partnerships, and pricing changes. Filter by competitor, type, impact, or date range.',
    {
      competitor: z.string().optional().describe('Filter by competitor name (partial match)'),
      move_type: z.enum(['product_launch', 'pricing_change', 'funding', 'acquisition', 'partnership', 'hire', 'expansion', 'viral']).optional().describe('Filter by type of market move'),
      impact: z.enum(['low', 'medium', 'high']).optional().describe('Filter by impact level'),
      since: z.string().optional().describe('Show moves since this date (YYYY-MM-DD)'),
    },
    async ({ competitor, move_type, impact, since }) => {
      let query = `
        SELECT m.*, c.name as competitor_name
        FROM market_moves m
        JOIN competitors c ON m.competitor_id = c.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (competitor) {
        query += ` AND c.name LIKE ?`;
        params.push(`%${competitor}%`);
      }
      if (move_type) {
        query += ` AND m.move_type = ?`;
        params.push(move_type);
      }
      if (impact) {
        query += ` AND m.impact = ?`;
        params.push(impact);
      }
      if (since) {
        query += ` AND m.move_date >= ?`;
        params.push(since);
      }

      query += ` ORDER BY m.move_date DESC`;

      const moves = db.prepare(query).all(...params) as any[];

      if (moves.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No market moves found matching your criteria.' }] };
      }

      const result = moves.map((m) => ({
        competitor: m.competitor_name,
        type: m.move_type,
        title: m.title,
        description: m.description,
        impact: m.impact,
        date: m.move_date,
        source: m.source_url,
      }));

      // Impact summary
      const highImpact = moves.filter((m: any) => m.impact === 'high').length;
      const mediumImpact = moves.filter((m: any) => m.impact === 'medium').length;

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          moves: result,
          count: result.length,
          impact_summary: { high: highImpact, medium: mediumImpact, low: result.length - highImpact - mediumImpact },
        }, null, 2) }],
      };
    }
  );
}
