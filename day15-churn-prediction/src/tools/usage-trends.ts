import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerUsageTrends(server: McpServer) {
  server.tool(
    'usage_trends',
    'View weekly usage patterns for a customer — logins, API calls, features used, active users, session time. Shows trend direction.',
    {
      customer_id: z.number().describe('Customer ID'),
    },
    async (params) => {
      const customer = db.prepare('SELECT name, company FROM customers WHERE id = ?').get(params.customer_id) as {
        name: string; company: string;
      } | undefined;

      if (!customer) {
        return { content: [{ type: 'text' as const, text: 'Customer not found' }] };
      }

      const metrics = db.prepare(
        'SELECT * FROM usage_metrics WHERE customer_id = ? ORDER BY week_start ASC'
      ).all(params.customer_id) as Array<{
        week_start: string; logins: number; api_calls: number;
        features_used: number; active_users: number; session_minutes: number;
      }>;

      if (metrics.length === 0) {
        return { content: [{ type: 'text' as const, text: `No usage data for ${customer.name} (${customer.company})` }] };
      }

      // Compute trend
      const half = Math.floor(metrics.length / 2);
      const firstHalf = metrics.slice(0, half);
      const secondHalf = metrics.slice(half);

      const avgLogins1 = avg(firstHalf.map(m => m.logins));
      const avgLogins2 = avg(secondHalf.map(m => m.logins));
      const loginChange = avgLogins1 > 0 ? ((avgLogins2 - avgLogins1) / avgLogins1) * 100 : 0;

      const avgApi1 = avg(firstHalf.map(m => m.api_calls));
      const avgApi2 = avg(secondHalf.map(m => m.api_calls));
      const apiChange = avgApi1 > 0 ? ((avgApi2 - avgApi1) / avgApi1) * 100 : 0;

      let trendDirection: string;
      if (loginChange > 10) trendDirection = 'growing';
      else if (loginChange < -25) trendDirection = 'declining';
      else trendDirection = 'stable';

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            customer: customer.name,
            company: customer.company,
            trend: trendDirection,
            login_change_pct: Math.round(loginChange),
            api_change_pct: Math.round(apiChange),
            weekly_data: metrics,
          }, null, 2),
        }],
      };
    },
  );
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
