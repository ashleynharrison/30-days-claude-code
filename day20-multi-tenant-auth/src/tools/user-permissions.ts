import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerUserPermissions(server: McpServer) {
  server.tool(
    'user_permissions',
    'Check a user\'s role, permissions, and access within an organization. Shows role hierarchy level, granted permissions, MFA status, and compliance flags.',
    {
      email: z.string().optional().describe('User email to look up'),
      user_name: z.string().optional().describe('User name to search (partial match)'),
      org: z.string().optional().describe('Organization name or slug to scope the lookup'),
    },
    async ({ email, user_name, org }) => {
      let userQuery = `SELECT * FROM users WHERE 1=1`;
      const userParams: any[] = [];

      if (email) {
        userQuery += ` AND email = ?`;
        userParams.push(email);
      }
      if (user_name) {
        userQuery += ` AND name LIKE ?`;
        userParams.push(`%${user_name}%`);
      }

      const users = db.prepare(userQuery).all(...userParams) as any[];

      if (users.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No users found matching your criteria.' }] };
      }

      const result = users.map((user) => {
        let memberQuery = `
          SELECT m.*, o.name as org_name, o.slug as org_slug, o.mfa_required, o.status as org_status,
                 r.name as role_name, r.hierarchy_level, r.description as role_description
          FROM memberships m
          JOIN organizations o ON o.id = m.org_id
          JOIN roles r ON r.id = m.role_id
          WHERE m.user_id = ?
        `;
        const memberParams: any[] = [user.id];

        if (org) {
          memberQuery += ` AND (o.name LIKE ? OR o.slug LIKE ?)`;
          memberParams.push(`%${org}%`, `%${org}%`);
        }

        const memberships = db.prepare(memberQuery).all(...memberParams) as any[];

        const orgs = memberships.map((m) => {
          const permissions = db.prepare(`
            SELECT p.resource, p.action, p.description
            FROM role_permissions rp
            JOIN permissions p ON p.id = rp.permission_id
            WHERE rp.role_id = ?
            ORDER BY p.resource, p.action
          `).all(m.role_id) as any[];

          const mfaCompliant = user.mfa_enabled || !m.mfa_required;

          return {
            organization: m.org_name,
            org_slug: m.org_slug,
            org_status: m.org_status,
            role: m.role_name,
            hierarchy_level: m.hierarchy_level,
            role_description: m.role_description,
            permissions: permissions.map((p: any) => `${p.resource}:${p.action}`),
            mfa_compliant: mfaCompliant,
            mfa_warning: !mfaCompliant ? 'User has not enabled MFA but org requires it' : null,
            joined_at: m.joined_at,
            last_active_at: m.last_active_at,
          };
        });

        return {
          name: user.name,
          email: user.email,
          mfa_enabled: !!user.mfa_enabled,
          status: user.status,
          organizations: orgs,
        };
      });

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ users: result, count: result.length }, null, 2) }],
      };
    }
  );
}
