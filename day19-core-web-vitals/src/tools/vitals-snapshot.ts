import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerVitalsSnapshot(server: McpServer) {
  server.tool(
    'vitals_snapshot',
    'Get the latest Core Web Vitals snapshot for a site. Shows LCP, CLS, INP, FCP, TTFB, and pass/fail status against Google thresholds.',
    {
      site_name: z.string().describe('Name of the site to check (partial match)'),
      device: z.enum(['mobile', 'desktop', 'both']).optional().describe('Device type to check (default: both)'),
    },
    async ({ site_name, device }) => {
      const site = db.prepare(`SELECT * FROM sites WHERE name LIKE ?`).get(`%${site_name}%`) as any;

      if (!site) {
        return { content: [{ type: 'text' as const, text: `No site found matching "${site_name}".` }] };
      }

      const devices = device === 'both' || !device ? ['mobile', 'desktop'] : [device];
      const snapshots: any[] = [];

      for (const dev of devices) {
        const latest = db.prepare(`
          SELECT lcp_ms, cls, inp_ms, fcp_ms, ttfb_ms, speed_index, total_blocking_time_ms, measured_at, notes
          FROM measurements
          WHERE site_id = ? AND device = ?
          ORDER BY measured_at DESC
          LIMIT 1
        `).get(site.id, dev) as any;

        if (latest) {
          snapshots.push({
            device: dev,
            measured_at: latest.measured_at,
            core_web_vitals: {
              LCP: { value_ms: latest.lcp_ms, status: latest.lcp_ms <= 2500 ? 'good' : latest.lcp_ms <= 4000 ? 'needs_improvement' : 'poor' },
              CLS: { value: latest.cls, status: latest.cls <= 0.1 ? 'good' : latest.cls <= 0.25 ? 'needs_improvement' : 'poor' },
              INP: { value_ms: latest.inp_ms, status: latest.inp_ms <= 200 ? 'good' : latest.inp_ms <= 500 ? 'needs_improvement' : 'poor' },
            },
            other_metrics: {
              FCP_ms: latest.fcp_ms,
              TTFB_ms: latest.ttfb_ms,
              speed_index: latest.speed_index,
              total_blocking_time_ms: latest.total_blocking_time_ms,
            },
            notes: latest.notes,
          });
        }
      }

      const passing = snapshots.every((s) =>
        s.core_web_vitals.LCP.status === 'good' &&
        s.core_web_vitals.CLS.status === 'good' &&
        s.core_web_vitals.INP.status === 'good'
      );

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          site: site.name,
          url: site.url,
          overall_status: passing ? 'PASSING' : 'FAILING',
          snapshots,
        }, null, 2) }],
      };
    }
  );
}
