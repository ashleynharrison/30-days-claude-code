import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';
import { computeChurnScore } from '../scoring.js';

export function registerAtRiskCohort(server: McpServer) {
  server.tool(
    'at_risk_cohort',
    'List all customers sorted by churn risk. Filter by risk level or minimum score. Shows revenue at risk.',
    {
      min_risk_level: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Minimum risk level to include'),
      min_score: z.number().optional().describe('Minimum churn score (0-100)'),
      status: z.enum(['active', 'churned', 'all']).optional().describe('Filter by status (default: active)'),
    },
    async (params) => {
      const statusFilter = params.status || 'active';
      let sql = 'SELECT * FROM customers';
      if (statusFilter !== 'all') {
        sql += ` WHERE status = '${statusFilter}'`;
      }

      const customers = db.prepare(sql).all() as Array<{
        id: number; name: string; company: string; plan: string;
        mrr: number; status: string; industry: string;
      }>;

      const riskLevelOrder: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };
      const minLevel = params.min_risk_level ? riskLevelOrder[params.min_risk_level] : 0;
      const minScore = params.min_score ?? 0;

      const scored = customers
        .map(c => {
          const score = computeChurnScore(c.id);
          return { ...c, ...score };
        })
        .filter(c => riskLevelOrder[c.riskLevel] >= minLevel && c.score >= minScore)
        .sort((a, b) => b.score - a.score);

      const totalMrrAtRisk = scored
        .filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical')
        .reduce((sum, c) => sum + c.mrr, 0);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            cohort: scored.map(c => ({
              id: c.id,
              name: c.name,
              company: c.company,
              plan: c.plan,
              mrr: c.mrr,
              score: c.score,
              risk_level: c.riskLevel,
              top_factors: c.topFactors,
            })),
            summary: {
              total_customers: scored.length,
              mrr_at_risk: totalMrrAtRisk,
              by_level: {
                critical: scored.filter(c => c.riskLevel === 'critical').length,
                high: scored.filter(c => c.riskLevel === 'high').length,
                medium: scored.filter(c => c.riskLevel === 'medium').length,
                low: scored.filter(c => c.riskLevel === 'low').length,
              },
            },
          }, null, 2),
        }],
      };
    },
  );
}
