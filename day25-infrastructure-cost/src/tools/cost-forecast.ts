import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerCostForecast(server: McpServer) {
  server.tool(
    'cost_forecast',
    'View cost forecasts for the next 1–3 months — predicted spend per provider with confidence intervals, trend analysis, and budget comparison.',
    {
      provider: z.string().optional().describe('Provider name to filter by'),
      months: z.number().optional().default(3).describe('Number of months to forecast (1-3)'),
    },
    async (params) => {
      let sql = `
        SELECT f.*, p.name as provider_name, p.monthly_budget
        FROM forecasts f
        JOIN providers p ON f.provider_id = p.id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.provider) {
        sql += ' AND p.name LIKE ?';
        args.push(`%${params.provider}%`);
      }

      sql += ' ORDER BY f.month ASC LIMIT ?';
      args.push((params.months || 3) * 4); // up to 4 providers × N months

      const forecasts = db.prepare(sql).all(...args) as Array<{
        id: number; provider_id: number; month: string; predicted_amount: number;
        confidence_low: number; confidence_high: number; method: string;
        provider_name: string; monthly_budget: number;
      }>;

      // Group by month
      const byMonth: Record<string, Array<{
        provider: string; predicted: number; low: number; high: number;
        budget: number; over_budget: boolean; overage: number;
      }>> = {};

      for (const f of forecasts) {
        if (!byMonth[f.month]) byMonth[f.month] = [];
        byMonth[f.month].push({
          provider: f.provider_name,
          predicted: f.predicted_amount,
          low: f.confidence_low,
          high: f.confidence_high,
          budget: f.monthly_budget,
          over_budget: f.predicted_amount > f.monthly_budget,
          overage: Math.max(0, f.predicted_amount - f.monthly_budget),
        });
      }

      const monthSummaries = Object.entries(byMonth).map(([month, providers]) => ({
        month,
        total_predicted: providers.reduce((s, p) => s + p.predicted, 0),
        total_budget: providers.reduce((s, p) => s + p.budget, 0),
        total_overage: providers.reduce((s, p) => s + p.overage, 0),
        providers,
      }));

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            forecast_months: monthSummaries.length,
            method: 'linear_trend',
            monthly_forecasts: monthSummaries,
          }, null, 2),
        }],
      };
    },
  );
}
