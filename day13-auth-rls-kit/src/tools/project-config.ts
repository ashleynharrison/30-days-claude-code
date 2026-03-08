import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerProjectConfig(server: McpServer) {
  server.tool(
    'project_config',
    'View project auth configuration — providers, MFA status, session lifetimes, and role hierarchy',
    {
      project_name: z.string().optional().describe('Filter by project name (partial match)'),
    },
    async ({ project_name }) => {
      let query = `SELECT * FROM projects WHERE 1=1`;
      const params: any[] = [];

      if (project_name) {
        query += ` AND name LIKE ?`;
        params.push(`%${project_name}%`);
      }

      const projects = db.prepare(query).all(...params) as any[];

      if (projects.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No projects found.' }] };
      }

      const result = projects.map((p) => {
        const roles = db.prepare(
          `SELECT r.*, COUNT(rp.id) as permission_count
           FROM roles r LEFT JOIN role_permissions rp ON rp.role_id = r.id
           WHERE r.project_id = ? GROUP BY r.id ORDER BY r.priority DESC`
        ).all(p.id) as any[];

        const userCount = db.prepare(
          `SELECT COUNT(*) as count FROM users WHERE project_id = ? AND status = 'active'`
        ).get(p.id) as any;

        const rlsCount = db.prepare(
          `SELECT COUNT(*) as count FROM rls_policies WHERE project_id = ? AND enabled = 1`
        ).get(p.id) as any;

        return {
          project: p.name,
          description: p.description,
          auth: {
            provider: p.auth_provider,
            mfa_enabled: !!p.mfa_enabled,
            session_lifetime_hours: p.session_lifetime_hours,
          },
          roles: roles.map((r) => ({
            name: r.name,
            description: r.description,
            is_default: !!r.is_default,
            priority: r.priority,
            permissions_count: r.permission_count,
          })),
          active_users: userCount.count,
          active_rls_policies: rlsCount.count,
        };
      });

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ projects: result }, null, 2) }],
      };
    }
  );
}
