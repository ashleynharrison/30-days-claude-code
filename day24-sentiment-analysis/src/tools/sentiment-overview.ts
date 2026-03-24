import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';
import { computeSentimentBreakdown } from '../scoring.js';

export function registerSentimentOverview(server: McpServer) {
  server.tool(
    'sentiment_overview',
    'Get a sentiment breakdown for a business — overall score, positive/neutral/negative split, average rating, and top themes driving sentiment.',
    {
      business: z.string().describe('Business name'),
    },
    async (params) => {
      const biz = db.prepare('SELECT * FROM businesses WHERE name LIKE ?').get(`%${params.business}%`) as {
        id: number; name: string; industry: string; location: string;
      } | undefined;

      if (!biz) {
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({ error: `No business found matching "${params.business}"` }),
          }],
        };
      }

      const breakdown = computeSentimentBreakdown(biz.id);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            business: { name: biz.name, industry: biz.industry, location: biz.location },
            sentiment: breakdown,
          }, null, 2),
        }],
      };
    },
  );
}
