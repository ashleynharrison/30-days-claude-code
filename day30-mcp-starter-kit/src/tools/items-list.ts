// Pattern: Filtered list. Takes optional filters, builds the WHERE clause
// dynamically, returns both the rows and the aggregate counts. Overdue is
// computed, not stored — that's the rule.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerItemsList(server: McpServer) {
  server.tool(
    'items_list',
    'List items (a contact\'s open work) with optional filters — status, priority, category, assignee, overdue-only. Computes age and overdue flags on the fly.',
    {
      status: z.enum(['open', 'in_progress', 'closed']).optional(),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
      category: z.string().optional(),
      assignee: z.string().optional(),
      overdue_only: z.boolean().optional(),
      limit: z.number().int().min(1).max(500).optional(),
    },
    async ({ status, priority, category, assignee, overdue_only, limit }) => {
      const where: string[] = [];
      const args: unknown[] = [];

      if (status)    { where.push('i.status = ?');    args.push(status); }
      if (priority)  { where.push('i.priority = ?');  args.push(priority); }
      if (category)  { where.push('i.category = ?');  args.push(category); }
      if (assignee)  { where.push('i.assignee = ?');  args.push(assignee); }
      if (overdue_only) {
        where.push(`i.due_date IS NOT NULL AND i.due_date < date('now') AND i.status != 'closed'`);
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const rows = db.prepare(`
        SELECT i.id, i.title, i.category, i.status, i.priority, i.due_date, i.assignee,
               c.id AS contact_id, c.name AS contact_name, c.company,
               CAST(julianday('now') - julianday(i.created_at) AS INTEGER) AS age_days,
               CASE WHEN i.due_date IS NOT NULL AND i.due_date < date('now') AND i.status != 'closed'
                    THEN 1 ELSE 0 END AS is_overdue
        FROM items i JOIN contacts c ON c.id = i.contact_id
        ${whereSql}
        ORDER BY is_overdue DESC,
                 CASE i.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END,
                 i.due_date
        LIMIT ?
      `).all(...args, limit ?? 100) as Array<Record<string, unknown>>;

      const summary = {
        total: rows.length,
        overdue: rows.filter((r) => r.is_overdue === 1).length,
        by_status: {
          open:        rows.filter((r) => r.status === 'open').length,
          in_progress: rows.filter((r) => r.status === 'in_progress').length,
          closed:      rows.filter((r) => r.status === 'closed').length,
        },
        by_priority: {
          urgent: rows.filter((r) => r.priority === 'urgent').length,
          high:   rows.filter((r) => r.priority === 'high').length,
          normal: rows.filter((r) => r.priority === 'normal').length,
          low:    rows.filter((r) => r.priority === 'low').length,
        },
      };

      return { content: [{ type: 'text' as const, text: JSON.stringify({ summary, items: rows }, null, 2) }] };
    },
  );
}
