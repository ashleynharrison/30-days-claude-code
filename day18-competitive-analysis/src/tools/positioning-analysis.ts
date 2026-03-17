import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerPositioningAnalysis(server: McpServer) {
  server.tool(
    'positioning_analysis',
    'Compare how competitors position themselves — taglines, target audiences, value propositions, differentiators, and messaging tone.',
    {
      competitor: z.string().optional().describe('Filter by competitor name (partial match)'),
      target_audience: z.string().optional().describe('Search by target audience keyword (e.g. enterprise, startup, developer)'),
    },
    async ({ competitor, target_audience }) => {
      let query = `
        SELECT p.*, c.name as competitor_name, c.website, c.category
        FROM positioning p
        JOIN competitors c ON p.competitor_id = c.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (competitor) {
        query += ` AND c.name LIKE ?`;
        params.push(`%${competitor}%`);
      }
      if (target_audience) {
        query += ` AND p.target_audience LIKE ?`;
        params.push(`%${target_audience}%`);
      }

      query += ` ORDER BY c.name`;

      const positions = db.prepare(query).all(...params) as any[];

      if (positions.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No positioning data found matching your criteria.' }] };
      }

      const result = positions.map((p) => ({
        competitor: p.competitor_name,
        website: p.website,
        category: p.category,
        tagline: p.tagline,
        target_audience: p.target_audience,
        value_proposition: p.value_proposition,
        differentiators: p.differentiators,
        tone: p.tone,
        as_of: p.recorded_date,
      }));

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ positioning: result, count: result.length }, null, 2) }],
      };
    }
  );
}
