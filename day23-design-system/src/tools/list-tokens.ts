import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerListTokens(server: McpServer) {
  server.tool(
    'list_tokens',
    'List and search design tokens. Filter by category (color, spacing, typography, shadow, radius) or search by name. Shows light and dark values with CSS variables.',
    {
      category: z.string().optional().describe('Filter by category: color, spacing, typography, shadow, radius'),
      search: z.string().optional().describe('Search by token name or description (partial match)'),
      include_dark: z.boolean().optional().describe('Include dark mode values (default: true)'),
    },
    async ({ category, search, include_dark = true }) => {
      let query = `SELECT * FROM tokens WHERE 1=1`;
      const params: any[] = [];

      if (category) {
        query += ` AND category = ?`;
        params.push(category);
      }
      if (search) {
        query += ` AND (name LIKE ? OR description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY category, name`;

      const tokens = db.prepare(query).all(...params) as any[];

      if (tokens.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No tokens found matching your criteria.' }] };
      }

      // Group by category
      const grouped: Record<string, any[]> = {};
      for (const token of tokens) {
        if (!grouped[token.category]) grouped[token.category] = [];
        const entry: any = {
          name: token.name,
          value: token.value,
          css_variable: token.css_variable,
          description: token.description,
        };
        if (include_dark && token.dark_value) {
          entry.dark_value = token.dark_value;
        }
        if (token.figma_ref) {
          entry.figma_ref = token.figma_ref;
        }
        grouped[token.category].push(entry);
      }

      const categoryCounts = Object.entries(grouped).map(([cat, toks]) => `${cat}: ${toks.length}`).join(', ');

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            summary: {
              total_tokens: tokens.length,
              categories: categoryCounts,
            },
            tokens: grouped,
          }, null, 2),
        }],
      };
    }
  );
}
