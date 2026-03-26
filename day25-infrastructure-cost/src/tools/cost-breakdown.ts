import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerCostBreakdown(server: McpServer) {
  server.tool(
    'cost_breakdown',
    'Get a breakdown of cloud costs by provider, category, or date range. Shows total spend, daily averages, and per-service totals.',
    {
      provider: z.string().optional().describe('Provider name (AWS, GCP, Azure, Vercel)'),
      category: z.string().optional().describe('Service category (compute, database, storage, network, analytics, ai, messaging)'),
      start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
    },
    async (params) => {
      let sql = `
        SELECT p.name as provider, s.name as service, s.category,
               SUM(cr.amount) as total, AVG(cr.amount) as daily_avg,
               COUNT(cr.id) as days
        FROM cost_records cr
        JOIN services s ON cr.service_id = s.id
        JOIN providers p ON s.provider_id = p.id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.provider) {
        sql += ' AND p.name LIKE ?';
        args.push(`%${params.provider}%`);
      }
      if (params.category) {
        sql += ' AND s.category = ?';
        args.push(params.category);
      }
      if (params.start_date) {
        sql += ' AND cr.date >= ?';
        args.push(params.start_date);
      }
      if (params.end_date) {
        sql += ' AND cr.date <= ?';
        args.push(params.end_date);
      }

      sql += ' GROUP BY s.id ORDER BY total DESC';

      const rows = db.prepare(sql).all(...args) as Array<{
        provider: string; service: string; category: string;
        total: number; daily_avg: number; days: number;
      }>;

      const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

      // Group by provider
      const byProvider: Record<string, { total: number; services: typeof rows }> = {};
      for (const row of rows) {
        if (!byProvider[row.provider]) byProvider[row.provider] = { total: 0, services: [] };
        byProvider[row.provider].total += row.total;
        byProvider[row.provider].services.push(row);
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            grand_total: Math.round(grandTotal * 100) / 100,
            by_provider: Object.entries(byProvider).map(([name, data]) => ({
              provider: name,
              total: Math.round(data.total * 100) / 100,
              pct_of_total: Math.round((data.total / grandTotal) * 1000) / 10,
              services: data.services.map(s => ({
                service: s.service,
                category: s.category,
                total: Math.round(s.total * 100) / 100,
                daily_avg: Math.round(s.daily_avg * 100) / 100,
                days: s.days,
              })),
            })),
          }, null, 2),
        }],
      };
    },
  );
}
