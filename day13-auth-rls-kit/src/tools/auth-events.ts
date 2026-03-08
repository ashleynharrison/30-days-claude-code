import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerAuthEvents(server: McpServer) {
  server.tool(
    'auth_events',
    'View authentication event logs — sign-ins, failures, role changes, MFA events, and suspicious activity',
    {
      project_name: z.string().describe('Project name (partial match)'),
      event_type: z.string().optional().describe('Filter by event type (sign_in, sign_in_failed, role_changed, password_reset, etc.)'),
      email: z.string().optional().describe('Filter by user email'),
      limit: z.number().optional().describe('Number of events to return (default: 20)'),
    },
    async ({ project_name, event_type, email, limit }) => {
      const project = db.prepare(`SELECT * FROM projects WHERE name LIKE ?`).get(`%${project_name}%`) as any;
      if (!project) {
        return { content: [{ type: 'text' as const, text: `No project found matching "${project_name}".` }] };
      }

      const maxResults = limit || 20;

      let query = `
        SELECT ae.*, u.email, u.display_name
        FROM auth_events ae
        LEFT JOIN users u ON u.id = ae.user_id
        WHERE ae.project_id = ?
      `;
      const params: any[] = [project.id];

      if (event_type) {
        query += ` AND ae.event_type = ?`;
        params.push(event_type);
      }
      if (email) {
        query += ` AND u.email LIKE ?`;
        params.push(`%${email}%`);
      }

      query += ` ORDER BY ae.created_at DESC LIMIT ?`;
      params.push(maxResults);

      const events = db.prepare(query).all(...params) as any[];

      // Stats
      const allEvents = db.prepare(
        `SELECT event_type, COUNT(*) as count FROM auth_events WHERE project_id = ? GROUP BY event_type`
      ).all(project.id) as any[];

      const stats: Record<string, number> = {};
      for (const e of allEvents) stats[e.event_type] = e.count;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            project: project.name,
            event_stats: stats,
            events: events.map((e) => ({
              type: e.event_type,
              user: e.email || '(anonymous)',
              display_name: e.display_name,
              ip_address: e.ip_address,
              user_agent: e.user_agent,
              metadata: e.metadata ? JSON.parse(e.metadata) : null,
              timestamp: e.created_at,
            })),
          }, null, 2),
        }],
      };
    }
  );
}
