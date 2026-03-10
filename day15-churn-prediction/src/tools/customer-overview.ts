import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';
import { computeChurnScore } from '../scoring.js';

export function registerCustomerOverview(server: McpServer) {
  server.tool(
    'customer_overview',
    'Search customers by name, company, plan, status, or industry. Returns profile info with current churn risk score.',
    {
      query: z.string().optional().describe('Search by name or company'),
      plan: z.enum(['starter', 'pro', 'enterprise']).optional(),
      status: z.enum(['active', 'churned']).optional(),
      industry: z.string().optional(),
    },
    async (params) => {
      let sql = 'SELECT * FROM customers WHERE 1=1';
      const args: unknown[] = [];

      if (params.query) {
        sql += ' AND (name LIKE ? OR company LIKE ?)';
        args.push(`%${params.query}%`, `%${params.query}%`);
      }
      if (params.plan) { sql += ' AND plan = ?'; args.push(params.plan); }
      if (params.status) { sql += ' AND status = ?'; args.push(params.status); }
      if (params.industry) { sql += ' AND industry LIKE ?'; args.push(`%${params.industry}%`); }

      sql += ' ORDER BY mrr DESC';

      const rows = db.prepare(sql).all(...args) as Array<{
        id: number; name: string; email: string; company: string;
        plan: string; mrr: number; signup_date: string; last_login: string;
        status: string; industry: string; employee_count: number;
      }>;

      const results = rows.map(row => {
        const score = computeChurnScore(row.id);
        return {
          ...row,
          churn_risk: {
            score: score.score,
            level: score.riskLevel,
            top_factors: score.topFactors,
          },
        };
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ customers: results, count: results.length }, null, 2),
        }],
      };
    },
  );
}
