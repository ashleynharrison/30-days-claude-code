import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerDecisionLog(server: McpServer) {
  server.tool(
    'decision_log',
    'Browse the decision log across all meetings — search by keyword, filter by impact level, and see context and rationale for each decision.',
    {
      query: z.string().optional().describe('Search term to match against decision text or context'),
      impact: z.string().optional().describe('Filter by impact: critical, high, medium, low'),
      after: z.string().optional().describe('Only decisions from meetings after this date'),
    },
    async (params) => {
      let sql = `
        SELECT d.id, d.description, d.context, d.decided_by, d.impact,
               m.title as meeting_title, m.date as meeting_date, m.meeting_type
        FROM decisions d
        JOIN meetings m ON d.meeting_id = m.id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.query) {
        sql += ' AND (d.description LIKE ? OR d.context LIKE ?)';
        const q = `%${params.query}%`;
        args.push(q, q);
      }
      if (params.impact) {
        sql += ' AND d.impact = ?';
        args.push(params.impact);
      }
      if (params.after) {
        sql += ' AND m.date >= ?';
        args.push(params.after);
      }

      sql += ' ORDER BY m.date DESC';

      const decisions = db.prepare(sql).all(...args) as Array<{
        id: number; description: string; context: string | null;
        decided_by: string | null; impact: string;
        meeting_title: string; meeting_date: string; meeting_type: string;
      }>;

      const byImpact = {
        critical: decisions.filter(d => d.impact === 'critical').length,
        high: decisions.filter(d => d.impact === 'high').length,
        medium: decisions.filter(d => d.impact === 'medium').length,
        low: decisions.filter(d => d.impact === 'low').length,
      };

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ count: decisions.length, by_impact: byImpact, decisions }, null, 2),
        }],
      };
    },
  );
}
