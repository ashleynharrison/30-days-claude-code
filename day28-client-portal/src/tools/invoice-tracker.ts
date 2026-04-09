import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerInvoiceTracker(server: McpServer) {
  server.tool(
    'invoice_tracker',
    'Track invoices across all clients — filter by status, find overdue payments, and see revenue summaries.',
    {
      status: z.string().optional().describe('Filter by status: draft, sent, paid, overdue'),
      client: z.string().optional().describe('Filter by client name or company'),
      include_summary: z.boolean().optional().describe('Include aggregate revenue summary (default: true)'),
    },
    async (params) => {
      let sql = `
        SELECT i.*, c.name as client_name, c.company, p.name as project_name
        FROM invoices i
        JOIN clients c ON i.client_id = c.id
        LEFT JOIN projects p ON i.project_id = p.id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.status === 'overdue') {
        sql += " AND i.status = 'sent' AND i.due_date < date('now')";
      } else if (params.status) {
        sql += ' AND i.status = ?';
        args.push(params.status);
      }

      if (params.client) {
        sql += ' AND (c.name LIKE ? OR c.company LIKE ?)';
        args.push(`%${params.client}%`, `%${params.client}%`);
      }

      sql += ' ORDER BY i.issued_date DESC';

      const invoices = db.prepare(sql).all(...args) as Array<Record<string, unknown>>;

      const result: Record<string, unknown> = {
        count: invoices.length,
        invoices,
      };

      if (params.include_summary !== false) {
        const summary = {
          total_revenue: db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid'").get() as { total: number },
          outstanding: db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'sent'").get() as { total: number },
          overdue: db.prepare("SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM invoices WHERE status = 'sent' AND due_date < date('now')").get() as { total: number; count: number },
        };
        result.summary = {
          total_paid: summary.total_revenue.total,
          total_outstanding: summary.outstanding.total,
          overdue_amount: summary.overdue.total,
          overdue_count: summary.overdue.count,
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
