import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerDeployHistory(server: McpServer) {
  server.tool(
    'deploy_history',
    'View deployment history across projects. Shows version, environment, status, and rollbacks.',
    {
      project: z.string().optional().describe('Filter by project name'),
      environment: z.enum(['production', 'staging', 'preview']).optional(),
      limit: z.number().optional().describe('Number of deployments to return (default 15)'),
    },
    async (params) => {
      let sql = `
        SELECT d.*, p.name as project_name,
          CASE WHEN d.rollback_of IS NOT NULL THEN 'rollback' ELSE 'deploy' END as deploy_type
        FROM deployments d
        JOIN projects p ON d.project_id = p.id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.project) {
        sql += ' AND p.name LIKE ?';
        args.push(`%${params.project}%`);
      }
      if (params.environment) {
        sql += ' AND d.environment = ?';
        args.push(params.environment);
      }

      sql += ' ORDER BY d.deployed_at DESC LIMIT ?';
      args.push(params.limit || 15);

      const rows = db.prepare(sql).all(...args);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ deployments: rows, count: (rows as unknown[]).length }, null, 2),
        }],
      };
    },
  );
}
