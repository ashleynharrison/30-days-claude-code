import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import db from '../database.js';
import { computeChurnScore } from '../scoring.js';

export function registerPipelineSummary(server: McpServer) {
  server.tool(
    'pipeline_summary',
    'Overall churn pipeline — risk distribution, revenue at risk, average scores by plan, and recent churn. The executive dashboard view.',
    {},
    async () => {
      const customers = db.prepare('SELECT * FROM customers').all() as Array<{
        id: number; name: string; company: string; plan: string;
        mrr: number; status: string;
      }>;

      const active = customers.filter(c => c.status === 'active');
      const churned = customers.filter(c => c.status === 'churned');

      const scored = active.map(c => ({
        ...c,
        ...computeChurnScore(c.id),
      }));

      const byLevel: Record<string, typeof scored> = {
        critical: scored.filter(s => s.riskLevel === 'critical'),
        high: scored.filter(s => s.riskLevel === 'high'),
        medium: scored.filter(s => s.riskLevel === 'medium'),
        low: scored.filter(s => s.riskLevel === 'low'),
      };

      const totalMrr = active.reduce((sum, c) => sum + c.mrr, 0);
      const atRiskMrr = [...byLevel.critical, ...byLevel.high].reduce((sum, c) => sum + c.mrr, 0);

      // By plan
      const plans = ['starter', 'pro', 'enterprise'];
      const byPlan = plans.map(plan => {
        const planCustomers = scored.filter(s => s.plan === plan);
        return {
          plan,
          count: planCustomers.length,
          avg_score: planCustomers.length > 0
            ? Math.round(planCustomers.reduce((s, c) => s + c.score, 0) / planCustomers.length)
            : 0,
          mrr: planCustomers.reduce((s, c) => s + c.mrr, 0),
        };
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            pipeline: {
              total_active: active.length,
              total_churned: churned.length,
              total_mrr: totalMrr,
              mrr_at_risk: atRiskMrr,
              pct_revenue_at_risk: totalMrr > 0 ? Math.round((atRiskMrr / totalMrr) * 100) : 0,
            },
            risk_distribution: {
              critical: { count: byLevel.critical.length, customers: byLevel.critical.map(c => ({ name: c.name, company: c.company, score: c.score, mrr: c.mrr })) },
              high: { count: byLevel.high.length, customers: byLevel.high.map(c => ({ name: c.name, company: c.company, score: c.score, mrr: c.mrr })) },
              medium: { count: byLevel.medium.length, customers: byLevel.medium.map(c => ({ name: c.name, company: c.company, score: c.score, mrr: c.mrr })) },
              low: { count: byLevel.low.length, customers: byLevel.low.map(c => ({ name: c.name, company: c.company, score: c.score, mrr: c.mrr })) },
            },
            by_plan: byPlan,
            recently_churned: churned.map(c => ({
              name: c.name,
              company: c.company,
              plan: c.plan,
            })),
            avg_score: scored.length > 0
              ? Math.round(scored.reduce((s, c) => s + c.score, 0) / scored.length)
              : 0,
          }, null, 2),
        }],
      };
    },
  );
}
