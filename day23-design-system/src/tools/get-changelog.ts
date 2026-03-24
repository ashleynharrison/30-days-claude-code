import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerGetChangelog(server: McpServer) {
  server.tool(
    'get_changelog',
    'Get the design system changelog — recent additions, updates, and fixes. Filter by component, author, or action type.',
    {
      component: z.string().optional().describe('Filter by component name'),
      author: z.string().optional().describe('Filter by author name (partial match)'),
      action: z.string().optional().describe('Filter by action type: add, update, fix, deprecate, remove'),
      limit: z.number().optional().describe('Number of entries to return (default: 20)'),
    },
    async ({ component, author, action, limit = 20 }) => {
      let query = `
        SELECT cl.*, c.name as component_name
        FROM changelog cl
        LEFT JOIN components c ON c.id = cl.component_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (component) {
        query += ` AND LOWER(c.name) = LOWER(?)`;
        params.push(component);
      }
      if (author) {
        query += ` AND cl.author LIKE ?`;
        params.push(`%${author}%`);
      }
      if (action) {
        query += ` AND cl.action = ?`;
        params.push(action);
      }

      query += ` ORDER BY cl.created_at DESC LIMIT ?`;
      params.push(limit);

      const entries = db.prepare(query).all(...params) as any[];

      if (entries.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No changelog entries found matching your criteria.' }] };
      }

      // Author activity
      const authorStats = db.prepare(`
        SELECT author, COUNT(*) as contributions,
               MAX(created_at) as last_contribution
        FROM changelog
        GROUP BY author
        ORDER BY contributions DESC
      `).all() as any[];

      // Version timeline
      const versions = db.prepare(`
        SELECT DISTINCT version, MIN(created_at) as released_at
        FROM changelog
        WHERE version IS NOT NULL
        GROUP BY version
        ORDER BY created_at DESC
        LIMIT 10
      `).all() as any[];

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            summary: {
              total_entries: entries.length,
              latest_version: versions.length > 0 ? versions[0].version : 'none',
              contributors: authorStats,
            },
            versions: versions,
            entries: entries.map((e: any) => ({
              action: e.action,
              component: e.component_name || 'System',
              description: e.description,
              author: e.author,
              version: e.version,
              date: e.created_at,
            })),
          }, null, 2),
        }],
      };
    }
  );
}
