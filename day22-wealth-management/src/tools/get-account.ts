import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerGetAccount(server: McpServer) {
  server.tool(
    'get_account',
    'Get detailed view of a single investment account — holdings, recent transactions, performance, and allocation breakdown.',
    {
      account_id: z.number().describe('Account ID to retrieve'),
    },
    async ({ account_id }) => {
      const account = db.prepare(`
        SELECT a.*, c.name as client_name, c.risk_profile
        FROM accounts a
        JOIN clients c ON c.id = a.client_id
        WHERE a.id = ?
      `).get(account_id) as any;

      if (!account) {
        return { content: [{ type: 'text' as const, text: 'Account not found.' }] };
      }

      const holdings = db.prepare(`SELECT * FROM holdings WHERE account_id = ? ORDER BY (shares * current_price) DESC`).all(account_id) as any[];

      let totalMV = account.cash_balance;
      let totalCost = 0;

      const holdingDetails = holdings.map((h) => {
        const mv = h.shares * h.current_price;
        const cost = h.shares * h.cost_basis;
        totalMV += mv;
        totalCost += cost;

        return {
          symbol: h.symbol,
          name: h.name,
          asset_class: h.asset_class,
          sector: h.sector,
          shares: h.shares,
          cost_basis: `$${h.cost_basis.toFixed(2)}`,
          current_price: `$${h.current_price.toFixed(2)}`,
          market_value: `$${mv.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          weight: `${(mv / (totalMV - account.cash_balance + mv) * 100).toFixed(1)}%`,
          gain_loss: `$${(mv - cost).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          gain_loss_pct: `${((mv - cost) / cost * 100).toFixed(1)}%`,
        };
      });

      // Recalculate weights now that we have totalMV
      for (const h of holdingDetails) {
        const mvNum = parseFloat(h.market_value.replace(/[$,]/g, ''));
        h.weight = `${(mvNum / totalMV * 100).toFixed(1)}%`;
      }

      const recentTx = db.prepare(`
        SELECT * FROM transactions WHERE account_id = ? ORDER BY executed_at DESC LIMIT 10
      `).all(account_id) as any[];

      const txDetails = recentTx.map((tx) => ({
        type: tx.type,
        symbol: tx.symbol,
        shares: tx.shares,
        price: tx.price ? `$${tx.price.toFixed(2)}` : null,
        amount: `$${Math.abs(tx.amount).toLocaleString()}`,
        fee: tx.fee > 0 ? `$${tx.fee.toFixed(2)}` : null,
        date: tx.executed_at,
        notes: tx.notes,
      }));

      // Sector breakdown
      const sectorMap: Record<string, number> = {};
      for (const h of holdings) {
        const mv = h.shares * h.current_price;
        const sector = h.sector || 'Other';
        sectorMap[sector] = (sectorMap[sector] || 0) + mv;
      }
      const sectors = Object.entries(sectorMap)
        .map(([sector, val]) => ({ sector, value: `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, pct: `${(val / totalMV * 100).toFixed(1)}%` }))
        .sort((a, b) => parseFloat(b.pct) - parseFloat(a.pct));

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            account: {
              id: account.id,
              name: account.name,
              type: account.type,
              custodian: account.custodian,
              client: account.client_name,
              risk_profile: account.risk_profile,
              status: account.status,
            },
            summary: {
              total_market_value: `$${totalMV.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
              cash_balance: `$${account.cash_balance.toLocaleString()}`,
              invested: `$${(totalMV - account.cash_balance).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
              unrealized_gain: `$${(totalMV - totalCost - account.cash_balance).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
              positions: holdings.length,
            },
            holdings: holdingDetails,
            sector_breakdown: sectors,
            recent_transactions: txDetails,
          }, null, 2),
        }],
      };
    }
  );
}
