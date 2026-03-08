import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerUserAccess(server: McpServer) {
  server.tool(
    'user_access',
    'Look up a user\'s effective permissions, role, MFA status, and recent auth activity',
    {
      email: z.string().optional().describe('User email (partial match)'),
      project_name: z.string().optional().describe('Filter by project'),
      status: z.string().optional().describe('Filter by status (active, suspended, invited)'),
    },
    async ({ email, project_name, status }) => {
      let query = `
        SELECT u.*, r.name AS role_name, r.description AS role_desc, r.priority,
               p.name AS project_name, p.mfa_enabled AS project_mfa
        FROM users u
        JOIN roles r ON r.id = u.role_id
        JOIN projects p ON p.id = u.project_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (email) {
        query += ` AND u.email LIKE ?`;
        params.push(`%${email}%`);
      }
      if (project_name) {
        query += ` AND p.name LIKE ?`;
        params.push(`%${project_name}%`);
      }
      if (status) {
        query += ` AND u.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY p.name, r.priority DESC`;

      const users = db.prepare(query).all(...params) as any[];

      if (users.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No users found matching your criteria.' }] };
      }

      const result = users.map((u) => {
        // Get permissions for this user's role
        const perms = db.prepare(`
          SELECT p.resource, p.action, rp.conditions
          FROM role_permissions rp
          JOIN permissions p ON p.id = rp.permission_id
          WHERE rp.role_id = ?
          ORDER BY p.resource, p.action
        `).all(u.role_id) as any[];

        // Recent events
        const events = db.prepare(`
          SELECT event_type, ip_address, created_at, metadata
          FROM auth_events
          WHERE user_id = ?
          ORDER BY created_at DESC LIMIT 5
        `).all(u.id) as any[];

        // MFA compliance
        const mfaCompliant = !u.project_mfa || u.mfa_enrolled;

        return {
          email: u.email,
          display_name: u.display_name,
          project: u.project_name,
          role: u.role_name,
          role_description: u.role_desc,
          status: u.status,
          mfa: {
            enrolled: !!u.mfa_enrolled,
            required: !!u.project_mfa,
            compliant: mfaCompliant,
          },
          last_sign_in: u.last_sign_in,
          permissions: perms.map((p) => ({
            resource: p.resource,
            action: p.action,
            conditions: p.conditions ? JSON.parse(p.conditions) : null,
          })),
          recent_events: events.map((e) => ({
            type: e.event_type,
            ip: e.ip_address,
            at: e.created_at,
            metadata: e.metadata ? JSON.parse(e.metadata) : null,
          })),
        };
      });

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ users: result }, null, 2) }],
      };
    }
  );
}
