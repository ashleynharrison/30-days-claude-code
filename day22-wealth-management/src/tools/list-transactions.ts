import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerListTransactions(server: McpServer) {
  server.tool(
    'list_transactions',
    'Search and filter transactions across accounts. Filter by client, account, type, or symbol. Shows totals by transaction type.',
    {
      client_id: z.number().optional().describe('Filter by client ID'),
      account_id: z.number().optional().describe('Filter by account ID'),
      type: z.string().optional().describe('Filter by type: buy, sell, dividend, deposit, withdrawal, fee'),
      symbol: z.string().optional().describe('Filter by ticker symbol'),
      limit: z.number().optional().describe('Number of results (default 20)'),
    },
    async ({ client_id, account_id, type, symbol, limit }) => {
      let query = `
        SELECT t.*, a.name as account_name, a.type as account_type, c.name as client_name
        FROM transactions t
        JOIN accounts a ON a.id = t.account_id
        JOIN clients c ON c.id = a.client_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (client_id) {
        query += ` AND c.id = ?`;
        params.push(client_id);
      }
      if (account_id) {
        query += ` AND t.account_id = ?`;
        params.push(account_id);
      }
      if (type) {
        query += ` AND t.type = ?`;
        params.push(type);
      }
      if (symbol) {
        query += ` AND t.symbol = ?`;
        params.push(symbol.toUpperCase());
      }

      query += ` ORDER BY t.executed_at DESC LIMIT ?`;
      params.push(limit || 20);

      const transactions = db.prepare(query).all(...params) as any[];

      if (transactions.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No transactions found matching your criteria.' }] };
      }

      // Summarize by type
      const typeSummary: Record<string, { count: number; total: number }> = {};
      for (const tx of transactions) {
        if (!typeSummary[tx.type]) {
          typeSummary[tx.type] = { count: 0, total: 0 };
        }
        typeSummary[tx.type].count++;
        typeSummary[tx.type].total += Math.abs(tx.amount);
      }

      const summary = Object.entries(typeSummary).map(([t, v]) => ({
        type: t,
        count: v.count,
        total: `$${v.total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      }));

      const result = transactions.map((tx) => ({
        id: tx.id,
        client: tx.client_name,
        account: tx.account_name,
        type: tx.type,
        symbol: tx.symbol,
        shares: tx.shares,
        price: tx.price ? `$${tx.price.toFixed(2)}` : null,
        amount: `$${Math.abs(tx.amount).toLocaleString()}`,
        fee: tx.fee > 0 ? `$${tx.fee.toFixed(2)}` : null,
        date: tx.executed_at,
        notes: tx.notes,
      }));

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ summary, transactions: result, count: result.length }, null, 2),
        }],
      };
    }
  );
}
