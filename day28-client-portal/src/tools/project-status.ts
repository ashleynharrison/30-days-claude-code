import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerProjectStatus(server: McpServer) {
  server.tool(
    'project_status',
    'Get detailed status of a specific project — deliverables, timeline, budget, and approval progress.',
    {
      project: z.string().describe('Project name or keyword to search for'),
      client: z.string().optional().describe('Optionally filter by client name'),
    },
    async (params) => {
      let sql = `
        SELECT p.*, c.name as client_name, c.company
        FROM projects p JOIN clients c ON p.client_id = c.id
        WHERE p.name LIKE ?
      `;
      const args: unknown[] = [`%${params.project}%`];

      if (params.client) {
        sql += ' AND (c.name LIKE ? OR c.company LIKE ?)';
        args.push(`%${params.client}%`, `%${params.client}%`);
      }

      const projects = db.prepare(sql).all(...args) as Array<Record<string, unknown>>;

      if (projects.length === 0) {
        return { content: [{ type: 'text' as const, text: `No project found matching "${params.project}".` }] };
      }

      const results = projects.map(p => {
        const deliverables = db.prepare(`
          SELECT title, description, status, due_date, completed_date, approval_status, approved_by, approved_at
          FROM deliverables WHERE project_id = ? ORDER BY due_date ASC
        `).all(p.id) as Array<Record<string, unknown>>;

        const completedCount = deliverables.filter(d => d.status === 'completed').length;
        const totalCount = deliverables.length;

        const invoiced = db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE project_id = ? AND status IN ('paid', 'sent')
        `).get(p.id) as { total: number };

        const paid = db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE project_id = ? AND status = 'paid'
        `).get(p.id) as { total: number };

        return {
          project: {
            name: p.name,
            client: p.client_name,
            company: p.company,
            status: p.status,
            start_date: p.start_date,
            target_date: p.target_date,
            completed_date: p.completed_date,
            budget: p.budget,
            spent: p.spent,
            budget_used_pct: p.budget ? Math.round(((p.spent as number) / (p.budget as number)) * 1000) / 10 : null,
          },
          deliverables: {
            completed: completedCount,
            total: totalCount,
            progress_pct: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
            items: deliverables,
          },
          billing: {
            total_invoiced: invoiced.total,
            total_paid: paid.total,
            outstanding: invoiced.total - paid.total,
          },
        };
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(results.length === 1 ? results[0] : { count: results.length, projects: results }, null, 2),
        }],
      };
    },
  );
}
