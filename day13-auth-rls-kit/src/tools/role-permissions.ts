import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerRolePermissions(server: McpServer) {
  server.tool(
    'role_permissions',
    'View the complete role-permission matrix for a project — which roles can do what, with conditions',
    {
      project_name: z.string().describe('Project name (partial match)'),
      role_name: z.string().optional().describe('Filter by specific role'),
      resource: z.string().optional().describe('Filter by resource (e.g. tasks, patients, products)'),
    },
    async ({ project_name, role_name, resource }) => {
      const project = db.prepare(`SELECT * FROM projects WHERE name LIKE ?`).get(`%${project_name}%`) as any;
      if (!project) {
        return { content: [{ type: 'text' as const, text: `No project found matching "${project_name}".` }] };
      }

      let roleQuery = `SELECT * FROM roles WHERE project_id = ?`;
      const roleParams: any[] = [project.id];
      if (role_name) {
        roleQuery += ` AND name = ?`;
        roleParams.push(role_name);
      }
      roleQuery += ` ORDER BY priority DESC`;

      const roles = db.prepare(roleQuery).all(...roleParams) as any[];

      const matrix = roles.map((role) => {
        let permQuery = `
          SELECT p.resource, p.action, p.description, rp.conditions
          FROM role_permissions rp
          JOIN permissions p ON p.id = rp.permission_id
          WHERE rp.role_id = ?
        `;
        const permParams: any[] = [role.id];

        if (resource) {
          permQuery += ` AND p.resource = ?`;
          permParams.push(resource);
        }

        permQuery += ` ORDER BY p.resource, p.action`;

        const perms = db.prepare(permQuery).all(...permParams) as any[];

        // Group by resource
        const grouped: Record<string, any[]> = {};
        for (const perm of perms) {
          if (!grouped[perm.resource]) grouped[perm.resource] = [];
          grouped[perm.resource].push({
            action: perm.action,
            description: perm.description,
            conditions: perm.conditions ? JSON.parse(perm.conditions) : null,
          });
        }

        return {
          role: role.name,
          description: role.description,
          is_default: !!role.is_default,
          priority: role.priority,
          permissions_by_resource: grouped,
          total_permissions: perms.length,
        };
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ project: project.name, roles: matrix }, null, 2),
        }],
      };
    }
  );
}
