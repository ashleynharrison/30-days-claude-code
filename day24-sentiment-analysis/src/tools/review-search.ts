import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerReviewSearch(server: McpServer) {
  server.tool(
    'review_search',
    'Search reviews by business, source, rating, sentiment, date range, or keyword. Returns review text with sentiment scores.',
    {
      business: z.string().optional().describe('Business name to filter by'),
      source: z.string().optional().describe('Source platform (Google Reviews, Yelp, TripAdvisor, etc.)'),
      sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
      min_rating: z.number().min(1).max(5).optional(),
      max_rating: z.number().min(1).max(5).optional(),
      keyword: z.string().optional().describe('Search review text for a keyword'),
      limit: z.number().optional().default(20),
    },
    async (params) => {
      let sql = `
        SELECT r.*, b.name as business_name, s.name as source_name
        FROM reviews r
        JOIN businesses b ON r.business_id = b.id
        JOIN sources s ON r.source_id = s.id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.business) {
        sql += ' AND b.name LIKE ?';
        args.push(`%${params.business}%`);
      }
      if (params.source) {
        sql += ' AND s.name LIKE ?';
        args.push(`%${params.source}%`);
      }
      if (params.sentiment) {
        sql += ' AND r.sentiment_label = ?';
        args.push(params.sentiment);
      }
      if (params.min_rating) {
        sql += ' AND r.rating >= ?';
        args.push(params.min_rating);
      }
      if (params.max_rating) {
        sql += ' AND r.rating <= ?';
        args.push(params.max_rating);
      }
      if (params.keyword) {
        sql += ' AND r.text LIKE ?';
        args.push(`%${params.keyword}%`);
      }

      sql += ' ORDER BY r.date DESC LIMIT ?';
      args.push(params.limit);

      const rows = db.prepare(sql).all(...args);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ reviews: rows, count: (rows as unknown[]).length }, null, 2),
        }],
      };
    },
  );
}
