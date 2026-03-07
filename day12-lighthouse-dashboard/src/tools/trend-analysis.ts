import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerTrendAnalysis(server: McpServer) {
  server.tool(
    'trend_analysis',
    'Analyze performance score trends over time for a site — see weekly snapshots, score trajectories, and Core Web Vital progression',
    {
      site_name: z.string().describe('Site name to look up (partial match)'),
      device: z.enum(['mobile', 'desktop']).optional().describe('Filter by device type'),
      weeks: z.number().optional().describe('Number of recent weeks to include (default: all)'),
    },
    async ({ site_name, device, weeks }) => {
      const site = db.prepare(
        `SELECT * FROM sites WHERE name LIKE ? LIMIT 1`
      ).get(`%${site_name}%`) as any;

      if (!site) {
        return { content: [{ type: 'text' as const, text: `No site found matching "${site_name}".` }] };
      }

      let query = `
        SELECT t.*
        FROM trends t
        WHERE t.site_id = ?
      `;
      const params: any[] = [site.id];

      if (device) {
        query += ` AND t.device = ?`;
        params.push(device);
      }

      query += ` ORDER BY t.week_of DESC`;

      if (weeks) {
        query += ` LIMIT ?`;
        params.push(weeks);
      }

      const rows = db.prepare(query).all(...params) as any[];

      if (rows.length === 0) {
        return { content: [{ type: 'text' as const, text: `No trend data found for "${site.name}".` }] };
      }

      // Reverse to chronological order
      const chronological = [...rows].reverse();

      // Calculate overall direction
      const first = chronological[0];
      const last = chronological[chronological.length - 1];
      const perfChange = (last.avg_performance || 0) - (first.avg_performance || 0);
      const a11yChange = (last.avg_accessibility || 0) - (first.avg_accessibility || 0);
      const lcpChange = (last.avg_lcp_ms || 0) - (first.avg_lcp_ms || 0);
      const clsChange = (last.avg_cls || 0) - (first.avg_cls || 0);

      const direction = perfChange > 5 ? 'improving' : perfChange < -5 ? 'declining' : 'stable';

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            site: site.name,
            url: site.url,
            period: {
              from: first.week_of,
              to: last.week_of,
              weeks_analyzed: chronological.length,
            },
            overall_direction: direction,
            score_changes: {
              performance: { from: first.avg_performance, to: last.avg_performance, change: perfChange },
              accessibility: { from: first.avg_accessibility, to: last.avg_accessibility, change: a11yChange },
            },
            cwv_changes: {
              lcp_ms: { from: first.avg_lcp_ms, to: last.avg_lcp_ms, change: Math.round(lcpChange) },
              cls: { from: first.avg_cls, to: last.avg_cls, change: parseFloat(clsChange.toFixed(3)) },
              fcp_ms: { from: first.avg_fcp_ms, to: last.avg_fcp_ms, change: Math.round((last.avg_fcp_ms || 0) - (first.avg_fcp_ms || 0)) },
            },
            weekly_snapshots: chronological.map((t) => ({
              week_of: t.week_of,
              device: t.device,
              scores: {
                performance: t.avg_performance,
                accessibility: t.avg_accessibility,
                best_practices: t.avg_best_practices,
                seo: t.avg_seo,
              },
              cwv: {
                lcp_ms: t.avg_lcp_ms,
                cls: t.avg_cls,
                fcp_ms: t.avg_fcp_ms,
              },
            })),
          }, null, 2),
        }],
      };
    }
  );
}
