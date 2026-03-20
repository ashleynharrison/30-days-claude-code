import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerGetPortfolio(server: McpServer) {
  server.tool(
    'get_portfolio',
    'Get a client\'s full portfolio breakdown across all accounts. Shows holdings, allocation, performance, and comparison to model portfolio.',
    {
      client_id: z.number().describe('Client ID to retrieve portfolio for'),
    },
    async ({ client_id }) => {
      const client = db.prepare(`SELECT * FROM clients WHERE id = ?`).get(client_id) as any;
      if (!client) {
        return { content: [{ type: 'text' as const, text: 'Client not found.' }] };
      }

      const accounts = db.prepare(`SELECT * FROM accounts WHERE client_id = ? ORDER BY type`).all(client_id) as any[];

      const allHoldings: any[] = [];
      const accountDetails = accounts.map((acc) => {
        const holdings = db.prepare(`SELECT * FROM holdings WHERE account_id = ?`).all(acc.id) as any[];
        let accountMV = acc.cash_balance;
        let accountCost = 0;

        const holdingDetails = holdings.map((h) => {
          const mv = h.shares * h.current_price;
          const cost = h.shares * h.cost_basis;
          accountMV += mv;
          accountCost += cost;
          allHoldings.push({ ...h, market_value: mv, cost_total: cost });

          return {
            symbol: h.symbol,
            name: h.name,
            asset_class: h.asset_class,
            sector: h.sector,
            shares: h.shares,
            cost_basis: `$${h.cost_basis.toFixed(2)}`,
            current_price: `$${h.current_price.toFixed(2)}`,
            market_value: `$${mv.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            gain_loss: `$${(mv - cost).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            gain_loss_pct: `${((mv - cost) / cost * 100).toFixed(1)}%`,
          };
        });

        return {
          id: acc.id,
          name: acc.name,
          type: acc.type,
          custodian: acc.custodian,
          cash_balance: `$${acc.cash_balance.toLocaleString()}`,
          market_value: `$${accountMV.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          unrealized_gain: `$${(accountMV - accountCost - acc.cash_balance).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          holdings: holdingDetails,
        };
      });

      // Calculate overall allocation
      const totalMV = allHoldings.reduce((s, h) => s + h.market_value, 0) + accounts.reduce((s, a) => s + a.cash_balance, 0);
      const allocationMap: Record<string, number> = {};
      for (const h of allHoldings) {
        allocationMap[h.asset_class] = (allocationMap[h.asset_class] || 0) + h.market_value;
      }
      const cashTotal = accounts.reduce((s, a) => s + a.cash_balance, 0);
      allocationMap['cash'] = cashTotal;

      const allocation = Object.entries(allocationMap).map(([cls, val]) => ({
        asset_class: cls,
        value: `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        pct: `${(val / totalMV * 100).toFixed(1)}%`,
      })).sort((a, b) => parseFloat(b.pct) - parseFloat(a.pct));

      // Compare to model allocation
      const modelAllocs = db.prepare(`SELECT * FROM model_allocations WHERE risk_profile = ?`).all(client.risk_profile) as any[];
      const driftAnalysis = modelAllocs.map((m) => {
        const actual = ((allocationMap[m.asset_class] || 0) / totalMV * 100);
        const drift = actual - m.target_pct;
        return {
          asset_class: m.asset_class,
          target: `${m.target_pct}%`,
          actual: `${actual.toFixed(1)}%`,
          drift: `${drift >= 0 ? '+' : ''}${drift.toFixed(1)}%`,
          in_range: actual >= m.min_pct && actual <= m.max_pct,
        };
      });

      const totalCost = allHoldings.reduce((s, h) => s + h.cost_total, 0);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            client: {
              name: client.name,
              risk_profile: client.risk_profile,
              investment_goal: client.investment_goal,
              advisor: client.advisor,
            },
            portfolio_summary: {
              total_market_value: `$${totalMV.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
              total_cost_basis: `$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
              total_unrealized_gain: `$${(totalMV - totalCost - cashTotal).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
              accounts: accounts.length,
              positions: allHoldings.length,
            },
            allocation,
            drift_analysis: driftAnalysis,
            accounts: accountDetails,
          }, null, 2),
        }],
      };
    }
  );
}
