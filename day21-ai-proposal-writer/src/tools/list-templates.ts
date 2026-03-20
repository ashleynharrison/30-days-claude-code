import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerListTemplates(server: McpServer) {
  server.tool(
    'list_templates',
    'List available proposal templates — SOW, quick proposal, discovery, retainer. Shows sections, tone, and when to use each one.',
    {
      type: z.string().optional().describe('Filter by type: sow, proposal, discovery, retainer'),
    },
    async ({ type }) => {
      let query = `SELECT * FROM templates WHERE 1=1`;
      const params: any[] = [];

      if (type) {
        query += ` AND type = ?`;
        params.push(type);
      }

      query += ` ORDER BY id`;

      const templates = db.prepare(query).all(...params) as any[];

      const result = templates.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        description: t.description,
        sections: JSON.parse(t.sections),
        tone: t.tone,
      }));

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ templates: result, count: result.length }, null, 2),
        }],
      };
    }
  );
}
