import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerPipelineSummary(server: McpServer) {
  server.tool(
    'pipeline_summary',
    'High-level business dashboard — active clients, total pipeline value, revenue metrics, project health, and at-risk items.',
    {
      include_at_risk: z.boolean().optional().describe('Include at-risk items: overdue deliverables, unpaid invoices, paused projects (default: true)'),
    },
    async (params) => {
      const clientCounts = db.prepare(`
        SELECT status, COUNT(*) as count FROM clients GROUP BY status
      `).all() as Array<{ status: string; count: number }>;

      const projectCounts = db.prepare(`
        SELECT status, COUNT(*) as count FROM projects GROUP BY status
      `).all() as Array<{ status: string; count: number }>;

      const totalBudget = db.prepare(`
        SELECT COALESCE(SUM(budget), 0) as total FROM projects WHERE status IN ('in_progress', 'planning')
      `).get() as { total: number };

      const totalSpent = db.prepare(`
        SELECT COALESCE(SUM(spent), 0) as total FROM projects WHERE status IN ('in_progress', 'planning')
      `).get() as { total: number };

      const revenue = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid'
      `).get() as { total: number };

      const outstanding = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM invoices WHERE status = 'sent'
      `).get() as { total: number; count: number };

      const result: Record<string, unknown> = {
        clients: Object.fromEntries(clientCounts.map(c => [c.status, c.count])),
        projects: Object.fromEntries(projectCounts.map(p => [p.status, p.count])),
        financials: {
          active_pipeline_budget: totalBudget.total,
          active_pipeline_spent: totalSpent.total,
          total_revenue_collected: revenue.total,
          outstanding_invoices: outstanding.total,
          outstanding_count: outstanding.count,
        },
      };

      if (params.include_at_risk !== false) {
        const overdueDeliverables = db.prepare(`
          SELECT d.title, d.due_date, p.name as project_name, c.name as client_name
          FROM deliverables d
          JOIN projects p ON d.project_id = p.id
          JOIN clients c ON p.client_id = c.id
          WHERE d.status != 'completed' AND d.due_date < date('now') AND d.due_date IS NOT NULL
          ORDER BY d.due_date ASC
        `).all() as Array<Record<string, unknown>>;

        const overdueInvoices = db.prepare(`
          SELECT i.invoice_number, i.amount, i.due_date, c.name as client_name, c.company
          FROM invoices i
          JOIN clients c ON i.client_id = c.id
          WHERE i.status = 'sent' AND i.due_date < date('now')
          ORDER BY i.due_date ASC
        `).all() as Array<Record<string, unknown>>;

        const pausedProjects = db.prepare(`
          SELECT p.name, p.budget, p.spent, c.name as client_name, c.company
          FROM projects p
          JOIN clients c ON p.client_id = c.id
          WHERE p.status = 'paused'
        `).all() as Array<Record<string, unknown>>;

        const unreadMessages = db.prepare(`
          SELECT COUNT(*) as count FROM messages WHERE read = 0 AND sender != 'Tell a Vsn'
        `).get() as { count: number };

        result.at_risk = {
          overdue_deliverables: overdueDeliverables,
          overdue_invoices: overdueInvoices,
          paused_projects: pausedProjects,
          unread_client_messages: unreadMessages.count,
        };
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    },
  );
}
