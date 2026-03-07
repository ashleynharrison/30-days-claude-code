import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerAuditResults(server: McpServer) {
  server.tool(
    'audit_results',
    'Get detailed Lighthouse audit results for a site including all category scores, Core Web Vitals, and page weight metrics',
    {
      site_name: z.string().describe('Site name to look up (partial match)'),
      device: z.enum(['mobile', 'desktop']).optional().describe('Filter by device type'),
      limit: z.number().optional().describe('Number of recent audits to return (default: 3)'),
    },
    async ({ site_name, device, limit }) => {
      const maxResults = limit || 3;

      let query = `
        SELECT a.*, s.name AS site_name, s.url
        FROM audits a
        JOIN sites s ON s.id = a.site_id
        WHERE s.name LIKE ?
      `;
      const params: any[] = [`%${site_name}%`];

      if (device) {
        query += ` AND a.device = ?`;
        params.push(device);
      }

      query += ` ORDER BY a.run_at DESC LIMIT ?`;
      params.push(maxResults);

      const rows = db.prepare(query).all(...params) as any[];

      if (rows.length === 0) {
        return { content: [{ type: 'text' as const, text: `No audits found for site matching "${site_name}".` }] };
      }

      const audits = rows.map((r) => {
        // Grade Core Web Vitals
        const cwvGrades = {
          lcp: r.lcp_ms <= 2500 ? 'good' : r.lcp_ms <= 4000 ? 'needs-improvement' : 'poor',
          fcp: r.fcp_ms <= 1800 ? 'good' : r.fcp_ms <= 3000 ? 'needs-improvement' : 'poor',
          cls: r.cls <= 0.1 ? 'good' : r.cls <= 0.25 ? 'needs-improvement' : 'poor',
          tbt: r.tbt_ms <= 200 ? 'good' : r.tbt_ms <= 600 ? 'needs-improvement' : 'poor',
        };

        return {
          audit_id: r.id,
          site: r.site_name,
          url: r.url,
          run_at: r.run_at,
          device: r.device,
          scores: {
            performance: r.performance_score,
            accessibility: r.accessibility_score,
            best_practices: r.best_practices_score,
            seo: r.seo_score,
          },
          core_web_vitals: {
            first_contentful_paint: { value_ms: r.fcp_ms, grade: cwvGrades.fcp },
            largest_contentful_paint: { value_ms: r.lcp_ms, grade: cwvGrades.lcp },
            cumulative_layout_shift: { value: r.cls, grade: cwvGrades.cls },
            total_blocking_time: { value_ms: r.tbt_ms, grade: cwvGrades.tbt },
            speed_index: { value_ms: r.si_ms },
            time_to_interactive: { value_ms: r.tti_ms },
          },
          page_weight: {
            total_bytes: r.total_byte_weight,
            total_kb: r.total_byte_weight ? Math.round(r.total_byte_weight / 1024) : null,
            dom_elements: r.dom_size,
            request_count: r.request_count,
          },
        };
      });

      // Score trend comparison if multiple audits
      let trend_summary = null;
      if (audits.length >= 2) {
        const latest = audits[0].scores;
        const previous = audits[1].scores;
        trend_summary = {
          performance_change: latest.performance - previous.performance,
          accessibility_change: latest.accessibility - previous.accessibility,
          best_practices_change: latest.best_practices - previous.best_practices,
          seo_change: latest.seo - previous.seo,
        };
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ audits_count: audits.length, trend_summary, audits }, null, 2),
        }],
      };
    }
  );
}
