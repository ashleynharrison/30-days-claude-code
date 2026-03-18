import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerTenantHealth(server: McpServer) {
  server.tool(
    'tenant_health',
    'Get health metrics for an organization — active users, MFA adoption, seat usage, login frequency, pending invites, and security compliance score.',
    {
      org: z.string().optional().describe('Organization name or slug (omit for all orgs)'),
    },
    async ({ org }) => {
      let orgQuery = `SELECT * FROM organizations WHERE 1=1`;
      const orgParams: any[] = [];

      if (org) {
        orgQuery += ` AND (name LIKE ? OR slug LIKE ?)`;
        orgParams.push(`%${org}%`, `%${org}%`);
      }

      orgQuery += ` ORDER BY name`;

      const orgs = db.prepare(orgQuery).all(...orgParams) as any[];

      if (orgs.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No organizations found.' }] };
      }

      const result = orgs.map((o) => {
        const totalMembers = (db.prepare(`SELECT COUNT(*) as c FROM memberships WHERE org_id = ?`).get(o.id) as any).c;
        const activeMembers = (db.prepare(`
          SELECT COUNT(*) as c FROM memberships m
          JOIN users u ON u.id = m.user_id
          WHERE m.org_id = ? AND u.status = 'active'
        `).get(o.id) as any).c;

        const mfaEnabled = (db.prepare(`
          SELECT COUNT(*) as c FROM memberships m
          JOIN users u ON u.id = m.user_id
          WHERE m.org_id = ? AND u.mfa_enabled = 1 AND u.status = 'active'
        `).get(o.id) as any).c;

        const activeInLast7Days = (db.prepare(`
          SELECT COUNT(*) as c FROM memberships
          WHERE org_id = ? AND last_active_at >= datetime('now', '-7 days')
        `).get(o.id) as any).c;

        const activeInLast30Days = (db.prepare(`
          SELECT COUNT(*) as c FROM memberships
          WHERE org_id = ? AND last_active_at >= datetime('now', '-30 days')
        `).get(o.id) as any).c;

        const inactiveMembers = db.prepare(`
          SELECT u.name, u.email, m.last_active_at
          FROM memberships m
          JOIN users u ON u.id = m.user_id
          WHERE m.org_id = ? AND (m.last_active_at < datetime('now', '-14 days') OR m.last_active_at IS NULL)
          AND u.status = 'active'
        `).all(o.id) as any[];

        const mfaNonCompliant = db.prepare(`
          SELECT u.name, u.email
          FROM memberships m
          JOIN users u ON u.id = m.user_id
          WHERE m.org_id = ? AND u.mfa_enabled = 0 AND u.status = 'active'
        `).all(o.id) as any[];

        const pendingInvites = (db.prepare(`
          SELECT COUNT(*) as c FROM invitations WHERE org_id = ? AND status = 'pending'
        `).get(o.id) as any).c;

        const recentLogins = (db.prepare(`
          SELECT COUNT(*) as c FROM audit_log
          WHERE org_id = ? AND action = 'login' AND timestamp >= datetime('now', '-7 days')
        `).get(o.id) as any).c;

        const failedLogins = (db.prepare(`
          SELECT COUNT(*) as c FROM audit_log
          WHERE org_id = ? AND action LIKE 'login.%' AND timestamp >= datetime('now', '-30 days')
        `).get(o.id) as any).c;

        // Security score (0-100)
        let score = 100;
        if (!o.sso_enabled) score -= 15;
        if (!o.mfa_required) score -= 20;
        if (mfaNonCompliant.length > 0 && o.mfa_required) score -= 15;
        if (inactiveMembers.length > 0) score -= 10;
        if (failedLogins > 0) score -= 5;
        if (o.status === 'suspended') score -= 30;
        score = Math.max(0, score);

        return {
          organization: o.name,
          slug: o.slug,
          plan: o.plan,
          status: o.status,
          seats: { used: totalMembers, max: o.max_seats, utilization: `${Math.round((totalMembers / o.max_seats) * 100)}%` },
          members: { total: totalMembers, active: activeMembers },
          activity: {
            active_last_7_days: activeInLast7Days,
            active_last_30_days: activeInLast30Days,
            logins_last_7_days: recentLogins,
          },
          security: {
            sso_enabled: !!o.sso_enabled,
            mfa_required: !!o.mfa_required,
            mfa_adoption: activeMembers > 0 ? `${mfaEnabled}/${activeMembers} (${Math.round((mfaEnabled / activeMembers) * 100)}%)` : 'N/A',
            mfa_non_compliant: mfaNonCompliant,
            failed_logins_30d: failedLogins,
            score,
          },
          inactive_members: inactiveMembers,
          pending_invites: pendingInvites,
        };
      });

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ health: result, count: result.length }, null, 2) }],
      };
    }
  );
}
