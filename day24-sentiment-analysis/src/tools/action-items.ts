import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerActionItems(server: McpServer) {
  server.tool(
    'action_items',
    'Generate prioritized action items for a business based on negative themes, declining trends, and recurring complaints. Includes supporting review evidence.',
    {
      business: z.string().describe('Business name'),
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

      // Find declining or negative themes
      const problemThemes = db.prepare(`
        SELECT * FROM themes
        WHERE business_id = ? AND (avg_sentiment < -0.1 OR trend = 'declining')
        ORDER BY mention_count DESC
      `).all(biz.id) as Array<{
        id: number; name: string; category: string; mention_count: number;
        avg_sentiment: number; trend: string;
      }>;

      const actions = problemThemes.map((theme, index) => {
        // Get negative reviews for this theme
        const negativeReviews = db.prepare(`
          SELECT r.text, r.author, r.date, r.rating, r.sentiment_score
          FROM reviews r
          JOIN review_themes rt ON r.id = rt.review_id
          WHERE rt.theme_id = ? AND r.sentiment_label = 'negative'
          ORDER BY r.date DESC
          LIMIT 3
        `).all(theme.id);

        // Generate priority based on mention count and sentiment severity
        let priority: string;
        const severity = Math.abs(theme.avg_sentiment) * theme.mention_count;
        if (severity > 3 || theme.trend === 'declining') priority = 'high';
        else if (severity > 1.5) priority = 'medium';
        else priority = 'low';

        // Generate action recommendation
        let recommendation: string;
        switch (theme.category) {
          case 'service':
            recommendation = `Address ${theme.name.toLowerCase()} through staff training, process review, and customer feedback loops.`;
            break;
          case 'facility':
            recommendation = `Schedule maintenance audit for ${theme.name.toLowerCase()}. Consider capital improvement budget allocation.`;
            break;
          case 'pricing':
            recommendation = `Review ${theme.name.toLowerCase()} strategy. Consider value-add offerings rather than price cuts.`;
            break;
          case 'technology':
            recommendation = `Prioritize ${theme.name.toLowerCase()} fixes in next sprint. User experience directly impacts retention.`;
            break;
          default:
            recommendation = `Investigate root causes for ${theme.name.toLowerCase()} complaints. Assign owner and set improvement target.`;
        }

        return {
          priority_rank: index + 1,
          priority,
          theme: theme.name,
          category: theme.category,
          avg_sentiment: theme.avg_sentiment,
          trend: theme.trend,
          mentions: theme.mention_count,
          recommendation,
          evidence: negativeReviews,
        };
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            business: biz.name,
            action_items: actions,
            total_issues: actions.length,
            high_priority: actions.filter(a => a.priority === 'high').length,
          }, null, 2),
        }],
      };
    },
  );
}
