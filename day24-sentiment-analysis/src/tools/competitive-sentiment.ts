import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import db from '../database.js';
import { computeSentimentBreakdown } from '../scoring.js';

export function registerCompetitiveSentiment(server: McpServer) {
  server.tool(
    'competitive_sentiment',
    'Compare sentiment across all tracked businesses — side-by-side scores, ratings, review volume, and top strengths/weaknesses for each.',
    {},
    async () => {
      const businesses = db.prepare('SELECT * FROM businesses ORDER BY name').all() as Array<{
        id: number; name: string; industry: string; location: string;
      }>;

      const comparisons = businesses.map(biz => {
        const breakdown = computeSentimentBreakdown(biz.id);

        const strengths = db.prepare(
          `SELECT name, avg_sentiment, mention_count FROM themes
           WHERE business_id = ? AND avg_sentiment > 0.3
           ORDER BY mention_count DESC LIMIT 2`
        ).all(biz.id);

        const weaknesses = db.prepare(
          `SELECT name, avg_sentiment, mention_count FROM themes
           WHERE business_id = ? AND avg_sentiment < -0.2
           ORDER BY mention_count DESC LIMIT 2`
        ).all(biz.id);

        return {
          business: biz.name,
          industry: biz.industry,
          location: biz.location,
          overall_sentiment: breakdown.overall,
          sentiment_label: breakdown.label,
          total_reviews: breakdown.totalReviews,
          avg_rating: breakdown.avgRating,
          positive_pct: breakdown.positivePct,
          negative_pct: breakdown.negativePct,
          top_strengths: strengths,
          top_weaknesses: weaknesses,
        };
      });

      // Sort by overall sentiment
      comparisons.sort((a, b) => b.overall_sentiment - a.overall_sentiment);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            businesses_compared: comparisons.length,
            rankings: comparisons,
          }, null, 2),
        }],
      };
    },
  );
}
