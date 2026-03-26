import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerBudgetStatus(server: McpServer) {
  server.tool(
    'budget_status',
    'Check budget status across all providers or a specific one — actual vs. budget, burn rate, projected overage, and month-over-month comparison.',
    {
      provider: z.string().optional().describe('Provider name to filter by'),
      month: z.string().optional().describe('Month (YYYY-MM), defaults to current month'),
    },
    async (params) => {
      const month = params.month || '2026-03';

      let sql = `
        SELECT b.*, p.name as provider_name, p.monthly_budget as default_budget
        FROM budgets b
        JOIN providers p ON b.provider_id = p.id
        WHERE b.month = ?
      `;
      const args: unknown[] = [month];

      if (params.provider) {
        sql += ' AND p.name LIKE ?';
        args.push(`%${params.provider}%`);
      }

      const budgets = db.prepare(sql).all(...args) as Array<{
        id: number; provider_id: number; month: string; budget: number;
        actual: number; forecast: number; provider_name: string; default_budget: number;
      }>;

      // Get previous month for comparison
      const prevMonth = month === '2026-03' ? '2026-02' : '2026-01';
      const prevBudgets = db.prepare(`
        SELECT b.provider_id, b.actual FROM budgets b WHERE b.month = ?
      `).all(prevMonth) as Array<{ provider_id: number; actual: number }>;
      const prevMap = new Map(prevBudgets.map(b => [b.provider_id, b.actual]));

      const results = budgets.map(b => {
        const utilizationPct = (b.actual / b.budget) * 100;
        const forecastOverage = b.forecast > b.budget ? b.forecast - b.budget : 0;
        const prevActual = prevMap.get(b.provider_id) || 0;
        const momChange = prevActual > 0 ? ((b.forecast - prevActual) / prevActual) * 100 : 0;

        let status: string;
        if (utilizationPct > 95) status = 'over_budget';
        else if (b.forecast > b.budget) status = 'projected_overage';
        else if (utilizationPct > 80) status = 'on_track';
        else status = 'under_budget';

        return {
          provider: b.provider_name,
          month: b.month,
          budget: b.budget,
          actual: b.actual,
          forecast: b.forecast,
          utilization_pct: Math.round(utilizationPct * 10) / 10,
          forecast_overage: Math.round(forecastOverage * 100) / 100,
          mom_change_pct: Math.round(momChange * 10) / 10,
          status,
        };
      });

      const totalBudget = results.reduce((s, r) => s + r.budget, 0);
      const totalActual = results.reduce((s, r) => s + r.actual, 0);
      const totalForecast = results.reduce((s, r) => s + r.forecast, 0);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            month,
            totals: {
              budget: totalBudget,
              actual: totalActual,
              forecast: totalForecast,
              utilization_pct: Math.round((totalActual / totalBudget) * 1000) / 10,
              forecast_overage: totalForecast > totalBudget ? Math.round((totalForecast - totalBudget) * 100) / 100 : 0,
            },
            providers: results,
          }, null, 2),
        }],
      };
    },
  );
}
