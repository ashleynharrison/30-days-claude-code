import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerThemeAnalysis(server: McpServer) {
  server.tool(
    'theme_analysis',
    'Analyze themes/topics for a business — what customers talk about most, average sentiment per theme, and trend direction (improving, declining, stable).',
    {
      business: z.string().describe('Business name'),
      category: z.string().optional().describe('Filter by category (service, facility, product, pricing, experience, etc.)'),
      sort_by: z.enum(['mentions', 'sentiment', 'name']).optional().default('mentions'),
    },
    async (params) => {
      const biz = db.prepare('SELECT * FROM businesses WHERE name LIKE ?').get(`%${params.business}%`) as {
        id: number; name: string;
      } | undefined;

      if (!biz) {
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({ error: `No business found matching "${params.business}"` }),
          }],
        };
      }

      let sql = 'SELECT * FROM themes WHERE business_id = ?';
      const args: unknown[] = [biz.id];

      if (params.category) {
        sql += ' AND category = ?';
        args.push(params.category);
      }

      switch (params.sort_by) {
        case 'sentiment': sql += ' ORDER BY avg_sentiment DESC'; break;
        case 'name': sql += ' ORDER BY name ASC'; break;
        default: sql += ' ORDER BY mention_count DESC';
      }

      const themes = db.prepare(sql).all(...args);

      // Get sample reviews for top themes
      const themesWithSamples = (themes as Array<{ id: number; name: string; category: string; mention_count: number; avg_sentiment: number; trend: string }>).map(theme => {
        const samples = db.prepare(`
          SELECT r.text, r.sentiment_score, r.rating, r.author, r.date
          FROM reviews r
          JOIN review_themes rt ON r.id = rt.review_id
          WHERE rt.theme_id = ?
          ORDER BY rt.relevance DESC
          LIMIT 2
        `).all(theme.id);

        return { ...theme, sample_reviews: samples };
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            business: biz.name,
            themes: themesWithSamples,
            count: themesWithSamples.length,
          }, null, 2),
        }],
      };
    },
  );
}
