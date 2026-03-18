import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerAuditLog(server: McpServer) {
  server.tool(
    'audit_log',
    'Query the authentication and access audit log. Filter by organization, user, action type, or date range. Surfaces login attempts, permission changes, and security events.',
    {
      org: z.string().optional().describe('Organization name or slug'),
      user_email: z.string().optional().describe('Filter by user email'),
      action: z.string().optional().describe('Filter by action (e.g. login, login.failed, invite.create, role.change, settings.update)'),
      days: z.number().optional().describe('Show events from the last N days (default: 30)'),
    },
    async ({ org, user_email, action, days = 30 }) => {
      let query = `
        SELECT a.*, o.name as org_name, o.slug as org_slug,
               u.name as user_name, u.email as user_email
        FROM audit_log a
        JOIN organizations o ON o.id = a.org_id
        LEFT JOIN users u ON u.id = a.user_id
        WHERE a.timestamp >= datetime('now', ?)
      `;
      const params: any[] = [`-${days} days`];

      if (org) {
        query += ` AND (o.name LIKE ? OR o.slug LIKE ?)`;
        params.push(`%${org}%`, `%${org}%`);
      }
      if (user_email) {
        query += ` AND u.email = ?`;
        params.push(user_email);
      }
      if (action) {
        query += ` AND a.action LIKE ?`;
        params.push(`%${action}%`);
      }

      query += ` ORDER BY a.timestamp DESC`;

      const events = db.prepare(query).all(...params) as any[];

      if (events.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No audit events found matching your criteria.' }] };
      }

      const result = events.map((e) => ({
        organization: e.org_name,
        user: e.user_name,
        user_email: e.user_email,
        action: e.action,
        resource: e.resource,
        details: e.details,
        ip_address: e.ip_address,
        timestamp: e.timestamp,
      }));

      const actionSummary: Record<string, number> = {};
      for (const e of events) {
        actionSummary[e.action] = (actionSummary[e.action] || 0) + 1;
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          events: result,
          summary: actionSummary,
          count: result.length,
          period: `last ${days} days`,
        }, null, 2) }],
      };
    }
  );
}
