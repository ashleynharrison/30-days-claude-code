// Pattern: Smart lookup. Match on name / email / phone / id with fuzzy LIKE.
// Returns the contact plus their items, recent transactions, and activity —
// a "give me everything about X" view. Every MCP in the series has this tool.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerContactLookup(server: McpServer) {
  server.tool(
    'contact_lookup',
    'Full view of one contact — profile, open items, recent transactions, lifetime value, and activity log. Matches on name, email, phone, or id.',
    {
      query: z.string().describe('Contact name, email, phone, or id'),
    },
    async ({ query }) => {
      const like = `%${query}%`;
      const contact = db.prepare(`
        SELECT * FROM contacts
        WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR CAST(id AS TEXT) = ?
        ORDER BY created_at DESC LIMIT 1
      `).get(like, like, like, query) as Record<string, unknown> | undefined;

      if (!contact) {
        return { content: [{ type: 'text' as const, text: `No contact found matching "${query}".` }] };
      }

      const items = db.prepare(`
        SELECT id, title, category, status, priority, due_date, assignee,
               CAST(julianday('now') - julianday(created_at) AS INTEGER) AS age_days,
               CASE WHEN due_date IS NOT NULL AND due_date < date('now') AND status != 'closed'
                    THEN 1 ELSE 0 END AS is_overdue
        FROM items WHERE contact_id = ? ORDER BY status, priority DESC, due_date
      `).all(contact.id) as Array<Record<string, unknown>>;

      const transactions = db.prepare(`
        SELECT id, item_id, kind, amount, status, occurred_at, notes
        FROM transactions WHERE contact_id = ? ORDER BY occurred_at DESC LIMIT 20
      `).all(contact.id) as Array<Record<string, unknown>>;

      const lifetime = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) AS lifetime_value
        FROM transactions WHERE contact_id = ? AND status = 'completed'
      `).get(contact.id) as { lifetime_value: number };

      const recentActivity = db.prepare(`
        SELECT action, details, actor, created_at
        FROM activity WHERE contact_id = ? ORDER BY created_at DESC LIMIT 10
      `).all(contact.id) as Array<Record<string, unknown>>;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            contact,
            lifetime_value: lifetime.lifetime_value,
            open_items: items.filter((i) => i.status !== 'closed').length,
            overdue_items: items.filter((i) => i.is_overdue === 1).length,
            items,
            transactions,
            recent_activity: recentActivity,
          }, null, 2),
        }],
      };
    },
  );
}
