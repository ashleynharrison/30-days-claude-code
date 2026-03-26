import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerServiceCosts(server: McpServer) {
  server.tool(
    'service_costs',
    'Drill into a specific service — daily cost history, usage metrics, trends, and month-over-month changes.',
    {
      service: z.string().describe('Service name (e.g., EC2 Instances, BigQuery, Cloud Run)'),
      days: z.number().optional().default(30).describe('Number of days to look back'),
    },
    async (params) => {
      const svc = db.prepare(`
        SELECT s.*, p.name as provider_name
        FROM services s JOIN providers p ON s.provider_id = p.id
        WHERE s.name LIKE ?
      `).get(`%${params.service}%`) as {
        id: number; name: string; category: string; description: string; provider_name: string;
      } | undefined;

      if (!svc) {
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({ error: `No service found matching "${params.service}"` }),
          }],
        };
      }

      const records = db.prepare(`
        SELECT date, amount, usage_quantity, usage_unit
        FROM cost_records WHERE service_id = ?
        ORDER BY date DESC LIMIT ?
      `).all(svc.id, params.days) as Array<{
        date: string; amount: number; usage_quantity: number; usage_unit: string;
      }>;

      const total = records.reduce((sum, r) => sum + r.amount, 0);
      const avg = total / records.length;
      const max = Math.max(...records.map(r => r.amount));
      const min = Math.min(...records.map(r => r.amount));

      // Calculate trend
      const half = Math.floor(records.length / 2);
      const recentHalf = records.slice(0, half);
      const olderHalf = records.slice(half);
      const recentAvg = recentHalf.reduce((s, r) => s + r.amount, 0) / recentHalf.length;
      const olderAvg = olderHalf.reduce((s, r) => s + r.amount, 0) / olderHalf.length;
      const trendPct = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

      let trendDirection = 'stable';
      if (trendPct > 5) trendDirection = 'increasing';
      else if (trendPct < -5) trendDirection = 'decreasing';

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            service: svc.name,
            provider: svc.provider_name,
            category: svc.category,
            description: svc.description,
            period: { days: records.length },
            summary: {
              total: Math.round(total * 100) / 100,
              daily_avg: Math.round(avg * 100) / 100,
              max: Math.round(max * 100) / 100,
              min: Math.round(min * 100) / 100,
              trend: trendDirection,
              trend_pct: Math.round(trendPct * 10) / 10,
            },
            daily_records: records.reverse(),
          }, null, 2),
        }],
      };
    },
  );
}
