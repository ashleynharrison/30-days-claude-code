import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerFindingsReport(server: McpServer) {
  server.tool(
    'findings_report',
    'Get optimization findings and recommendations from Lighthouse audits — filter by category, severity, or potential savings',
    {
      site_name: z.string().describe('Site name to look up (partial match)'),
      category: z.string().optional().describe('Filter by category (performance, accessibility, best-practices, seo)'),
      severity: z.string().optional().describe('Filter by severity (critical, warning, info)'),
      min_savings_ms: z.number().optional().describe('Only show findings with at least this many ms of potential savings'),
    },
    async ({ site_name, category, severity, min_savings_ms }) => {
      // Find the most recent audit for the site
      const latestAudit = db.prepare(`
        SELECT a.id, a.run_at, a.device, s.name AS site_name, s.url
        FROM audits a
        JOIN sites s ON s.id = a.site_id
        WHERE s.name LIKE ?
        ORDER BY a.run_at DESC
        LIMIT 1
      `).get(`%${site_name}%`) as any;

      if (!latestAudit) {
        return { content: [{ type: 'text' as const, text: `No audits found for site matching "${site_name}".` }] };
      }

      let query = `
        SELECT f.*
        FROM findings f
        WHERE f.audit_id = ?
      `;
      const params: any[] = [latestAudit.id];

      if (category) {
        query += ` AND f.category = ?`;
        params.push(category);
      }
      if (severity) {
        query += ` AND f.severity = ?`;
        params.push(severity);
      }
      if (min_savings_ms) {
        query += ` AND f.savings_ms >= ?`;
        params.push(min_savings_ms);
      }

      query += ` ORDER BY
        CASE f.severity WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
        COALESCE(f.savings_ms, 0) DESC`;

      const findings = db.prepare(query).all(...params) as any[];

      // Summary stats
      const totalSavingsMs = findings.reduce((sum, f) => sum + (f.savings_ms || 0), 0);
      const totalSavingsBytes = findings.reduce((sum, f) => sum + (f.savings_bytes || 0), 0);
      const bySeverity = {
        critical: findings.filter((f) => f.severity === 'critical').length,
        warning: findings.filter((f) => f.severity === 'warning').length,
        info: findings.filter((f) => f.severity === 'info').length,
      };
      const byCategory = findings.reduce((acc: Record<string, number>, f) => {
        acc[f.category] = (acc[f.category] || 0) + 1;
        return acc;
      }, {});

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            site: latestAudit.site_name,
            url: latestAudit.url,
            audit_date: latestAudit.run_at,
            device: latestAudit.device,
            summary: {
              total_findings: findings.length,
              by_severity: bySeverity,
              by_category: byCategory,
              potential_savings_ms: Math.round(totalSavingsMs),
              potential_savings_kb: Math.round(totalSavingsBytes / 1024),
            },
            findings: findings.map((f) => ({
              title: f.title,
              category: f.category,
              severity: f.severity,
              description: f.description,
              savings_ms: f.savings_ms,
              savings_bytes: f.savings_bytes,
              element: f.element,
              recommendation: f.recommendation,
            })),
          }, null, 2),
        }],
      };
    }
  );
}
