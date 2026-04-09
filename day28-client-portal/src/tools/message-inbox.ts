import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerMessageInbox(server: McpServer) {
  server.tool(
    'message_inbox',
    'View client messages — unread threads, conversation history, and pending responses across all projects.',
    {
      client: z.string().optional().describe('Filter by client name or company'),
      unread_only: z.boolean().optional().describe('Only show unread messages (default: false)'),
      project: z.string().optional().describe('Filter by project name'),
    },
    async (params) => {
      let sql = `
        SELECT m.*, c.name as client_name, c.company, p.name as project_name
        FROM messages m
        JOIN clients c ON m.client_id = c.id
        LEFT JOIN projects p ON m.project_id = p.id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.client) {
        sql += ' AND (c.name LIKE ? OR c.company LIKE ?)';
        args.push(`%${params.client}%`, `%${params.client}%`);
      }
      if (params.unread_only) {
        sql += ' AND m.read = 0';
      }
      if (params.project) {
        sql += ' AND p.name LIKE ?';
        args.push(`%${params.project}%`);
      }

      sql += ' ORDER BY m.created_at DESC';

      const messages = db.prepare(sql).all(...args) as Array<Record<string, unknown>>;

      const unreadCount = db.prepare(
        "SELECT COUNT(*) as count FROM messages WHERE read = 0 AND sender != 'Tell a Vsn'"
      ).get() as { count: number };

      const pendingResponses = db.prepare(`
        SELECT m.*, c.name as client_name, c.company, p.name as project_name
        FROM messages m
        JOIN clients c ON m.client_id = c.id
        LEFT JOIN projects p ON m.project_id = p.id
        WHERE m.sender != 'Tell a Vsn'
        AND m.id NOT IN (
          SELECT m2.id FROM messages m2
          WHERE m2.client_id = m.client_id AND m2.project_id = m.project_id
          AND m2.sender = 'Tell a Vsn' AND m2.created_at > m.created_at
        )
        AND m.read = 0
        ORDER BY m.created_at ASC
      `).all() as Array<Record<string, unknown>>;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            unread_total: unreadCount.count,
            pending_responses: pendingResponses.length,
            needs_reply: pendingResponses,
            messages,
          }, null, 2),
        }],
      };
    },
  );
}
