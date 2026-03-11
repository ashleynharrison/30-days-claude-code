import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerPipelineHealth(server: McpServer) {
  server.tool(
    'pipeline_health',
    'Health summary for each project — success rate, average build time, last build status, and failure trends over the last 14 days.',
    {
      project: z.string().optional().describe('Filter by project name'),
      team: z.string().optional().describe('Filter by team name'),
    },
    async (params) => {
      let sql = `
        SELECT
          p.name as project,
          p.language,
          p.team,
          COUNT(b.id) as total_builds,
          SUM(CASE WHEN b.status = 'success' THEN 1 ELSE 0 END) as passed,
          SUM(CASE WHEN b.status = 'failed' THEN 1 ELSE 0 END) as failed,
          ROUND(100.0 * SUM(CASE WHEN b.status = 'success' THEN 1 ELSE 0 END) / COUNT(b.id), 1) as success_rate,
          ROUND(AVG(b.duration_seconds), 0) as avg_duration_seconds,
          MIN(b.duration_seconds) as min_duration_seconds,
          MAX(b.duration_seconds) as max_duration_seconds
        FROM projects p
        LEFT JOIN builds b ON p.id = b.project_id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.project) {
        sql += ' AND p.name LIKE ?';
        args.push(`%${params.project}%`);
      }
      if (params.team) {
        sql += ' AND p.team LIKE ?';
        args.push(`%${params.team}%`);
      }

      sql += ' GROUP BY p.id ORDER BY success_rate ASC';

      const rows = db.prepare(sql).all(...args);

      // Get last build status per project
      const lastBuilds = db.prepare(`
        SELECT p.name as project, b.status as last_build_status, b.started_at as last_build_at
        FROM projects p
        LEFT JOIN builds b ON p.id = b.project_id
        WHERE b.id = (SELECT MAX(id) FROM builds WHERE project_id = p.id)
      `).all() as Array<{ project: string; last_build_status: string; last_build_at: string }>;

      const lastBuildMap = new Map(lastBuilds.map(lb => [lb.project, lb]));
      const enriched = (rows as Array<Record<string, unknown>>).map(row => ({
        ...row,
        last_build_status: lastBuildMap.get(row.project as string)?.last_build_status ?? 'none',
        last_build_at: lastBuildMap.get(row.project as string)?.last_build_at ?? null,
      }));

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ pipeline_health: enriched }, null, 2),
        }],
      };
    },
  );
}
