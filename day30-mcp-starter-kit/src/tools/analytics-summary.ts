// Pattern: Analytics rollup. One SQL block that returns the "what's happening
// in the business" answer. Every MCP needs a tool like this — it's the one
// you'll actually ask most often.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerAnalyticsSummary(server: McpServer) {
  server.tool(
    'analytics_summary',
    'Business-wide rollup — active contacts, open items, overdue count, revenue (completed / pending), top contacts by lifetime value, and recent activity volume.',
    {
      window_days: z.number().int().min(1).max(365).optional().describe('Trailing window for revenue + activity (default 30)'),
    },
    async ({ window_days }) => {
      const w = window_days ?? 30;

      const contactCounts = db.prepare(`
        SELECT status, COUNT(*) AS n FROM contacts GROUP BY status
      `).all() as Array<{ status: string; n: number }>;

      const itemCounts = db.prepare(`
        SELECT status, COUNT(*) AS n FROM items GROUP BY status
      `).all() as Array<{ status: string; n: number }>;

      const overdue = db.prepare(`
        SELECT COUNT(*) AS n FROM items
        WHERE due_date IS NOT NULL AND due_date < date('now') AND status != 'closed'
      `).get() as { n: number };

      const revenue = db.prepare(`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) AS completed,
          COALESCE(SUM(CASE WHEN status = 'pending'   THEN amount ELSE 0 END), 0) AS pending,
          COALESCE(SUM(CASE WHEN status = 'completed' AND occurred_at >= date('now', ?) THEN amount ELSE 0 END), 0) AS in_window
        FROM transactions
      `).get(`-${w} days`) as { completed: number; pending: number; in_window: number };

      const topContacts = db.prepare(`
        SELECT c.id, c.name, c.company,
               COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount ELSE 0 END), 0) AS lifetime_value,
               COUNT(DISTINCT t.id) AS transaction_count
        FROM contacts c LEFT JOIN transactions t ON t.contact_id = c.id
        GROUP BY c.id
        ORDER BY lifetime_value DESC
        LIMIT 5
      `).all() as Array<Record<string, unknown>>;

      const activityVolume = db.prepare(`
        SELECT COUNT(*) AS n FROM activity WHERE created_at >= datetime('now', ?)
      `).get(`-${w} days`) as { n: number };

      const asMap = (rows: Array<{ status: string; n: number }>) =>
        Object.fromEntries(rows.map((r) => [r.status, r.n]));

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            window_days: w,
            contacts: asMap(contactCounts),
            items: { ...asMap(itemCounts), overdue: overdue.n },
            revenue,
            top_contacts_by_ltv: topContacts,
            activity_volume_in_window: activityVolume.n,
          }, null, 2),
        }],
      };
    },
  );
}
