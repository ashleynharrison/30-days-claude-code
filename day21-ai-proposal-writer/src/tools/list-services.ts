import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerListServices(server: McpServer) {
  server.tool(
    'list_services',
    'List available service offerings with rates, typical hours, and deliverables. Filter by category to find the right services for a proposal.',
    {
      category: z.string().optional().describe('Filter by category: AI Engineering, Custom Development, Design, Performance, Security, Strategy'),
    },
    async ({ category }) => {
      let query = `SELECT * FROM services WHERE 1=1`;
      const params: any[] = [];

      if (category) {
        query += ` AND category LIKE ?`;
        params.push(`%${category}%`);
      }

      query += ` ORDER BY category, name`;

      const services = db.prepare(query).all(...params) as any[];

      if (services.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No services found matching your criteria.' }] };
      }

      const result = services.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        description: s.description,
        rate: `$${s.hourly_rate}/hr`,
        hours: { minimum: s.min_hours, typical: s.typical_hours },
        typical_cost: `$${(s.hourly_rate * s.typical_hours).toLocaleString()}`,
        deliverables: s.deliverables,
      }));

      // Group by category
      const byCategory: Record<string, any[]> = {};
      for (const svc of result) {
        if (!byCategory[svc.category]) byCategory[svc.category] = [];
        byCategory[svc.category].push(svc);
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ services_by_category: byCategory, total: result.length }, null, 2),
        }],
      };
    }
  );
}
