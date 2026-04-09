import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerClientOverview(server: McpServer) {
  server.tool(
    'client_overview',
    'Get a comprehensive overview of a client — active projects, outstanding invoices, recent messages, and activity timeline.',
    {
      client: z.string().describe('Client name or company name to look up'),
    },
    async (params) => {
      const client = db.prepare(`
        SELECT * FROM clients WHERE name LIKE ? OR company LIKE ?
      `).get(`%${params.client}%`, `%${params.client}%`) as Record<string, unknown> | undefined;

      if (!client) {
        return { content: [{ type: 'text' as const, text: `No client found matching "${params.client}".` }] };
      }

      const projects = db.prepare(`
        SELECT id, name, status, start_date, target_date, budget, spent,
               ROUND((spent * 1.0 / NULLIF(budget, 0)) * 100, 1) as budget_used_pct
        FROM projects WHERE client_id = ? ORDER BY start_date DESC
      `).all(client.id) as Array<Record<string, unknown>>;

      const invoices = db.prepare(`
        SELECT invoice_number, amount, status, due_date, paid_date, description
        FROM invoices WHERE client_id = ? ORDER BY issued_date DESC LIMIT 5
      `).all(client.id) as Array<Record<string, unknown>>;

      const unreadMessages = db.prepare(`
        SELECT COUNT(*) as count FROM messages WHERE client_id = ? AND read = 0 AND sender != 'Tell a Vsn'
      `).get(client.id) as { count: number };

      const recentActivity = db.prepare(`
        SELECT action, details, actor, created_at
        FROM activity_log WHERE client_id = ? ORDER BY created_at DESC LIMIT 8
      `).all(client.id) as Array<Record<string, unknown>>;

      const totalRevenue = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE client_id = ? AND status = 'paid'
      `).get(client.id) as { total: number };

      const outstanding = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE client_id = ? AND status = 'sent'
      `).get(client.id) as { total: number };

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            client,
            financials: {
              total_revenue: totalRevenue.total,
              outstanding_invoices: outstanding.total,
            },
            projects,
            recent_invoices: invoices,
            unread_messages: unreadMessages.count,
            recent_activity: recentActivity,
          }, null, 2),
        }],
      };
    },
  );
}
