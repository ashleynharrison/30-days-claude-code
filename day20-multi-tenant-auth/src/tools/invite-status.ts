import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerInviteStatus(server: McpServer) {
  server.tool(
    'invite_status',
    'Track invitation status across organizations. Filter by org, status (pending/accepted/expired/revoked), or invitee email. Shows who invited whom and when.',
    {
      org: z.string().optional().describe('Organization name or slug'),
      status: z.string().optional().describe('Filter by status: pending, accepted, expired, revoked'),
      email: z.string().optional().describe('Filter by invitee email'),
    },
    async ({ org, status, email }) => {
      let query = `
        SELECT i.*, o.name as org_name, o.slug as org_slug,
               r.name as role_name, u.name as invited_by_name, u.email as invited_by_email
        FROM invitations i
        JOIN organizations o ON o.id = i.org_id
        JOIN roles r ON r.id = i.role_id
        JOIN users u ON u.id = i.invited_by
        WHERE 1=1
      `;
      const params: any[] = [];

      if (org) {
        query += ` AND (o.name LIKE ? OR o.slug LIKE ?)`;
        params.push(`%${org}%`, `%${org}%`);
      }
      if (status) {
        query += ` AND i.status = ?`;
        params.push(status);
      }
      if (email) {
        query += ` AND i.email LIKE ?`;
        params.push(`%${email}%`);
      }

      query += ` ORDER BY i.created_at DESC`;

      const invites = db.prepare(query).all(...params) as any[];

      if (invites.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No invitations found matching your criteria.' }] };
      }

      const result = invites.map((inv) => ({
        organization: inv.org_name,
        invitee_email: inv.email,
        role: inv.role_name,
        status: inv.status,
        invited_by: inv.invited_by_name,
        invited_by_email: inv.invited_by_email,
        created_at: inv.created_at,
        expires_at: inv.expires_at,
        accepted_at: inv.accepted_at,
      }));

      const summary = {
        pending: invites.filter((i: any) => i.status === 'pending').length,
        accepted: invites.filter((i: any) => i.status === 'accepted').length,
        expired: invites.filter((i: any) => i.status === 'expired').length,
        revoked: invites.filter((i: any) => i.status === 'revoked').length,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ invitations: result, summary, count: result.length }, null, 2) }],
      };
    }
  );
}
