import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerRoleHierarchy(server: McpServer) {
  server.tool(
    'role_hierarchy',
    'View the role hierarchy and permissions matrix for an organization. Shows each role\'s level, permissions, and member count.',
    {
      org: z.string().describe('Organization name or slug'),
    },
    async ({ org }) => {
      const orgRow = db.prepare(`
        SELECT * FROM organizations WHERE name LIKE ? OR slug LIKE ?
      `).get(`%${org}%`, `%${org}%`) as any;

      if (!orgRow) {
        return { content: [{ type: 'text' as const, text: `Organization "${org}" not found.` }] };
      }

      const roles = db.prepare(`
        SELECT * FROM roles WHERE org_id = ? ORDER BY hierarchy_level DESC
      `).all(orgRow.id) as any[];

      const result = roles.map((role) => {
        const permissions = db.prepare(`
          SELECT p.resource, p.action
          FROM role_permissions rp
          JOIN permissions p ON p.id = rp.permission_id
          WHERE rp.role_id = ?
          ORDER BY p.resource, p.action
        `).all(role.id) as any[];

        const memberCount = (db.prepare(`
          SELECT COUNT(*) as c FROM memberships WHERE role_id = ? AND org_id = ?
        `).get(role.id, orgRow.id) as any).c;

        const members = db.prepare(`
          SELECT u.name, u.email
          FROM memberships m
          JOIN users u ON u.id = m.user_id
          WHERE m.role_id = ? AND m.org_id = ?
        `).all(role.id, orgRow.id) as any[];

        return {
          role: role.name,
          hierarchy_level: role.hierarchy_level,
          description: role.description,
          is_default: !!role.is_default,
          permissions: permissions.map((p: any) => `${p.resource}:${p.action}`),
          permission_count: permissions.length,
          members: memberCount,
          member_list: members,
        };
      });

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          organization: orgRow.name,
          plan: orgRow.plan,
          roles: result,
          total_roles: result.length,
        }, null, 2) }],
      };
    }
  );
}
