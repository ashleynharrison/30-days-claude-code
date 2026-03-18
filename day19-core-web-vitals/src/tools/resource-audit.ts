import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerResourceAudit(server: McpServer) {
  server.tool(
    'resource_audit',
    'Audit page resources for a site. Shows images, scripts, stylesheets, and fonts with sizes, load times, and whether they block rendering.',
    {
      site_name: z.string().describe('Name of the site to audit (partial match)'),
      resource_type: z.enum(['image', 'script', 'stylesheet', 'font', 'video', 'all']).optional().describe('Filter by resource type (default: all)'),
      blocking_only: z.boolean().optional().describe('Only show render-blocking resources'),
    },
    async ({ site_name, resource_type, blocking_only }) => {
      const site = db.prepare(`SELECT * FROM sites WHERE name LIKE ?`).get(`%${site_name}%`) as any;

      if (!site) {
        return { content: [{ type: 'text' as const, text: `No site found matching "${site_name}".` }] };
      }

      let query = `SELECT * FROM resources WHERE site_id = ?`;
      const params: any[] = [site.id];

      if (resource_type && resource_type !== 'all') {
        query += ` AND resource_type = ?`;
        params.push(resource_type);
      }
      if (blocking_only) {
        query += ` AND blocking = 1`;
      }

      query += ` ORDER BY size_kb DESC`;

      const resources = db.prepare(query).all(...params) as any[];

      if (resources.length === 0) {
        return { content: [{ type: 'text' as const, text: `No resources found matching your criteria for ${site.name}.` }] };
      }

      const totalSize = resources.reduce((sum, r: any) => sum + r.size_kb, 0);
      const blockingResources = resources.filter((r: any) => r.blocking);
      const blockingSize = blockingResources.reduce((sum, r: any) => sum + r.size_kb, 0);

      const byType: Record<string, { count: number; total_kb: number }> = {};
      for (const r of resources as any[]) {
        if (!byType[r.resource_type]) byType[r.resource_type] = { count: 0, total_kb: 0 };
        byType[r.resource_type].count++;
        byType[r.resource_type].total_kb += r.size_kb;
      }

      const result = resources.map((r: any) => ({
        type: r.resource_type,
        url: r.url,
        size_kb: r.size_kb,
        load_time_ms: r.load_time_ms,
        blocking: r.blocking === 1,
        page: r.page_path,
      }));

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          site: site.name,
          summary: {
            total_resources: resources.length,
            total_size_kb: Math.round(totalSize),
            total_size_mb: (totalSize / 1024).toFixed(1),
            blocking_resources: blockingResources.length,
            blocking_size_kb: Math.round(blockingSize),
          },
          by_type: byType,
          resources: result,
        }, null, 2) }],
      };
    }
  );
}
