import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerSiteOverview(server: McpServer) {
  server.tool(
    'site_overview',
    'Get an overview of all monitored sites with their latest scores, status, and health summary',
    {
      site_name: z.string().optional().describe('Filter by site name (partial match)'),
      category: z.string().optional().describe('Filter by category (e.g. e-commerce, saas, media)'),
      status: z.string().optional().describe('Filter by status (active, paused, archived)'),
    },
    async ({ site_name, category, status }) => {
      let query = `
        SELECT s.*,
          a.performance_score, a.accessibility_score, a.best_practices_score, a.seo_score,
          a.fcp_ms, a.lcp_ms, a.cls, a.tbt_ms, a.run_at AS last_audit,
          a.device, a.total_byte_weight, a.dom_size, a.request_count
        FROM sites s
        LEFT JOIN audits a ON a.site_id = s.id
          AND a.run_at = (SELECT MAX(a2.run_at) FROM audits a2 WHERE a2.site_id = s.id)
        WHERE 1=1
      `;
      const params: any[] = [];

      if (site_name) {
        query += ` AND s.name LIKE ?`;
        params.push(`%${site_name}%`);
      }
      if (category) {
        query += ` AND s.category = ?`;
        params.push(category);
      }
      if (status) {
        query += ` AND s.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY s.name`;

      const rows = db.prepare(query).all(...params) as any[];

      if (rows.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No sites found matching your criteria.' }] };
      }

      const sites = rows.map((r) => {
        const avgScore = r.performance_score
          ? Math.round((r.performance_score + r.accessibility_score + r.best_practices_score + r.seo_score) / 4)
          : null;

        let health = 'unknown';
        if (avgScore !== null) {
          if (avgScore >= 90) health = 'excellent';
          else if (avgScore >= 70) health = 'good';
          else if (avgScore >= 50) health = 'needs-work';
          else health = 'poor';
        }

        // Budget status
        const budgetRows = db.prepare(
          `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'over_budget' THEN 1 ELSE 0 END) as over
           FROM budgets WHERE site_id = ?`
        ).get(r.id) as any;

        // Open tasks
        const taskCount = db.prepare(
          `SELECT COUNT(*) as count FROM tasks WHERE site_id = ? AND status = 'open'`
        ).get(r.id) as any;

        return {
          name: r.name,
          url: r.url,
          category: r.category,
          owner: r.owner,
          status: r.status,
          health,
          latest_scores: r.performance_score ? {
            performance: r.performance_score,
            accessibility: r.accessibility_score,
            best_practices: r.best_practices_score,
            seo: r.seo_score,
            average: avgScore,
          } : null,
          core_web_vitals: r.lcp_ms ? {
            fcp_ms: r.fcp_ms,
            lcp_ms: r.lcp_ms,
            cls: r.cls,
            tbt_ms: r.tbt_ms,
          } : null,
          page_stats: r.total_byte_weight ? {
            total_bytes: r.total_byte_weight,
            dom_elements: r.dom_size,
            requests: r.request_count,
          } : null,
          last_audit: r.last_audit,
          device: r.device,
          budgets_over: budgetRows?.over || 0,
          budgets_total: budgetRows?.total || 0,
          open_tasks: taskCount?.count || 0,
        };
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ sites_count: sites.length, sites }, null, 2),
        }],
      };
    }
  );
}
