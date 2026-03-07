import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerBudgetTracker(server: McpServer) {
  server.tool(
    'budget_tracker',
    'Track performance budgets for sites — see which metrics are within budget, over budget, or at risk',
    {
      site_name: z.string().optional().describe('Filter by site name (partial match)'),
      status: z.string().optional().describe('Filter by budget status (within_budget, over_budget, at_risk)'),
      metric: z.string().optional().describe('Filter by specific metric (e.g. lcp, fcp, cls, total_bytes)'),
    },
    async ({ site_name, status, metric }) => {
      let query = `
        SELECT b.*, s.name AS site_name, s.url
        FROM budgets b
        JOIN sites s ON s.id = b.site_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (site_name) {
        query += ` AND s.name LIKE ?`;
        params.push(`%${site_name}%`);
      }
      if (status) {
        query += ` AND b.status = ?`;
        params.push(status);
      }
      if (metric) {
        query += ` AND b.metric LIKE ?`;
        params.push(`%${metric}%`);
      }

      query += ` ORDER BY s.name, b.metric`;

      const rows = db.prepare(query).all(...params) as any[];

      if (rows.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No budgets found matching your criteria.' }] };
      }

      // Group by site
      const grouped: Record<string, any> = {};
      for (const r of rows) {
        if (!grouped[r.site_name]) {
          grouped[r.site_name] = {
            site: r.site_name,
            url: r.url,
            budgets: [],
            summary: { within: 0, over: 0, at_risk: 0 },
          };
        }

        // Get latest actual value from audits
        const latestAudit = db.prepare(`
          SELECT * FROM audits
          WHERE site_id = ?
          ORDER BY run_at DESC LIMIT 1
        `).get(r.site_id) as any;

        let currentValue: number | null = null;
        if (latestAudit) {
          const metricMap: Record<string, string> = {
            lcp: 'lcp_ms', fcp: 'fcp_ms', cls: 'cls', tbt: 'tbt_ms',
            si: 'si_ms', tti: 'tti_ms', total_bytes: 'total_byte_weight',
            dom_size: 'dom_size', request_count: 'request_count',
            performance: 'performance_score', accessibility: 'accessibility_score',
          };
          const col = metricMap[r.metric];
          if (col && latestAudit[col] !== undefined) {
            currentValue = latestAudit[col];
          }
        }

        grouped[r.site_name].budgets.push({
          metric: r.metric,
          budget: r.budget_value,
          unit: r.unit,
          status: r.status,
          current_value: currentValue,
        });

        if (r.status === 'within_budget') grouped[r.site_name].summary.within++;
        else if (r.status === 'over_budget') grouped[r.site_name].summary.over++;
        else if (r.status === 'at_risk') grouped[r.site_name].summary.at_risk++;
      }

      const sites = Object.values(grouped);
      const overallSummary = {
        total_budgets: rows.length,
        within_budget: rows.filter((r) => r.status === 'within_budget').length,
        over_budget: rows.filter((r) => r.status === 'over_budget').length,
        at_risk: rows.filter((r) => r.status === 'at_risk').length,
      };

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ overall_summary: overallSummary, sites }, null, 2),
        }],
      };
    }
  );
}
