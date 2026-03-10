import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';
import { computeChurnScore } from '../scoring.js';

export function registerInterventionRecommendations(server: McpServer) {
  server.tool(
    'intervention_recommendations',
    'Get recommended actions for an at-risk customer based on their churn risk factors. Prioritized by impact.',
    {
      customer_id: z.number().describe('Customer ID'),
    },
    async (params) => {
      const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(params.customer_id) as {
        id: number; name: string; company: string; plan: string;
        mrr: number; status: string;
      } | undefined;

      if (!customer) {
        return { content: [{ type: 'text' as const, text: 'Customer not found' }] };
      }

      const score = computeChurnScore(params.customer_id);
      const recommendations: Array<{ action: string; priority: string; reason: string; owner: string }> = [];

      // Usage-based recommendations
      if (score.usageSignal >= 10) {
        recommendations.push({
          action: 'Schedule a product re-engagement call',
          priority: 'high',
          reason: 'Usage has dropped significantly — they may not be getting value',
          owner: 'Customer Success',
        });
        recommendations.push({
          action: 'Send personalized feature walkthrough',
          priority: 'medium',
          reason: 'Low feature adoption suggests untapped value',
          owner: 'Customer Success',
        });
      }

      // Billing-based recommendations
      if (score.topFactors.some(f => f.includes('failed payment'))) {
        recommendations.push({
          action: 'Contact about payment method update',
          priority: 'urgent',
          reason: 'Failed payments will lead to involuntary churn',
          owner: 'Billing',
        });
      }
      if (score.topFactors.some(f => f.includes('Downgraded'))) {
        recommendations.push({
          action: 'Offer value-add features at current price point',
          priority: 'high',
          reason: 'Downgrade signals they question the ROI',
          owner: 'Account Executive',
        });
      }
      if (score.topFactors.some(f => f.includes('cancellation'))) {
        recommendations.push({
          action: 'Executive outreach — understand root cause',
          priority: 'urgent',
          reason: 'Cancellation request is the last signal before churn',
          owner: 'VP Customer Success',
        });
      }
      if (score.topFactors.some(f => f.includes('discount'))) {
        recommendations.push({
          action: 'Prepare retention offer (annual discount or feature unlock)',
          priority: 'high',
          reason: 'Price sensitivity — need to demonstrate value or adjust pricing',
          owner: 'Account Executive',
        });
      }

      // Support-based recommendations
      if (score.supportSignal >= 8) {
        recommendations.push({
          action: 'Assign dedicated support engineer',
          priority: 'high',
          reason: 'High ticket volume and/or low satisfaction indicate product friction',
          owner: 'Support Lead',
        });
      }
      if (score.topFactors.some(f => f.includes('escalation'))) {
        recommendations.push({
          action: 'Executive sponsor check-in',
          priority: 'urgent',
          reason: 'Escalations indicate relationship damage',
          owner: 'VP Customer Success',
        });
      }

      // Engagement-based recommendations
      if (score.engagementSignal >= 6) {
        recommendations.push({
          action: 'Send "we miss you" outreach with quick win content',
          priority: 'medium',
          reason: 'Extended inactivity — re-engage before they forget about the product',
          owner: 'Customer Success',
        });
      }

      // Low risk — proactive
      if (recommendations.length === 0) {
        recommendations.push({
          action: 'Continue regular QBR cadence',
          priority: 'low',
          reason: 'Customer is healthy — maintain the relationship',
          owner: 'Customer Success',
        });
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            customer: { id: customer.id, name: customer.name, company: customer.company },
            risk: { score: score.score, level: score.riskLevel },
            recommendations: recommendations.sort((a, b) => {
              const prio: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
              return (prio[a.priority] ?? 4) - (prio[b.priority] ?? 4);
            }),
            estimated_revenue_at_risk: customer.mrr * 12,
          }, null, 2),
        }],
      };
    },
  );
}
