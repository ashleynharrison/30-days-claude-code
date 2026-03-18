import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerOrgLookup(server: McpServer) {
  server.tool(
    'org_lookup',
    'Search organizations by name, plan, or status. Returns org details, member count, seat usage, SSO/MFA config, and current health.',
    {
      search: z.string().optional().describe('Search by org name (partial match)'),
      plan: z.string().optional().describe('Filter by plan: starter, business, enterprise'),
      status: z.string().optional().describe('Filter by status: active, suspended'),
    },
    async ({ search, plan, status }) => {
      let query = `SELECT * FROM organizations WHERE 1=1`;
      const params: any[] = [];

      if (search) {
        query += ` AND name LIKE ?`;
        params.push(`%${search}%`);
      }
      if (plan) {
        query += ` AND plan = ?`;
        params.push(plan);
      }
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      query += ` ORDER BY name`;

      const orgs = db.prepare(query).all(...params) as any[];

      if (orgs.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No organizations found matching your criteria.' }] };
      }

      const result = orgs.map((org) => {
        const memberCount = (db.prepare(`SELECT COUNT(*) as c FROM memberships WHERE org_id = ?`).get(org.id) as any).c;
        const activeMembers = (db.prepare(`
          SELECT COUNT(*) as c FROM memberships m
          JOIN users u ON u.id = m.user_id
          WHERE m.org_id = ? AND u.status = 'active'
        `).get(org.id) as any).c;
        const mfaCompliant = (db.prepare(`
          SELECT COUNT(*) as c FROM memberships m
          JOIN users u ON u.id = m.user_id
          WHERE m.org_id = ? AND u.mfa_enabled = 1 AND u.status = 'active'
        `).get(org.id) as any).c;
        const pendingInvites = (db.prepare(`
          SELECT COUNT(*) as c FROM invitations WHERE org_id = ? AND status = 'pending'
        `).get(org.id) as any).c;

        return {
          name: org.name,
          slug: org.slug,
          plan: org.plan,
          domain: org.domain,
          sso_enabled: !!org.sso_enabled,
          mfa_required: !!org.mfa_required,
          seats: { used: memberCount, max: org.max_seats, available: org.max_seats - memberCount },
          active_members: activeMembers,
          mfa_compliance: org.mfa_required ? `${mfaCompliant}/${activeMembers} compliant` : 'not required',
          pending_invites: pendingInvites,
          status: org.status,
          created_at: org.created_at,
        };
      });

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ organizations: result, count: result.length }, null, 2) }],
      };
    }
  );
}
