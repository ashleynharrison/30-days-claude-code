// Pattern: Activity log query. Every business wants to ask "what happened
// last week?" — this is that tool. Filter by contact, by action type, by
// window.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerActivityLog(server: McpServer) {
  server.tool(
    'activity_log',
    'Query the audit/activity log. Filter by contact, action, or time window. Answers "what happened and who did it?"',
    {
      contact: z.string().optional().describe('Contact name, email, or id'),
      action: z.string().optional().describe('Exact action string, e.g. contact_created'),
      since_days: z.number().int().min(1).max(365).optional(),
      limit: z.number().int().min(1).max(500).optional(),
    },
    async ({ contact, action, since_days, limit }) => {
      const where: string[] = [];
      const args: unknown[] = [];

      if (contact) {
        const like = `%${contact}%`;
        const row = db.prepare(`
          SELECT id FROM contacts
          WHERE name LIKE ? OR email LIKE ? OR CAST(id AS TEXT) = ?
          LIMIT 1
        `).get(like, like, contact) as { id: number } | undefined;
        if (!row) {
          return { content: [{ type: 'text' as const, text: `No contact found matching "${contact}".` }] };
        }
        where.push('a.contact_id = ?');
        args.push(row.id);
      }

      if (action) { where.push('a.action = ?'); args.push(action); }
      if (since_days) { where.push(`a.created_at >= datetime('now', ?)`); args.push(`-${since_days} days`); }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const rows = db.prepare(`
        SELECT a.id, a.action, a.details, a.actor, a.created_at,
               c.id AS contact_id, c.name AS contact_name,
               i.id AS item_id, i.title AS item_title
        FROM activity a
        LEFT JOIN contacts c ON c.id = a.contact_id
        LEFT JOIN items i    ON i.id = a.item_id
        ${whereSql}
        ORDER BY a.created_at DESC
        LIMIT ?
      `).all(...args, limit ?? 50) as Array<Record<string, unknown>>;

      const byAction: Record<string, number> = {};
      for (const r of rows) byAction[r.action as string] = (byAction[r.action as string] ?? 0) + 1;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            total: rows.length,
            by_action: byAction,
            entries: rows,
          }, null, 2),
        }],
      };
    },
  );
}
