import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerTrendTracker(server: McpServer) {
  server.tool(
    'trend_tracker',
    'Track sentiment trends over time for a business — weekly sentiment scores, review volume, positive/negative split, and top themes each week.',
    {
      business: z.string().describe('Business name'),
      weeks: z.number().optional().default(6).describe('Number of weeks to look back'),
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

      const snapshots = db.prepare(`
        SELECT * FROM sentiment_snapshots
        WHERE business_id = ?
        ORDER BY week_start DESC
        LIMIT ?
      `).all(biz.id, params.weeks) as Array<{
        week_start: string; avg_sentiment: number; review_count: number;
        positive_pct: number; neutral_pct: number; negative_pct: number;
        top_positive_theme: string; top_negative_theme: string;
      }>;

      // Calculate trend direction
      let trendDirection = 'stable';
      if (snapshots.length >= 2) {
        const recent = snapshots[0].avg_sentiment;
        const older = snapshots[snapshots.length - 1].avg_sentiment;
        const diff = recent - older;
        if (diff > 0.1) trendDirection = 'improving';
        else if (diff < -0.1) trendDirection = 'declining';
      }

      const totalReviews = snapshots.reduce((sum, s) => sum + s.review_count, 0);
      const avgSentiment = snapshots.length > 0
        ? Math.round((snapshots.reduce((sum, s) => sum + s.avg_sentiment, 0) / snapshots.length) * 100) / 100
        : 0;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            business: biz.name,
            period: {
              weeks: snapshots.length,
              total_reviews: totalReviews,
              avg_sentiment: avgSentiment,
              trend: trendDirection,
            },
            weekly_snapshots: snapshots.reverse(),
          }, null, 2),
        }],
      };
    },
  );
}
