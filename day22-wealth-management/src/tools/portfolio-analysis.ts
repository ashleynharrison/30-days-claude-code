import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerPortfolioAnalysis(server: McpServer) {
  server.tool(
    'portfolio_analysis',
    'Run risk and allocation analysis on a client\'s portfolio. Returns diversification score, concentration risks, sector exposure, and rebalancing recommendations.',
    {
      client_id: z.number().describe('Client ID to analyze'),
    },
    async ({ client_id }) => {
      const client = db.prepare(`SELECT * FROM clients WHERE id = ?`).get(client_id) as any;
      if (!client) {
        return { content: [{ type: 'text' as const, text: 'Client not found.' }] };
      }

      const accounts = db.prepare(`SELECT * FROM accounts WHERE client_id = ?`).all(client_id) as any[];

      // Gather all holdings
      const allHoldings: any[] = [];
      let totalMV = 0;
      let totalCash = 0;

      for (const acc of accounts) {
        totalCash += acc.cash_balance;
        const holdings = db.prepare(`SELECT * FROM holdings WHERE account_id = ?`).all(acc.id) as any[];
        for (const h of holdings) {
          const mv = h.shares * h.current_price;
          totalMV += mv;
          allHoldings.push({ ...h, market_value: mv, account_name: acc.name, account_type: acc.type });
        }
      }
      totalMV += totalCash;

      // Asset class breakdown
      const assetClassMap: Record<string, number> = {};
      const sectorMap: Record<string, number> = {};
      const symbolMap: Record<string, { name: string; value: number; pct: number }> = {};

      for (const h of allHoldings) {
        assetClassMap[h.asset_class] = (assetClassMap[h.asset_class] || 0) + h.market_value;
        if (h.sector) {
          sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.market_value;
        }
        if (!symbolMap[h.symbol]) {
          symbolMap[h.symbol] = { name: h.name, value: 0, pct: 0 };
        }
        symbolMap[h.symbol].value += h.market_value;
      }
      assetClassMap['cash'] = totalCash;

      // Calculate percentages
      for (const sym of Object.values(symbolMap)) {
        sym.pct = (sym.value / totalMV) * 100;
      }

      // Concentration risks (any single position > 15%)
      const concentrationRisks = Object.entries(symbolMap)
        .filter(([, v]) => v.pct > 15)
        .map(([sym, v]) => ({
          symbol: sym,
          name: v.name,
          value: `$${v.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          pct: `${v.pct.toFixed(1)}%`,
          recommendation: `Consider trimming to below 10% (sell ~$${((v.value - totalMV * 0.10)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })})`,
        }))
        .sort((a, b) => parseFloat(b.pct) - parseFloat(a.pct));

      // Model comparison & drift
      const modelAllocs = db.prepare(`SELECT * FROM model_allocations WHERE risk_profile = ?`).all(client.risk_profile) as any[];
      const rebalanceActions: any[] = [];

      for (const m of modelAllocs) {
        const actualValue = assetClassMap[m.asset_class] || 0;
        const actualPct = (actualValue / totalMV) * 100;
        const drift = actualPct - m.target_pct;
        const outOfRange = actualPct < m.min_pct || actualPct > m.max_pct;

        if (outOfRange) {
          const targetValue = totalMV * (m.target_pct / 100);
          const diff = targetValue - actualValue;
          rebalanceActions.push({
            asset_class: m.asset_class,
            current: `${actualPct.toFixed(1)}%`,
            target: `${m.target_pct}%`,
            range: `${m.min_pct}%–${m.max_pct}%`,
            drift: `${drift >= 0 ? '+' : ''}${drift.toFixed(1)}%`,
            action: diff > 0 ? `Buy $${diff.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : `Sell $${Math.abs(diff).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          });
        }
      }

      // Diversification score (0-100)
      const uniqueSymbols = Object.keys(symbolMap).length;
      const uniqueAssetClasses = Object.keys(assetClassMap).length;
      const uniqueSectors = Object.keys(sectorMap).length;
      const maxConcentration = Math.max(...Object.values(symbolMap).map((v) => v.pct), 0);
      const hasInternational = allHoldings.some((h) => h.asset_class === 'equity' && h.sector === 'International');

      let diversificationScore = 0;
      diversificationScore += Math.min(uniqueSymbols * 3, 25); // up to 25 for position count
      diversificationScore += Math.min(uniqueAssetClasses * 5, 20); // up to 20 for asset class variety
      diversificationScore += Math.min(uniqueSectors * 3, 20); // up to 20 for sector variety
      diversificationScore += maxConcentration < 10 ? 15 : maxConcentration < 20 ? 10 : maxConcentration < 30 ? 5 : 0; // up to 15 for low concentration
      diversificationScore += hasInternational ? 10 : 0; // 10 for intl exposure
      diversificationScore += concentrationRisks.length === 0 ? 10 : 0; // 10 for no concentration risks
      diversificationScore = Math.min(diversificationScore, 100);

      const scoreLabel = diversificationScore >= 80 ? 'Well Diversified' :
        diversificationScore >= 60 ? 'Moderately Diversified' :
        diversificationScore >= 40 ? 'Needs Improvement' : 'Concentrated';

      // Top holdings
      const topHoldings = Object.entries(symbolMap)
        .sort((a, b) => b[1].value - a[1].value)
        .slice(0, 10)
        .map(([sym, v]) => ({
          symbol: sym,
          name: v.name,
          value: `$${v.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          pct: `${v.pct.toFixed(1)}%`,
        }));

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            client: { name: client.name, risk_profile: client.risk_profile },
            portfolio_value: `$${totalMV.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            diversification: {
              score: diversificationScore,
              label: scoreLabel,
              unique_positions: uniqueSymbols,
              asset_classes: uniqueAssetClasses,
              sectors: uniqueSectors,
              has_international: hasInternational,
            },
            top_holdings: topHoldings,
            concentration_risks: concentrationRisks.length > 0 ? concentrationRisks : 'None — no single position exceeds 15%',
            rebalance_recommendations: rebalanceActions.length > 0 ? rebalanceActions : 'Portfolio is within target allocation ranges',
            sector_exposure: Object.entries(sectorMap)
              .map(([s, v]) => ({ sector: s, value: `$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, pct: `${(v / totalMV * 100).toFixed(1)}%` }))
              .sort((a, b) => parseFloat(b.pct) - parseFloat(a.pct)),
          }, null, 2),
        }],
      };
    }
  );
}
