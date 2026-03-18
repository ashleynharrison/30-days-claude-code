import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerTrendAnalysis(server: McpServer) {
  server.tool(
    'trend_analysis',
    'Analyze Core Web Vitals trends over time for a site. Shows weekly snapshots, direction of change, and whether metrics are improving or regressing.',
    {
      site_name: z.string().describe('Name of the site to analyze (partial match)'),
      metric: z.enum(['lcp', 'cls', 'inp', 'all']).optional().describe('Specific metric to focus on (default: all)'),
      device: z.enum(['mobile', 'desktop']).optional().describe('Device type (default: mobile)'),
    },
    async ({ site_name, metric, device: dev }) => {
      const device = dev || 'mobile';
      const site = db.prepare(`SELECT * FROM sites WHERE name LIKE ?`).get(`%${site_name}%`) as any;

      if (!site) {
        return { content: [{ type: 'text' as const, text: `No site found matching "${site_name}".` }] };
      }

      const measurements = db.prepare(`
        SELECT lcp_ms, cls, inp_ms, fcp_ms, ttfb_ms, measured_at, notes
        FROM measurements
        WHERE site_id = ? AND device = ?
        ORDER BY measured_at ASC
      `).all(site.id, device) as any[];

      if (measurements.length < 2) {
        return { content: [{ type: 'text' as const, text: 'Not enough data points for trend analysis. Need at least 2 measurements.' }] };
      }

      const first = measurements[0];
      const last = measurements[measurements.length - 1];

      const trends: any = {};

      const calcTrend = (key: string, label: string, goodThreshold: number) => {
        const firstVal = first[key];
        const lastVal = last[key];
        const change = lastVal - firstVal;
        const pctChange = ((change / firstVal) * 100).toFixed(1);
        const direction = change < 0 ? 'improving' : change > 0 ? 'regressing' : 'stable';
        return {
          label,
          first_value: firstVal,
          latest_value: lastVal,
          change,
          percent_change: `${pctChange}%`,
          direction,
          currently_passing: lastVal <= goodThreshold,
        };
      };

      if (metric === 'all' || !metric || metric === 'lcp') {
        trends.LCP = calcTrend('lcp_ms', 'Largest Contentful Paint', 2500);
      }
      if (metric === 'all' || !metric || metric === 'cls') {
        trends.CLS = calcTrend('cls', 'Cumulative Layout Shift', 0.1);
      }
      if (metric === 'all' || !metric || metric === 'inp') {
        trends.INP = calcTrend('inp_ms', 'Interaction to Next Paint', 200);
      }

      const timeline = measurements.map((m: any) => ({
        date: m.measured_at,
        lcp_ms: metric === 'all' || !metric || metric === 'lcp' ? m.lcp_ms : undefined,
        cls: metric === 'all' || !metric || metric === 'cls' ? m.cls : undefined,
        inp_ms: metric === 'all' || !metric || metric === 'inp' ? m.inp_ms : undefined,
        notes: m.notes,
      }));

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          site: site.name,
          device,
          period: { from: first.measured_at, to: last.measured_at, data_points: measurements.length },
          trends,
          timeline,
        }, null, 2) }],
      };
    }
  );
}
