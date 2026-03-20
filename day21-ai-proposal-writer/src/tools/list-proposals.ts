import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerListProposals(server: McpServer) {
  server.tool(
    'list_proposals',
    'List and search proposals. Filter by status, client, or date range. Shows pipeline overview with total values.',
    {
      status: z.string().optional().describe('Filter by status: draft, sent, accepted, declined'),
      client_search: z.string().optional().describe('Search by client name or company (partial match)'),
      sort: z.string().optional().describe('Sort by: created, value, status (default: created)'),
    },
    async ({ status, client_search, sort }) => {
      let query = `
        SELECT p.*, c.name as client_name, c.company, c.industry, t.name as template_name, t.type as template_type
        FROM proposals p
        JOIN clients c ON c.id = p.client_id
        LEFT JOIN templates t ON t.id = p.template_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (status) {
        query += ` AND p.status = ?`;
        params.push(status);
      }
      if (client_search) {
        query += ` AND (c.name LIKE ? OR c.company LIKE ?)`;
        params.push(`%${client_search}%`, `%${client_search}%`);
      }

      const sortMap: Record<string, string> = {
        value: 'p.total_cost DESC',
        status: 'p.status, p.created_at DESC',
        created: 'p.created_at DESC',
      };
      query += ` ORDER BY ${sortMap[sort || 'created'] || sortMap.created}`;

      const proposals = db.prepare(query).all(...params) as any[];

      if (proposals.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No proposals found matching your criteria.' }] };
      }

      // Pipeline summary
      const pipeline = {
        draft: { count: 0, value: 0 },
        sent: { count: 0, value: 0 },
        accepted: { count: 0, value: 0 },
        declined: { count: 0, value: 0 },
      };

      const result = proposals.map((p) => {
        const key = p.status as keyof typeof pipeline;
        if (pipeline[key]) {
          pipeline[key].count++;
          pipeline[key].value += p.total_cost;
        }

        return {
          id: p.id,
          title: p.title,
          client: { name: p.client_name, company: p.company, industry: p.industry },
          template: p.template_name,
          status: p.status,
          total_hours: p.total_hours,
          total_cost: `$${p.total_cost.toLocaleString()}`,
          timeline: `${p.timeline_weeks} weeks`,
          created_at: p.created_at,
          sent_at: p.sent_at,
          accepted_at: p.accepted_at,
        };
      });

      const pipelineSummary = Object.entries(pipeline)
        .filter(([, v]) => v.count > 0)
        .reduce((acc, [k, v]) => {
          acc[k] = { count: v.count, total_value: `$${v.value.toLocaleString()}` };
          return acc;
        }, {} as Record<string, any>);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ pipeline: pipelineSummary, proposals: result, count: result.length }, null, 2),
        }],
      };
    }
  );
}
