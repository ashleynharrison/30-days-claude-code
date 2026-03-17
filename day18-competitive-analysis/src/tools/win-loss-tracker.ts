import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerWinLossTracker(server: McpServer) {
  server.tool(
    'win_loss_tracker',
    'Review competitive win/loss deals — which competitors you won or lost against, deal sizes, reasons, and patterns.',
    {
      competitor: z.string().optional().describe('Filter by competitor name (partial match)'),
      outcome: z.enum(['win', 'loss']).optional().describe('Filter by deal outcome'),
      industry: z.string().optional().describe('Filter by deal industry (partial match)'),
    },
    async ({ competitor, outcome, industry }) => {
      let query = `
        SELECT w.*, c.name as competitor_name
        FROM win_loss w
        JOIN competitors c ON w.competitor_id = c.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (competitor) {
        query += ` AND c.name LIKE ?`;
        params.push(`%${competitor}%`);
      }
      if (outcome) {
        query += ` AND w.outcome = ?`;
        params.push(outcome);
      }
      if (industry) {
        query += ` AND w.industry LIKE ?`;
        params.push(`%${industry}%`);
      }

      query += ` ORDER BY w.deal_date DESC`;

      const deals = db.prepare(query).all(...params) as any[];

      if (deals.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No win/loss records found matching your criteria.' }] };
      }

      const result = deals.map((d) => ({
        deal: d.deal_name,
        competitor: d.competitor_name,
        outcome: d.outcome,
        deal_size: d.deal_size,
        industry: d.industry,
        reason: d.reason,
        notes: d.notes,
        date: d.deal_date,
      }));

      const wins = deals.filter((d: any) => d.outcome === 'win').length;
      const losses = deals.filter((d: any) => d.outcome === 'loss').length;

      // Top loss reasons
      const lossReasons = deals
        .filter((d: any) => d.outcome === 'loss')
        .map((d: any) => d.reason)
        .filter(Boolean);

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          deals: result,
          summary: {
            total: result.length,
            wins,
            losses,
            win_rate: `${Math.round((wins / result.length) * 100)}%`,
          },
          loss_reasons: lossReasons,
        }, null, 2) }],
      };
    }
  );
}
