import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerDeliverableApprovals(server: McpServer) {
  server.tool(
    'deliverable_approvals',
    'Track deliverable approval status across all projects — find items awaiting review, overdue deliverables, and approval history.',
    {
      status: z.string().optional().describe('Filter deliverables: pending, in_progress, completed, or approval status: in_review, approved'),
      client: z.string().optional().describe('Filter by client name or company'),
      overdue: z.boolean().optional().describe('Only show overdue deliverables (past due_date and not completed)'),
    },
    async (params) => {
      let sql = `
        SELECT d.*, p.name as project_name, c.name as client_name, c.company
        FROM deliverables d
        JOIN projects p ON d.project_id = p.id
        JOIN clients c ON p.client_id = c.id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.overdue) {
        sql += " AND d.status != 'completed' AND d.due_date < date('now') AND d.due_date IS NOT NULL";
      } else if (params.status) {
        if (['in_review', 'approved'].includes(params.status)) {
          sql += ' AND d.approval_status = ?';
        } else {
          sql += ' AND d.status = ?';
        }
        args.push(params.status);
      }

      if (params.client) {
        sql += ' AND (c.name LIKE ? OR c.company LIKE ?)';
        args.push(`%${params.client}%`, `%${params.client}%`);
      }

      sql += ' ORDER BY d.due_date ASC';

      const deliverables = db.prepare(sql).all(...args) as Array<Record<string, unknown>>;

      const summary = {
        total: deliverables.length,
        by_status: {} as Record<string, number>,
        by_approval: {} as Record<string, number>,
      };

      for (const d of deliverables) {
        const status = d.status as string;
        const approval = d.approval_status as string;
        summary.by_status[status] = (summary.by_status[status] || 0) + 1;
        summary.by_approval[approval] = (summary.by_approval[approval] || 0) + 1;
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ summary, deliverables }, null, 2),
        }],
      };
    },
  );
}
