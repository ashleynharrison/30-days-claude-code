import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerBuildStatus(server: McpServer) {
  server.tool(
    'build_status',
    'Get recent build status across all projects or for a specific project. Shows pass/fail, duration, author, and commit info.',
    {
      project: z.string().optional().describe('Filter by project name'),
      status: z.enum(['success', 'failed', 'running', 'pending']).optional().describe('Filter by build status'),
      limit: z.number().optional().describe('Number of builds to return (default 20)'),
    },
    async (params) => {
      let sql = `
        SELECT b.*, p.name as project_name, pl.name as pipeline_name
        FROM builds b
        JOIN projects p ON b.project_id = p.id
        JOIN pipelines pl ON b.pipeline_id = pl.id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.project) {
        sql += ' AND p.name LIKE ?';
        args.push(`%${params.project}%`);
      }
      if (params.status) {
        sql += ' AND b.status = ?';
        args.push(params.status);
      }

      sql += ' ORDER BY b.started_at DESC LIMIT ?';
      args.push(params.limit || 20);

      const rows = db.prepare(sql).all(...args);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ builds: rows, count: (rows as unknown[]).length }, null, 2),
        }],
      };
    },
  );
}
