import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';
import { computeChurnScore } from '../scoring.js';

export function registerChurnRiskScore(server: McpServer) {
  server.tool(
    'churn_risk_score',
    'Get detailed churn risk breakdown for a specific customer. Shows score components: usage, billing, support, and engagement signals with contributing factors.',
    {
      customer_id: z.number().describe('Customer ID'),
    },
    async (params) => {
      const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(params.customer_id) as {
        id: number; name: string; company: string; plan: string; mrr: number;
        signup_date: string; last_login: string; status: string;
      } | undefined;

      if (!customer) {
        return { content: [{ type: 'text' as const, text: 'Customer not found' }] };
      }

      const score = computeChurnScore(params.customer_id);

      // Store the computed score
      db.prepare(`
        INSERT INTO risk_scores (customer_id, score, risk_level, usage_signal, billing_signal, support_signal, engagement_signal, top_factors)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        params.customer_id, score.score, score.riskLevel,
        score.usageSignal, score.billingSignal, score.supportSignal, score.engagementSignal,
        JSON.stringify(score.topFactors),
      );

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            customer: {
              id: customer.id,
              name: customer.name,
              company: customer.company,
              plan: customer.plan,
              mrr: customer.mrr,
              status: customer.status,
            },
            risk: {
              overall_score: score.score,
              risk_level: score.riskLevel,
              signals: {
                usage: { score: score.usageSignal, max: 30 },
                billing: { score: score.billingSignal, max: 25 },
                support: { score: score.supportSignal, max: 25 },
                engagement: { score: score.engagementSignal, max: 20 },
              },
              top_factors: score.topFactors,
            },
          }, null, 2),
        }],
      };
    },
  );
}
