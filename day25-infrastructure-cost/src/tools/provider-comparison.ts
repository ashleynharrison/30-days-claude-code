import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import db from '../database.js';

export function registerProviderComparison(server: McpServer) {
  server.tool(
    'provider_comparison',
    'Compare cloud providers side by side — total spend, service count, cost per category, budget utilization, anomaly count, and cost trends.',
    {},
    async () => {
      const providers = db.prepare('SELECT * FROM providers ORDER BY monthly_budget DESC').all() as Array<{
        id: number; name: string; slug: string; monthly_budget: number;
      }>;

      const comparisons = providers.map(p => {
        // Total spend (last 30 days)
        const last30 = db.prepare(`
          SELECT SUM(cr.amount) as total
          FROM cost_records cr
          JOIN services s ON cr.service_id = s.id
          WHERE s.provider_id = ? AND cr.date >= date('2026-03-26', '-30 days')
        `).get(p.id) as { total: number };

        // Previous 30 days for comparison
        const prev30 = db.prepare(`
          SELECT SUM(cr.amount) as total
          FROM cost_records cr
          JOIN services s ON cr.service_id = s.id
          WHERE s.provider_id = ? AND cr.date >= date('2026-03-26', '-60 days') AND cr.date < date('2026-03-26', '-30 days')
        `).get(p.id) as { total: number };

        const momChange = prev30.total > 0
          ? ((last30.total - prev30.total) / prev30.total) * 100 : 0;

        // Cost by category
        const byCategory = db.prepare(`
          SELECT s.category, SUM(cr.amount) as total
          FROM cost_records cr
          JOIN services s ON cr.service_id = s.id
          WHERE s.provider_id = ? AND cr.date >= date('2026-03-26', '-30 days')
          GROUP BY s.category ORDER BY total DESC
        `).all(p.id) as Array<{ category: string; total: number }>;

        // Service count
        const serviceCount = db.prepare('SELECT COUNT(*) as cnt FROM services WHERE provider_id = ?').get(p.id) as { cnt: number };

        // Unresolved anomalies
        const anomalyCount = db.prepare(`
          SELECT COUNT(*) as cnt FROM anomalies a
          JOIN services s ON a.service_id = s.id
          WHERE s.provider_id = ? AND a.resolved = 0
        `).get(p.id) as { cnt: number };

        // Current month budget
        const budget = db.prepare(`
          SELECT * FROM budgets WHERE provider_id = ? AND month = '2026-03'
        `).get(p.id) as { budget: number; actual: number; forecast: number } | undefined;

        return {
          provider: p.name,
          last_30_days: Math.round(last30.total * 100) / 100,
          prev_30_days: Math.round(prev30.total * 100) / 100,
          mom_change_pct: Math.round(momChange * 10) / 10,
          services: serviceCount.cnt,
          unresolved_anomalies: anomalyCount.cnt,
          monthly_budget: p.monthly_budget,
          budget_utilization_pct: budget ? Math.round((budget.actual / budget.budget) * 1000) / 10 : 0,
          forecast: budget?.forecast || 0,
          cost_by_category: byCategory.map(c => ({
            category: c.category,
            total: Math.round(c.total * 100) / 100,
          })),
        };
      });

      const totalSpend = comparisons.reduce((s, c) => s + c.last_30_days, 0);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            total_spend_30d: Math.round(totalSpend * 100) / 100,
            providers_compared: comparisons.length,
            providers: comparisons.map(c => ({
              ...c,
              pct_of_total: Math.round((c.last_30_days / totalSpend) * 1000) / 10,
            })),
          }, null, 2),
        }],
      };
    },
  );
}
