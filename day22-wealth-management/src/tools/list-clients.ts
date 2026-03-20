import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerListClients(server: McpServer) {
  server.tool(
    'list_clients',
    'List and search wealth management clients. Shows portfolio summary, risk profile, and advisor assignment for each client.',
    {
      search: z.string().optional().describe('Search by client name or email (partial match)'),
      risk_profile: z.string().optional().describe('Filter by risk profile: conservative, moderate, moderate-aggressive, aggressive'),
      advisor: z.string().optional().describe('Filter by advisor name (partial match)'),
    },
    async ({ search, risk_profile, advisor }) => {
      let query = `SELECT * FROM clients WHERE 1=1`;
      const params: any[] = [];

      if (search) {
        query += ` AND (name LIKE ? OR email LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }
      if (risk_profile) {
        query += ` AND risk_profile = ?`;
        params.push(risk_profile);
      }
      if (advisor) {
        query += ` AND advisor LIKE ?`;
        params.push(`%${advisor}%`);
      }

      query += ` ORDER BY total_invested DESC`;

      const clients = db.prepare(query).all(...params) as any[];

      if (clients.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No clients found matching your criteria.' }] };
      }

      // Get account and holdings summaries for each client
      const result = clients.map((c) => {
        const accounts = db.prepare(`SELECT * FROM accounts WHERE client_id = ?`).all(c.id) as any[];
        const accountIds = accounts.map((a: any) => a.id);

        let totalMarketValue = 0;
        let totalCostBasis = 0;
        let totalCash = 0;

        for (const acc of accounts) {
          totalCash += acc.cash_balance;
          const holdings = db.prepare(`SELECT * FROM holdings WHERE account_id = ?`).all(acc.id) as any[];
          for (const h of holdings) {
            totalMarketValue += h.shares * h.current_price;
            totalCostBasis += h.shares * h.cost_basis;
          }
        }

        totalMarketValue += totalCash;
        const unrealizedGain = totalMarketValue - totalCostBasis - totalCash;
        const unrealizedPct = totalCostBasis > 0 ? ((unrealizedGain / totalCostBasis) * 100).toFixed(1) : '0.0';

        const activeAlerts = (db.prepare(`SELECT COUNT(*) as c FROM alerts WHERE client_id = ? AND resolved = 0`).get(c.id) as any).c;

        return {
          id: c.id,
          name: c.name,
          email: c.email,
          risk_profile: c.risk_profile,
          investment_goal: c.investment_goal,
          advisor: c.advisor,
          accounts: accounts.length,
          total_market_value: `$${totalMarketValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          unrealized_gain: `$${unrealizedGain.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} (${unrealizedPct}%)`,
          active_alerts: activeAlerts,
          onboarded_at: c.onboarded_at,
        };
      });

      const totalAUM = clients.reduce((sum, c) => {
        const accounts = db.prepare(`SELECT * FROM accounts WHERE client_id = ?`).all(c.id) as any[];
        let mv = 0;
        for (const acc of accounts) {
          mv += acc.cash_balance;
          const holdings = db.prepare(`SELECT * FROM holdings WHERE account_id = ?`).all(acc.id) as any[];
          for (const h of holdings) {
            mv += h.shares * h.current_price;
          }
        }
        return sum + mv;
      }, 0);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            summary: {
              total_clients: result.length,
              total_aum: `$${totalAUM.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            },
            clients: result,
          }, null, 2),
        }],
      };
    }
  );
}
