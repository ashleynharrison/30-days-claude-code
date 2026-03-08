import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerSecurityAudit(server: McpServer) {
  server.tool(
    'security_audit',
    'Run a security audit on a project — check for MFA gaps, suspicious login attempts, overly permissive roles, and RLS coverage issues',
    {
      project_name: z.string().describe('Project name (partial match)'),
    },
    async ({ project_name }) => {
      const project = db.prepare(`SELECT * FROM projects WHERE name LIKE ?`).get(`%${project_name}%`) as any;
      if (!project) {
        return { content: [{ type: 'text' as const, text: `No project found matching "${project_name}".` }] };
      }

      const findings: { severity: string; category: string; finding: string; recommendation: string }[] = [];

      // 1. MFA compliance check
      if (project.mfa_enabled) {
        const nonMfaUsers = db.prepare(
          `SELECT email, display_name FROM users WHERE project_id = ? AND status = 'active' AND mfa_enrolled = 0`
        ).all(project.id) as any[];

        if (nonMfaUsers.length > 0) {
          findings.push({
            severity: 'high',
            category: 'mfa',
            finding: `${nonMfaUsers.length} active user(s) without MFA: ${nonMfaUsers.map((u) => u.email).join(', ')}`,
            recommendation: 'Enforce MFA enrollment for all active users or set a deadline for compliance.',
          });
        }
      } else {
        findings.push({
          severity: 'medium',
          category: 'mfa',
          finding: 'MFA is not enabled for this project.',
          recommendation: 'Enable MFA to add an extra layer of authentication security.',
        });
      }

      // 2. Suspicious login attempts
      const failedLogins = db.prepare(
        `SELECT ip_address, COUNT(*) as attempts, MAX(created_at) as last_attempt, metadata
         FROM auth_events WHERE project_id = ? AND event_type = 'sign_in_failed'
         GROUP BY ip_address HAVING attempts >= 3`
      ).all(project.id) as any[];

      for (const fl of failedLogins) {
        findings.push({
          severity: 'high',
          category: 'suspicious_activity',
          finding: `${fl.attempts} failed login attempts from IP ${fl.ip_address} (last: ${fl.last_attempt})`,
          recommendation: 'Consider blocking this IP or implementing progressive rate limiting.',
        });
      }

      // 3. Session lifetime check
      if (project.session_lifetime_hours > 12) {
        findings.push({
          severity: 'low',
          category: 'session',
          finding: `Session lifetime is ${project.session_lifetime_hours} hours, which is relatively long.`,
          recommendation: 'Consider reducing session lifetime to 8-12 hours for better security.',
        });
      }

      // 4. Suspended/inactive users check
      const suspendedUsers = db.prepare(
        `SELECT COUNT(*) as count FROM users WHERE project_id = ? AND status = 'suspended'`
      ).get(project.id) as any;

      if (suspendedUsers.count > 0) {
        findings.push({
          severity: 'info',
          category: 'users',
          finding: `${suspendedUsers.count} suspended user account(s) still in the system.`,
          recommendation: 'Review suspended accounts and permanently delete those no longer needed.',
        });
      }

      // 5. Overly permissive roles
      const roles = db.prepare(
        `SELECT r.name, COUNT(rp.id) as perm_count
         FROM roles r LEFT JOIN role_permissions rp ON rp.role_id = r.id
         WHERE r.project_id = ? GROUP BY r.id ORDER BY perm_count DESC`
      ).all(project.id) as any[];

      const totalPerms = db.prepare(
        `SELECT COUNT(*) as count FROM permissions WHERE project_id = ?`
      ).get(project.id) as any;

      for (const role of roles) {
        if (role.perm_count === totalPerms.count && role.name !== 'owner' && role.name !== 'admin' && role.name !== 'super_admin') {
          findings.push({
            severity: 'medium',
            category: 'permissions',
            finding: `Role "${role.name}" has ALL ${role.perm_count} permissions — may be overly permissive.`,
            recommendation: 'Review and reduce permissions to follow the principle of least privilege.',
          });
        }
      }

      // 6. RLS coverage
      const rlsPolicies = db.prepare(
        `SELECT table_name, COUNT(*) as count FROM rls_policies
         WHERE project_id = ? AND enabled = 1 GROUP BY table_name`
      ).all(project.id) as any[];

      const tablesWithoutDelete = rlsPolicies.filter((t) => {
        const deletePolicy = db.prepare(
          `SELECT COUNT(*) as count FROM rls_policies
           WHERE project_id = ? AND table_name = ? AND operation = 'DELETE' AND enabled = 1`
        ).get(project.id, t.table_name) as any;
        return deletePolicy.count === 0;
      });

      if (tablesWithoutDelete.length > 0) {
        findings.push({
          severity: 'medium',
          category: 'rls',
          finding: `${tablesWithoutDelete.length} table(s) missing DELETE RLS policy: ${tablesWithoutDelete.map((t) => t.table_name).join(', ')}`,
          recommendation: 'Add DELETE policies to prevent unauthorized data deletion.',
        });
      }

      // Summary
      const bySeverity = {
        high: findings.filter((f) => f.severity === 'high').length,
        medium: findings.filter((f) => f.severity === 'medium').length,
        low: findings.filter((f) => f.severity === 'low').length,
        info: findings.filter((f) => f.severity === 'info').length,
      };

      const score = Math.max(0, 100 - (bySeverity.high * 20) - (bySeverity.medium * 10) - (bySeverity.low * 5));

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            project: project.name,
            security_score: score,
            grade: score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F',
            summary: bySeverity,
            total_findings: findings.length,
            findings,
          }, null, 2),
        }],
      };
    }
  );
}
